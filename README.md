# ZeroIntern

ZeroIntern is a project-based learning platform where developers build production-style projects, submit their work for review, and earn verifiable certificates after completing a track.

## What It Includes

- Google OAuth authentication through Supabase
- Guided tracks with four projects per track
- Track enrollment and project progress tracking
- Repository and live URL submissions
- Admin approval and rejection workflow with feedback
- Re-submission flow for rejected projects
- Automatic certificate creation after four approvals in a track
- SHA-256 certificate integrity hashes
- PDF certificate generation with QR verification
- Public, shareable certificate verification pages
- Responsive, keyboard-accessible interface

## Tech Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL
- PDFKit and QRCode
- Zod and React Hook Form

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A Google OAuth application configured in Supabase

## Local Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create `.env.local` in the project root:

	```env
	NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
	NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
	SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
	NEXTAUTH_SECRET=your-long-random-secret
	```

	Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or commit `.env.local`.

3. Configure Google under Supabase **Authentication > Providers > Google**. Use `http://localhost:3000/api/auth/callback` as the local callback URL.

4. Apply `supabase/20260902_add_project_problem.sql` in the Supabase SQL editor.

5. Seed the initial tracks and projects:

	```bash
	npx tsx scripts/seed.ts
	```

6. Start the app:

	```bash
	npm run dev
	```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript validation |
| `npx tsx scripts/seed.ts` | Seed tracks and projects |

## Main Routes

### Student

- `/` - Landing page
- `/explore` - Browse tracks
- `/explore/[trackId]` - Track overview and enrollment
- `/dashboard` - Enrolled tracks and progress
- `/dashboard/tracks/[trackId]` - Track projects
- `/dashboard/projects/[projectId]` - Project brief and submission
- `/dashboard/certificates` - Earned certificates

### Admin

- `/auth/admin-login` - Admin sign-in
- `/admin` - Submission overview and statistics
- `/admin/submissions` - Filter and review submissions
- `/admin/submissions/[submissionId]` - Approve or reject submissions

### Public Verification

- `/certificate/verify/[code]` - Public certificate verification
- `/api/certificates/verify/[code]` - Public verification API
- `/api/certificates/download?code=...` - Authenticated PDF download
- `/api/certificates/download?code=...&preview=true` - Inline PDF preview

## Certificate Lifecycle

1. A student submits repository and live project URLs.
2. An administrator approves or rejects the submission with feedback.
3. Rejected work can be updated and resubmitted.
4. After all four projects in one track are approved, ZeroIntern creates one certificate.
5. The certificate stores a unique credential code and SHA-256 hash derived from the student ID, track ID, and issue timestamp.
6. The PDF includes a QR code linking to its public verification page.

## Deployment

Deploy to Vercel or another Node-compatible hosting provider.

1. Add all `.env.local` values to the provider's environment configuration.
2. Apply the Supabase migration in production.
3. Add `https://your-domain.com/api/auth/callback` to the Google OAuth callback URLs.
4. Set the production site URL in Supabase Authentication settings.
5. Build and start with `npm run build` and `npm run start`.

## Security Notes

- Service-role operations remain server-side only.
- Public verification exposes certificate and approved-project information only.
- User submissions and certificates are protected by Supabase Row Level Security.
- Admin sessions use a signed HTTP-only cookie in production.
- Never commit secrets or service-role keys.

## Verification Checklist

Before launch, test Google authentication, enrollment, submissions, rejection and re-submission, admin approval, certificate creation after four approvals, PDF preview/download, QR verification, public verification without login, and mobile layouts at 375px, 768px, and desktop widths.

The repository currently passes TypeScript validation, ESLint, and the production build.

## Roadmap

- Email notifications
- Additional Go, Rust, and DevOps tracks
- Employer-facing credential views
- Code review and feedback history
- Leaderboards and learner analytics
