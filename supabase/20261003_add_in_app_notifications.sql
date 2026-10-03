begin;

-- Broadcast announcements are independent of email opt-in.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 2000),
  path text not null default '/dashboard' check (path in ('/dashboard', '/dashboard/settings', '/dashboard/certificates')),
  created_at timestamptz not null default now()
);
create table if not exists public.announcement_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, announcement_id)
);
create index if not exists announcements_created_at on public.announcements(created_at desc);
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
revoke all on public.announcements, public.announcement_reads from anon, authenticated;
grant select on public.announcements to authenticated;
grant select, insert on public.announcement_reads to authenticated;
grant all on public.announcements, public.announcement_reads to service_role;
drop policy if exists "Read announcements" on public.announcements;
create policy "Read announcements" on public.announcements for select to authenticated using (true);
drop policy if exists "Read own announcement receipts" on public.announcement_reads;
create policy "Read own announcement receipts" on public.announcement_reads for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Mark own announcements read" on public.announcement_reads;
create policy "Mark own announcements read" on public.announcement_reads for insert to authenticated with check (auth.uid() = user_id);

commit;
