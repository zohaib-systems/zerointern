-- Run after 20260902_add_project_problem.sql on a new database.
-- Safe to rerun, including after manually adding TEXT / TEXT[] columns.
-- This prepares metadata only. Run scripts/seed.ts afterward to seed projects.
begin;

alter table public.projects
  add column if not exists difficulty_level varchar(20) default 'beginner',
  add column if not exists platform_name varchar(100),
  add column if not exists estimated_hours integer,
  add column if not exists prerequisites jsonb default '[]'::jsonb,
  add column if not exists real_world_value text,
  add column if not exists skills_learned text[] default array[]::text[];

-- Preserve plain text as one entry; preserve existing JSON / PostgreSQL arrays.
-- Also handle JSON arrays previously serialized into a TEXT column.
create or replace function pg_temp.project_metadata_array(value jsonb)
returns jsonb language plpgsql as $$
declare
  parsed jsonb;
begin
  if value is null or value = 'null'::jsonb then
    return '[]'::jsonb;
  end if;
  if jsonb_typeof(value) = 'array' then
    return value;
  end if;
  if jsonb_typeof(value) = 'string' then
    if btrim(value #>> '{}') = '' then
      return '[]'::jsonb;
    end if;
    begin
      parsed := (value #>> '{}')::jsonb;
      if jsonb_typeof(parsed) = 'array' then
        return parsed;
      end if;
    exception when invalid_text_representation then
      null;
    end;
  end if;
  return jsonb_build_array(value);
end;
$$;

create or replace function pg_temp.project_metadata_text_array(value jsonb)
returns text[] language sql as $$
  select array(
    select jsonb_array_elements_text(pg_temp.project_metadata_array(value))
  );
$$;

-- Drop old defaults before converting because TEXT / JSONB defaults differ.
alter table public.projects
  alter column prerequisites drop default,
  alter column skills_learned drop default;

alter table public.projects
  alter column prerequisites type jsonb
    using pg_temp.project_metadata_array(to_jsonb(prerequisites)),
  alter column skills_learned type text[]
    using pg_temp.project_metadata_text_array(to_jsonb(skills_learned));

update public.projects
set difficulty_level = 'beginner'
where project_order <= 4 or difficulty_level is null;

alter table public.projects
  alter column difficulty_level set default 'beginner',
  alter column difficulty_level set not null,
  alter column prerequisites set default '[]'::jsonb,
  alter column prerequisites set not null,
  alter column skills_learned set default array[]::text[],
  alter column skills_learned set not null;

-- Recreate named checks so partially applied manual changes get validated too.
alter table public.projects
  drop constraint if exists projects_difficulty_level_check,
  drop constraint if exists projects_estimated_hours_check,
  drop constraint if exists projects_prerequisites_array_check;

alter table public.projects
  add constraint projects_difficulty_level_check
    check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  add constraint projects_estimated_hours_check
    check (estimated_hours is null or estimated_hours > 0),
  add constraint projects_prerequisites_array_check
    check (jsonb_typeof(prerequisites) = 'array');

commit;

-- Verify the resulting metadata column types.
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'projects'
  and column_name in (
    'difficulty_level', 'platform_name', 'estimated_hours',
    'prerequisites', 'real_world_value', 'skills_learned'
  )
order by ordinal_position;
