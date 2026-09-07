begin;

-- Additive follow-up to 20260907_add_onboarding.sql. Existing quiz results
-- retain the original recommendation rules; no active tracks are changed.
alter table public.onboarding_responses
  add column if not exists technology_preference text not null default 'not-sure'
  check (technology_preference in ('javascript', 'python', 'php', 'not-sure'));

commit;
