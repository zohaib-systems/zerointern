# Project status

Last updated: 2026-10-10. This document separates repository evidence from remote verification. Update it at the end of meaningful work.

## Repository evidence

The working tree was clean before the documentation update; that documentation remains uncommitted alongside the authorized certificate fix. Recent commits present locally:

| Commit | Change |
| --- | --- |
| `8b1105b` | Updated email body |
| `34ae4f3` | Added in-app notification system |
| `8be5b04` | Updated normal seal |
| `6b2c457` | Advanced certificate |

These commits prove local repository history, not remote push or production deployment.

## Feature state

| Feature | Implementation / validation | Production evidence |
| --- | --- | --- |
| Supabase Google sign-in and admin session | Existing application code; see architecture | Configured production URLs are documented; no fresh live smoke test in this documentation task |
| Onboarding and beginner/advanced projects | Existing quiz, track selection, prerequisites, and seed data | Live schema/seed state not inspected in this task |
| Advanced circular certificate seal | Implemented; threshold checks and generated PDF reviewed in prior session | Deployment not independently verified |
| Equal seal image boxes | Both render at 100 points in the same position; targeted lint passed in prior session | Deployment not independently verified |
| In-app announcements | Implemented; isolated database/RLS, API, and mocked browser checks passed; lint, TypeScript, and build passed in prior session | User reported completion after migration instructions; live migration and deployment not independently verified |
| Personalized email redesign | Implemented and committed locally; template escaping, worker authorization, lint, TypeScript, build, and 390px preview checks passed in prior session | No production inbox test or real email sent by the agent during redesign |
| Beginner certificate issuance | Fixed locally; distinct beginner approvals, repeat/concurrent issuance, seal upgrade, lookup errors, and repair rerun/hash checks passed | Pending deployment and one-time SQL repair |
| Admin certificate review | Added a Certificates tab to `/admin/submissions` with issued count, paginated credential list, and inline PDF preview links; lint, TypeScript, and production build passed | Not deployed or production verified |
| AI handoff documentation | Added/updated in this task | Documentation only; no deployment required |

Prior-session checks describe evidence from that work, not tests rerun for unrelated changes. Certificate fix checks are recorded separately below. Browser mocks and local previews do not prove Supabase integration or real email-client delivery.

## Migration ledger

| SQL file | Application status / evidence |
| --- | --- |
| `20260902_add_project_problem.sql` | Existing base schema dependency; live application history unverified |
| `20260906_add_advanced_project_metadata.sql` | Existing metadata dependency; live application history unverified |
| `20260907_add_onboarding.sql` | Existing onboarding dependency; live application history unverified |
| `20260907_add_technology_preference.sql` | Existing quiz dependency; live application history unverified |
| `20260913_add_email_notifications.sql` | Required for email settings/queue; live application history and worker schedule unverified |
| `20261003_add_in_app_notifications.sql` | User-reported complete in the preceding notification conversation; not independently checked against Supabase |

Do not blindly rerun the base schema or assume a missing ledger entry means the migration was never applied. Inspect the intended environment before changing it.

Additional data repair: 20261003_repair_beginner_certificates.sql is prepared and isolated-test verified; production execution is pending. This is a data repair, not a schema change.

## Open items

1. **Deploy beginner issuance fix and repair missed credentials:** the user confirmed the bug and authorized this correction. Future fourth beginner approvals now issue a certificate. Apply `supabase/20261003_repair_beginner_certificates.sql` for learners already eligible before deployment; it preserves existing credentials and may queue normal certificate emails for opted-in learners. The repair has been tested only in isolated PGlite, not executed against production.
2. Verify the deployed commit on Vercel and record it below. A clean working tree does not establish deployment.
3. Verify the announcement schema and per-user read behavior in production using test accounts.
4. Confirm Gmail configuration, Vault secret, and Cron schedule privately, then test all three messages with an opted-in test recipient. Check preference opt-out and inbox arrival. Local previews do not establish Gmail/Outlook rendering.

## Certificate fix validation

- `node scripts/check-certificate-issuance.mjs`: passed. Covers four beginner approvals with advanced projects still outstanding, duplicate and unrelated approvals, repeat/concurrent checks, lookup errors, seal upgrade preserving metadata, and isolated SQL repair/hash compatibility/rerun.
- Lint, TypeScript, and production build: passed for the certificate fix.
- Production deployment and SQL repair: pending; no live database writes performed by the agent.

## Deployment record

- Environment: production, `https://zerointern.vercel.app`.
- Supabase project: `https://xjviagepjrqnlvebsoec.supabase.co`.
- Last independently verified deployed commit: not recorded.
- Last independently verified migration application: not recorded.
- Last production smoke-test date/results: not recorded.

For each future deployment, add date, environment, deployed commit, required/applied migrations with evidence, validation results, and remaining issues. Do not include tokens, passwords, connection strings containing credentials, or user-private message content.
