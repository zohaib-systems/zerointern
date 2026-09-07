# Supabase SQL setup

## Smart onboarding

### Technology preference follow-up

If the original onboarding migration has already been applied, run only
`20260907_add_technology_preference.sql` next, before deploying the four-question
quiz. It adds `technology_preference` with a default of `not-sure` for older
responses. Existing active tracks, completion status, and progress are unchanged.
Fresh databases should apply it immediately after `20260907_add_onboarding.sql`.

The questions are experience, goal, technology preference, and learning pace.
An explicit JavaScript, Python, or PHP choice determines the recommended track
regardless of experience, goal, or pace. `not-sure` uses the original rules below.
Pace controls the suggested weeks and weekly hours, not a guaranteed completion
date. API submissions require all four answers; existing saved answers default
to `not-sure` when read.

### Initial onboarding setup

Before deploying onboarding, run `20260907_add_onboarding.sql` in the Supabase
SQL Editor for the existing ZeroIntern project. This repository uses standalone
SQL files, not a configured Supabase CLI migration history; `supabase migration up`
will not apply this file automatically.

The migration adds onboarding state to `public.users` (not `auth.users`), an
RLS-protected response table with one row per user, and the authenticated
`select_onboarding_track` function. Selection atomically enrolls the signed-in
user and updates their active track. Skipping the quiz requires only selecting a
track; it does not insert incomplete quiz answers. Existing enrollments,
submissions, and certificates remain intact. Existing users without onboarding
state will choose a track on their next dashboard visit.

Track IDs are resolved from the existing `full-stack-js`, `python-backend`, and
`php-laravel` slugs. Seed these tracks before using the quiz. For `not-sure`, the 6-week and
24+-week choices override the experience/goal matrix; 12 weeks uses that matrix.
Displayed times are estimates, and project counts come from the database.

Validation:

```powershell
node scripts/check-onboarding.mjs
npm.cmd exec --yes --package=@playwright/test -- node scripts/check-onboarding-browser.mjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

The browser script uses installed Microsoft Edge and real quiz components with
mocked API/router behavior. It checks 375px, 768px, and 1280px widths and writes
screenshots under `.next/onboarding-browser-check/`. It does not connect to
Supabase or change real accounts.

After applying the migration, verify with a test account: Google sign-in opens
the welcome screen; Back preserves answers; completing the quiz and refreshing
restores results; manual selection and recommended selection both open the
selected track on the dashboard; repeat sign-in skips onboarding; Switch track
preserves prior work. Check keyboard radio navigation and 375px/768px/1280px
layouts. Confirm a second account cannot read or update the first account's
responses, and retrying selection creates no duplicate enrollments.

Apply the SQL before deploying the code: the new routes and auth callback
require the added columns and function. No environment variable changes are
required.

## Project metadata

For an existing ZeroIntern database, run the entire
`20260906_add_advanced_project_metadata.sql` file in the Supabase SQL Editor.
For a fresh database, run `20260902_add_project_problem.sql` first, then the
metadata migration. Do not rerun the base schema merely to update metadata.

The metadata migration runs in a transaction and can be rerun. It adds missing
columns, marks project orders 1?4 as beginner, and validates difficulty and
positive hour estimates. It preserves advanced projects at orders 5?8.

`prerequisites` uses JSONB arrays to match the application and seed script.
Existing plain TEXT values become single-entry arrays; existing arrays are
preserved. `skills_learned` uses TEXT[]; existing JSONB arrays are converted.
`real_world_value` is TEXT. Existing compatible TEXT difficulty/platform columns
are retained instead of narrowing them and risking truncation.

The final query displays column types for verification. If any statement fails,
the transaction rolls back; resolve the reported error before seeding.

After the migration succeeds, run the existing project seed from the repository:

```powershell
npx.cmd tsx scripts/seed.ts
```

The seed uses server-side environment credentials and resolves real track UUIDs
by slug. It updates or inserts projects by track and title, retaining existing
project IDs. It includes the 12 beginner and 12 advanced projects (four advanced
projects per track). Do not insert placeholder IDs such as `track-1-js` into the
UUID `track_id` column. No project inserts are required in the SQL Editor.
