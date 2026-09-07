begin;

-- Profiles belong in public.users; leave Supabase-managed auth.users intact.
alter table public.users
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists active_track_id uuid references public.tracks(id) on delete set null,
  add column if not exists experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists goal text check (goal in ('job', 'skills', 'portfolio', 'current-job'));

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced')),
  goal text not null check (goal in ('job', 'skills', 'portfolio', 'current-job')),
  timeline text not null check (timeline in ('6weeks', '12weeks', '24+weeks')),
  recommended_track_id uuid references public.tracks(id) on delete set null,
  recommended_track_name text,
  recommendation_reason text,
  quiz_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_onboarding_completed on public.onboarding_responses(quiz_completed);
alter table public.onboarding_responses enable row level security;
revoke all on public.onboarding_responses from anon;
grant select, insert, update on public.onboarding_responses to authenticated;
drop policy if exists "Read own onboarding" on public.onboarding_responses;
create policy "Read own onboarding" on public.onboarding_responses for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own onboarding" on public.onboarding_responses;
create policy "Insert own onboarding" on public.onboarding_responses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own onboarding" on public.onboarding_responses;
create policy "Update own onboarding" on public.onboarding_responses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Enrollment and active-track selection commit together. Repeated selections
-- preserve enrollment dates, submissions, and certificates.
create or replace function public.select_onboarding_track(p_track_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not exists (select 1 from public.tracks where id = p_track_id and slug in ('full-stack-js', 'python-backend', 'php-laravel')) then
    raise exception 'Track not found' using errcode = 'P0002';
  end if;
  -- Serialize selections for the same user, including concurrent retries.
  perform 1 from public.users where id = current_user_id for update;
  if not found then raise exception 'Profile not found' using errcode = 'P0002'; end if;
  insert into public.track_enrollments(user_id, track_id) values (current_user_id, p_track_id) on conflict (user_id, track_id) do nothing;
  update public.users set active_track_id = p_track_id, onboarding_completed = true,
    experience_level = coalesce((select experience_level from public.onboarding_responses where user_id = current_user_id), experience_level),
    goal = coalesce((select goal from public.onboarding_responses where user_id = current_user_id), goal),
    updated_at = now()
  where id = current_user_id;
end;
$$;
revoke all on function public.select_onboarding_track(uuid) from public, anon;
grant execute on function public.select_onboarding_track(uuid) to authenticated;
commit;
