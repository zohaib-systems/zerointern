-- Repair credentials missed by the previous all-project issuance rule.
-- Run once after reviewing the eligible learner/track count below; safe to rerun.
-- Existing credentials are preserved. New credentials use the repair time as issued_at.
-- The existing certificate-email trigger applies to newly inserted credentials.
begin;

-- Preview the number of missing credentials eligible for repair.
select count(*) as eligible_missing_certificates
from (
  select s.user_id, p.track_id
  from public.submissions s
  join public.projects p on p.id = s.project_id
  where s.status = 'APPROVED' and p.difficulty_level = 'beginner'
    and not exists (
      select 1 from public.certificates c
      where c.user_id = s.user_id and c.track_id = p.track_id
    )
  group by s.user_id, p.track_id
  having count(distinct p.id) >= 4
) eligible;

-- Core PostgreSQL SHA-256 matches the application canonical ISO timestamp hash.
with eligible as (
  select s.user_id, p.track_id
  from public.submissions s
  join public.projects p on p.id = s.project_id
  where s.status = 'APPROVED' and p.difficulty_level = 'beginner'
    and not exists (
      select 1 from public.certificates c
      where c.user_id = s.user_id and c.track_id = p.track_id
    )
  group by s.user_id, p.track_id
  having count(distinct p.id) >= 4
), issuance as (
  select date_trunc('milliseconds', statement_timestamp()) as issued_at
)
insert into public.certificates(user_id, track_id, issued_at, crypto_hash, verification_code)
select e.user_id, e.track_id, i.issued_at,
  encode(sha256(convert_to(
    e.user_id::text || e.track_id::text ||
    to_char(i.issued_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'UTF8'
  )), 'hex'),
  'ZI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
from eligible e cross join issuance i
on conflict (user_id, track_id) do nothing;

commit;
