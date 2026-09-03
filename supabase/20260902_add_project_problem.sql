create table if not exists public.tracks (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	slug text unique not null,
	description text not null,
	level text not null check (level in ('beginner', 'intermediate', 'advanced')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.users (
	id uuid primary key references auth.users(id) on delete cascade,
	email text unique not null,
	name text,
	profile_pic text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.projects (
	id uuid primary key default gen_random_uuid(),
	track_id uuid not null references public.tracks(id) on delete cascade,
	title text not null,
	description text not null,
	problem text,
	brief text not null,
	resources jsonb not null default '[]'::jsonb,
	concepts jsonb not null default '[]'::jsonb,
	project_order integer not null check (project_order > 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (track_id, title)
);

alter table public.projects
add column if not exists problem text;

create table if not exists public.track_enrollments (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	track_id uuid not null references public.tracks(id) on delete cascade,
	enrolled_at timestamptz not null default now(),
	unique (user_id, track_id)
);

create table if not exists public.submissions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	project_id uuid not null references public.projects(id) on delete cascade,
	repo_url text not null,
	live_url text not null,
	status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
	admin_notes text,
	submitted_at timestamptz not null default now(),
	approved_at timestamptz,
	rejected_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, project_id)
);

alter table public.submissions add column if not exists rejected_at timestamptz;

create table if not exists public.certificates (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	track_id uuid not null references public.tracks(id) on delete cascade,
	issued_at timestamptz not null default now(),
	crypto_hash text not null,
	verification_code text unique not null,
	download_count integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, track_id)
);

alter table public.tracks enable row level security;
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.track_enrollments enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Anyone can read tracks" on public.tracks;
create policy "Anyone can read tracks" on public.tracks for select using (true);

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Anyone can read projects" on public.projects;
create policy "Anyone can read projects" on public.projects for select using (true);

drop policy if exists "Users can read own enrollments" on public.track_enrollments;
create policy "Users can read own enrollments" on public.track_enrollments for select using (auth.uid() = user_id);

drop policy if exists "Users can create own enrollments" on public.track_enrollments;
create policy "Users can create own enrollments" on public.track_enrollments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can read own submissions" on public.submissions;
create policy "Users can read own submissions" on public.submissions for select using (auth.uid() = user_id);

drop policy if exists "Users can create own submissions" on public.submissions;
create policy "Users can create own submissions" on public.submissions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own submissions" on public.submissions;
create policy "Users can update own submissions" on public.submissions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can read own certificates" on public.certificates;
create policy "Users can read own certificates" on public.certificates for select using (auth.uid() = user_id);
