begin;

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
grant select, insert, update on public.notification_preferences to authenticated;
grant select on public.notification_preferences to service_role;
drop policy if exists "Own notification preferences" on public.notification_preferences;
create policy "Own notification preferences" on public.notification_preferences
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('approved', 'rejected', 'certificate')),
  title text not null,
  feedback text,
  path text not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','skipped','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
alter table public.email_notifications enable row level security;
revoke all on public.email_notifications from anon, authenticated;
grant all on public.email_notifications to service_role;
create index if not exists email_notifications_pending on public.email_notifications(available_at, created_at) where status = 'pending';

-- Triggers record events atomically with the business change. A new review after
-- resubmission creates a new event, even though the submission ID is unchanged.
create or replace function public.queue_review_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.status is distinct from new.status and new.status in ('APPROVED','REJECTED') then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'Only the review service can approve or reject submissions';
    end if;
    if exists (select 1 from public.notification_preferences where user_id = new.user_id and email_enabled) then
      insert into public.email_notifications(user_id, kind, title, feedback, path)
      select new.user_id, case new.status when 'APPROVED' then 'approved' else 'rejected' end,
        p.title, new.admin_notes, '/dashboard/projects/' || p.id::text
      from public.projects p where p.id = new.project_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists queue_review_email on public.submissions;
create trigger queue_review_email after update on public.submissions
  for each row execute function public.queue_review_email();

create or replace function public.queue_certificate_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.notification_preferences where user_id = new.user_id and email_enabled) then
    insert into public.email_notifications(user_id, kind, title, path)
    select new.user_id, 'certificate', t.title, '/dashboard/certificates'
    from public.tracks t where t.id = new.track_id;
  end if;
  return new;
end $$;
drop trigger if exists queue_certificate_email on public.certificates;
create trigger queue_certificate_email after insert on public.certificates
  for each row execute function public.queue_certificate_email();

create table if not exists public.email_daily_budget (
  day date primary key,
  attempts integer not null default 0
);
alter table public.email_daily_budget enable row level security;
revoke all on public.email_daily_budget from anon, authenticated;
grant all on public.email_daily_budget to service_role;

create or replace function public.claim_email_notification()
returns setof public.email_notifications
language plpgsql security definer set search_path = '' as $$
declare candidate uuid; used integer; today date := (now() at time zone 'UTC')::date;
begin
  -- Serialize budget accounting across concurrent worker invocations.
  perform pg_catalog.pg_advisory_xact_lock(9132026);
  -- SMTP acceptance is uncertain after a crash: require manual inspection,
  -- rather than automatically resending a potentially delivered message.
  update public.email_notifications set status = 'failed', last_error = 'Worker interrupted; inspect mailbox before retry'
    where status = 'processing' and locked_at < now() - interval '5 minutes';
  insert into public.email_daily_budget(day) values (today) on conflict do nothing;
  select attempts into used from public.email_daily_budget where day = today;
  if used >= 100 then return; end if;
  select id into candidate from public.email_notifications
    where status = 'pending' and available_at <= now() and attempts < 5
    order by created_at for update skip locked limit 1;
  if candidate is null then return; end if;
  update public.email_daily_budget set attempts = attempts + 1 where day = today;
  return query update public.email_notifications
    set status = 'processing', attempts = attempts + 1, locked_at = now()
    where id = candidate returning *;
end $$;

revoke all on function public.queue_review_email() from public, anon, authenticated;
revoke all on function public.queue_certificate_email() from public, anon, authenticated;
revoke all on function public.claim_email_notification() from public, anon, authenticated;
grant execute on function public.claim_email_notification() to service_role;
commit;
