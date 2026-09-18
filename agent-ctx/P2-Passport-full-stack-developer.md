# P2-Passport — Skill Passport (6 tabs incl. Resume Builder)

**Task ID:** P2-Passport
**Agent:** full-stack-developer (skill passport)
**File:** `src/components/app/student/passport.tsx` (982 lines)
**Export:** `PassportPage({ tab })` — `tab: "verified" | "projects" | "certifications" | "internships" | "hackathons" | "resume"`

## What was built

A single-file Student Portal "Skill Passport" page covering master spec sections 30–35, with
6 tabs behind a sticky tab switcher, plus an overview card shown at the top of every tab.

### Components in this file
- `PassportPage` — exported. Renders DashHeader ("Skill Passport" / "Your evidence-backed skill profile"),
  6-tab switcher (calls `navigate("/app/passport/<tab>")`), overview card, then the active tab body
  with an AnimatePresence transition.
- `PassportOverview` (spec §30) — Student name+ID (Aarav / S042), Target Role, Role Readiness (61%
  from `READINESS.displayed`, CalcBadge), Evidence Count (from `EVIDENCE.length`, sub shows
  `TECHNICAL_SKILLS` evidence row sum). DemoBadge near values. Pending verification banner.
- `VerifiedSkillsTab` (spec §30) — `TECHNICAL_SKILLS` rows: name, score, ConfidenceBadge,
  derived VerificationBadge (Verified if any `EVIDENCE` for that skill has `verification="Verified"`,
  otherwise Pending), evidence count, last-updated. Clickable → `SkillDetailDrawer`. Plus a soft-skills
  summary card.
- `SkillDetailDrawer` — competency ring via `SsSkillBar` (target 80), evidence count, last updated,
  role importance, contribution, confidence, filtered related-evidence list (from `EVIDENCE`),
  verification note.
- `ProjectsTab` (spec §31) — `PASSPORT_PROJECTS` cards: name, desc, technology pills, skills pills,
  date, role, contribution, github/liveDemo (if set on card), VerificationBadge. Two buttons:
  "View Project" (modal) + "Add GitHub Link" / "Edit Links" (modal). The note "Adding a GitHub
  link does not verify the project. Verification requires faculty/industry review." appears both in
  the add-link modal and the project detail modal. After saving, the card shows the saved links but
  keeps verification Pending.
- `ProjectCard`, `ProjectDetailModal`, `GithubLinkModal` — uses `useStudentState().saveGithub(...)` to
  mutate state (spec §39). GithubLinkModal uses `key={project?.id ?? "none"}` + lazy `useState`
  initializers (reads `githubLinks[project.id]`) so the form hydrates fresh each open without
  `useEffect` (avoids the `react-hooks/set-state-in-effect` lint rule). After save, "Saved"
  confirmation + auto-close after 800ms.
- `CertificationsTab` (spec §32) — table with: Certification, Issuer, Date, Credential ID, Status.
  Distinct `CertStatusBadge` (Uploaded = neutral slate, Pending Verification = warm slate,
  Verified = teal) — explicit note that "Uploaded ≠ Verified".
- `InternshipsTab` (spec §33) — `PASSPORT_INTERNSHIPS`: company, role, duration, skills pills,
  supervisor feedback (block quote with blue left-border), VerificationBadge.
- `HackathonsTab` (spec §34) — `COMPLETED_HACKATHONS`: name, domain, deadline, team size,
  problem, project, team, role, evaluation, evidence status, required skills pills. Controlled
  DEMO DATA label + note "This page will later consume the real Hackathon system."
- `ResumeTab` (spec §35) — Resume Builder:
  - Top control row with target-role inline `<select>` (reuses `useStudentState.currentRole` + `setRole`)
  - Resume Alignment Score card (demo 72%) with explicit "Not an ATS score" note (NOT "Guaranteed
    ATS Score"). CalcBadge labelled "Demo".
  - Resume preview (header + Summary / Education / Skills / Projects / Internships /
    Hackathons / Certifications / Achievements). All sections pull from `student-data.ts` —
    nothing is invented. Summary is a templated line derived from STUDENT.branch / college /
    currentRole / skill strengths. Achievements derived from `COMPLETED_HACKATHONS.evaluation`
    and Verified certifications only.

## Design system reuse (HARD RULES honored)

- Palette: navy `#0F2547`, blue `#2563EB`, teal `#0D9488`, orange `#EA580C`, white, slate neutrals
  via `var(--ss-*)`. No violet/rose/amber/indigo.
- Cards: `rounded-2xl`, `SsCard tone="soft"`, `border-[var(--ss-border)]`, `shadow-soft`/`shadow-pop`.
- Buttons: `Button` variants only — navy / outline / ghost used.
- Icons: `lucide-react` only.
- Animations: `framer-motion` `motion` + `AnimatePresence` (tab transition y:8 → 0, opacity).
- Empty states: `EmptyState` reused (Projects / Certifications / Internships / Hackathons).
- Demo labels: `DemoBadge` near every demo value (also `CalcBadge` for calculated values).
- Stateful: `saveGithub` updates `githubLinks`; the project card reads it back via
  `useStudentState()` and re-renders to show saved links (verification still Pending).
- TypeScript strict. `"use client"`. Responsive (mobile-first; grids collapse to 1-col).

## Files touched
- `src/components/app/student/passport.tsx` (new — 982 lines)

## Lint status
`bun run lint` — 0 errors, 0 warnings. Dev server compiles cleanly.

## Known limitations / notes
- This is a frontend-only file (per Phase 2 scope). It imports exclusively from
  `student-data.ts` (single source of truth), `student-state.ts` (mutable overlay), `router.ts`
  (hash router), `student-parts.tsx` (Phase 1 shared parts), and `ui/ss.tsx` + `ui/button.tsx` +
  `ui/input.tsx`. No backend / fetch.
- Resume "Achievements" is derived from existing hackathon evaluations and verified certs —
  no fabricated experience.
- The role `<select>` in the Resume tab updates `useStudentState.currentRole` immediately;
  the Summary and ResumeHeader reactively reflect the new role via `ResumeTab`'s reactive
  subscription to `currentRole`.
