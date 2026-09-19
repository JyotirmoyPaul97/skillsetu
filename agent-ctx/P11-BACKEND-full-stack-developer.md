# Task ID: P11-BACKEND — full-stack-developer (Backend foundation)

## Scope delivered
- Layer 1: `src/lib/auth.ts` + `src/lib/rbac.ts` + `src/lib/api-response.ts`
- Layer 2: API response envelope `{ data, meta }` / `{ error: { code, message, details } }`
- Layer 3: 9 critical API routes (login/register/logout/me, students/[id]
  with live readiness calc, evidence POST, evidence/[id]/verify PATCH,
  opportunities GET, feedback POST with cross-portal feedback→evidence loop)
- Layer 4: `src/lib/audit.ts` + `src/lib/event-log.ts` (Zustand in-memory
  prototype with localStorage persistence on client; server-side appends
  are no-op-safe)
- Bonus: 2 admin routes (`/api/admin/seed` with raw-SQL pre-clear + spawn
  of `prisma/seed.ts`; `/api/admin/stats` returns user/evidence/opportunity
  counts + recent audit + event timeline)

## Key decisions (see worklog P11-BACKEND for full reasoning)
- Password verification supports BOTH bcryptjs (new registrations) AND
  legacy sha256 (seeded users via `createHash("sha256")`). Auto-detected
  by hash format prefix `$2[aby]$`. Re-seeding with bcrypt was rejected
  because it would invalidate the demo logins already used by Phase 1-10
  frontend.
- `requireAuth()` returns `SessionInfo | NextResponse` discriminated by
  `instanceof NextResponse` — clean early-return pattern in handlers.
- `requireRole(roles)` lives in `auth.ts` (per spec). It composes
  `getSession` and emits 401/403 with the canonical error envelope.
- Audit + event log = PROTOTYPE in-memory Zustand stores with no-op-safe
  localStorage on the client. Documented as "production would use a real
  Prisma `AuditLog`/`EventLog` table".
- `admin/seed` pre-clears ALL 16 tables via raw SQL (`PRAGMA foreign_keys = OFF`
  then `DELETE FROM "<table>"` for each) before spawning the seed. This
  works around a pre-existing bug in `prisma/seed.ts` where the
  `deleteMany` calls use pluralized accessor names like `prisma.institutions`
  that don't exist (default Prisma accessors are singular camelCase) —
  the catch-all `try/catch` silently skips them, so re-seeding on a
  populated DB previously failed with unique-constraint violations on
  `institutions.code`. Not modifying `prisma/seed.ts` (out of scope).
- `admin/seed` RBAC: allow ADMIN or INSTITUTION (the seeded admin user
  `admin@iitm.ac.in` is role=INSTITUTION — no Role.ADMIN user is seeded).

## Verification
- `bun run lint` → exit 0 (CLEAN)
- `bunx tsc --noEmit` filtered for `api/`, `lib/auth`, `lib/rbac`,
  `lib/api-response`, `lib/audit`, `lib/event-log` → ZERO errors
- curl tests (see worklog): login / me / students/[id] all return 200;
  RBAC 403 (student verifying evidence / fetching other student);
  401 (bad creds / unauthenticated / session after logout)

## Seeded credentials (re-verified after admin/seed?reset=1)
- Password for all seeded users: **`skillsetu`**
- Student:    `aarav@iitm.ac.in` (Frontend Engineer, readiness 83.9)
- Industry:   `talent@technova.com`
- Academia:   `meena@iitm.ac.in`
- Institution: `admin@iitm.ac.in`
