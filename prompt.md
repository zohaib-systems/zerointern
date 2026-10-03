# Reusable AI project prompt

Paste the following into a new AI session, then replace the task placeholder.

---

You are working on ZeroIntern in this repository.

Before making changes, read AGENTS.md, README.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, and docs/STATUS.md. Inspect Git status, the current code relevant to the task, and any more specific repository instructions. For Next.js changes, read the relevant installed guide in node_modules/next/dist/docs/ before writing code.

Follow the existing architecture and accepted decisions. Preserve unrelated changes and behavior. Keep Supabase Auth; do not migrate authentication to NextAuth. Never print, commit, or expose secrets, environment file contents, service-role keys, passwords, or private user data. Do not remove integration-managed environment variables without verifying their ownership and usage.

Complete the requested change within the authorized scope. Make routine implementation choices independently; ask for clarification only when missing information materially affects the outcome. If a requested plan requires approval before implementation, respect that boundary. Explain any discrepancy between intended behavior, documentation, and current code rather than silently changing an unrelated business rule. Do not change certificate issuance merely to update the certificate seal.

Use a feature branch when appropriate and permitted. Run checks appropriate to the change; for application changes, run npm run lint, npx tsc --noEmit, and npm run build, plus relevant feature checks. On Windows use npm.cmd/npx.cmd if PowerShell blocks script launchers. Distinguish environmental runner failures from application defects. Do not send real emails, publish announcements, apply live database changes, or deploy as a substitute for isolated testing.

Review the final diff. Update docs/STATUS.md with what changed, checks actually performed, and pending migration/deployment steps. Update architecture and decisions when behavior or constraints change. Keep local implementation, local validation, user-reported completion, and independently verified production state separate. Never claim a migration, push, deployment, or inbox delivery succeeded without evidence.

Finish with a concise report: result, validation, material limitations, and required next steps. Do not commit, push, or deploy unless authorized by the task or existing session instructions.

Task: [Describe the requested change, expected behavior, constraints, and acceptance criteria here.]
