# Task ID: P2-Career
**Agent:** full-stack-developer (career pages)
**Task:** Build `src/components/app/student/career.tsx` — Jobs / Internships / Projects / Industry Learning list pages + detail modals + Why Match modal.

## Context reads (foundation reuse — no reinvention)
1. `worklog.md` — full (Phase 1 design system, Phase 2 foundation summary).
2. `src/lib/student-data.ts` — single source of truth. Imported `JOBS`, `INTERNSHIPS`, `PROJECTS`, `INDUSTRY_LEARNING`, `type Opportunity`. (Did NOT need `BEST_MATCH` or `findOpp` directly — each grid reads its own array.)
3. `src/lib/student-state.ts` — used `applied`, `apply`, `saved`, `toggleSave` from `useStudentState`. For Industry Learning enroll, used local `Set<string>` (no backend state field exists; seeding initial enrolled set from `l.status === "Enrolled"`).
4. `src/lib/router.ts` — used `useRouter().navigate("/app/career/<section>")` for the section switcher.
5. `src/components/app/student-parts.tsx` — reused `DashHeader`, `Modal`, `EmptyState`, `DemoBadge`, `MatchBadge`, `Field`. (No `Drawer` needed; all flows use Modal.)
6. `src/components/app/student/dashboard.tsx` — PATTERN REFERENCE: matched its card style (`rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft`), motion entry (`initial opacity 0, y 12`), `BestMatchCard` apply→disabled+success-msg pattern, `WhyMatchModal` checklist+gap+evidence pattern exactly.
7. `src/components/ui/ss.tsx` — available; chose raw class names to match dashboard.tsx exactly (no `SsCard`).
8. `src/components/ui/button.tsx` — used `navy`/`blue`/`teal`/`orange`/`outline`/`ghost` variants only. No custom button styles.
9. `src/app/globals.css` — design tokens `var(--ss-*)`. Palette strict: navy / blue / teal / orange / slate neutrals only. No violet/rose/amber/indigo.

## Work Log
- Read all 9 mandatory context files.
- Created `src/components/app/student/career.tsx` (~600 lines, single file).
- Public export: `CareerPage({ section }: { section: "jobs" | "internships" | "projects" | "learning" })`.
- Top-level layout:
  * `DashHeader` with section-specific title/subtitle/icon/accent (teal for Jobs, blue for Internships, orange for Projects, navy for Learning).
  * Section switcher: 4-tab nav (grid 2-col mobile / 4-col sm+), calls `navigate("/app/career/<section>")`, `aria-current="page"` on active.
  * Conditional render of one of: `<JobsGrid />`, `<InternshipsGrid />`, `<ProjectsGrid />`, `<LearningGrid />`.
- **JobsGrid (spec §25)**: responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Card: Briefcase icon tile (teal tint), title, company · mode · type, MatchBadge; meta lines (MapPin/Wallet/Clock with --ss-faint icons); required-skills pills; buttons row (View Details outline → modal, Save outline icon → toggleSave with bookmark fill toggle, Apply Now navy → apply() + Applied/disabled state with CheckCircle2 + success message); "Why Match? →" link to WhyMatchModal.
- **InternshipsGrid (spec §27)**: same card pattern, blue tint GraduationCap icon; meta includes Duration + Stipend. Apply/Save/Why Match behavior identical to jobs.
- **ProjectsGrid (spec §28)**: orange tint FolderKanban icon; shows `Building2`+company, line-clamped Problem statement, required skills, meta (Duration/Team/Mentor/Deadline); buttons "View Project" (navy, opens ProjectDetailModal) + "Why Match?" (ghost blue, opens WhyMatchModal).
- **LearningGrid (spec §29)**: navy tint BookOpen icon; category filter chips (All/Training/Workshop/Certification/Mentorship) — single-select via local state; `useMemo` filters INDUSTRY_LEARNING by `type`; per-card: title, provider · type, line-clamped about, Skill/Duration/Deadline meta, LearningStatusBadge (slate=Not started, teal=Enrolled/Completed, blue=Application open, orange=In Progress), View/Enroll buttons; Enroll toggles local Set; "Why Match? →" link.
- **OppDetailModal (spec §26 — Job Details; reused for Internships)**: large modal showing DemoBadge + MatchBadge + Saved chip; About the Role (about); Responsibilities list; Required skills pills (blue); Preferred skills pills (neutral, only if present); Eligibility; meta grid (Location/Mode/Duration/Compensation/Deadline/Type); "Your match" card with MatchBadge + whyMatch checklist + potentialGap (orange) + Evidence considered pills; footer Save/Close/Apply buttons (apply disabled when applied, shows success message).
- **ProjectDetailModal (spec §28)**: About the project; Problem statement (orange-tinted block, Target icon); required skills pills (orange); meta grid (Duration/Team size/Mentor/Mode/Compensation/Deadline); Your match block; footer Close/Express Interest.
- **LearningDetailModal (spec §29)**: About; meta grid (Provider/Type/Duration/Mode/Skill/Target Role/Compensation/Deadline); Your match block; footer Close/Enroll Now (toggles enrolled state).
- **WhyMatchModal (spec §12–13)**: small modal showing DemoBadge; Alignment checklist from `opp.whyMatch` (teal CheckCircle2); Potential gap block (orange) from `opp.potentialGap`; Evidence considered pills from `opp.evidenceConsidered`; guidance note dashed block.
- **Helpers**: `SectionLabel` (uppercase 10px eyebrow with optional icon) + `LearningStatusBadge` (palette-strict color map).
- Stateful behaviors (spec §39): Apply Now → disabled + checkmark + success message + `applied` Set update via `useStudentState.apply`. Save → bookmark icon fill/color toggle + `saved` Set update via `toggleSave`. Enroll → local enrolled Set toggle + teal disabled "Enrolled" button.
- Demo data labelled: every modal starts with `<DemoBadge />`; near every MatchBadge; "Successfully applied (prototype workflow — no external application created)" message clarifies frontend-only mutation.
- Empty states (spec §38): defensive `EmptyState` if any opportunity list is empty (with `Search` icon), plus the Learning filter empty state when a category has no items.
- Animations: framer-motion `motion.div` per card with `initial opacity:0, y:12 → animate opacity:1, y:0`, staggered by `i * 0.04`.
- Mobile responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards; section switcher `grid-cols-2 sm:grid-cols-4`; modal is `max-w-2xl` on lg screens, full-width on mobile.
- Ran `bun run lint` → clean (0 errors).
- Verified dev server recompiles cleanly (dev.log shows ✓ Compiled in ~200–600ms repeatedly; GET / 200 responses).

## Stage Summary
- **File created**: `src/components/app/student/career.tsx` (single file, ~600 lines, `"use client"`).
- **Public export**: `CareerPage({ section }: { section: "jobs" | "internships" | "projects" | "learning" })`.
- **Behaviors implemented**:
  * 4 list views (Jobs/Internships/Projects/Industry Learning) reading from `student-data.ts` arrays.
  * 3 detail modals (Job/Internship `OppDetailModal`, `ProjectDetailModal`, `LearningDetailModal`) — Job Details modal satisfies spec §26 (About/Responsibilities/Required/Preferred/Eligibility/Location/Compensation/Your Match/Why You Match/Skill Gaps/Evidence Considered).
  * 1 reusable `WhyMatchModal` satisfying spec §12–13 (alignment checklist / potential gap / evidence considered pills).
  * Section switcher (4 tabs) using hash router `navigate("/app/career/<section>")`.
  * Learning category filter (All/Training/Workshop/Certification/Mentorship).
  * Stateful Apply/Save/Enroll using `useStudentState.apply`/`toggleSave` (+ local enroll Set); demo-data labelled with `DemoBadge`; success messages clarify prototype workflow.
  * Empty states via `EmptyState`; framer-motion staggered card entry; responsive grid + 2x2 mobile tab layout.
- **Palette**: strict master tokens (`--ss-navy-900`, `--ss-blue-600`, `--ss-teal-600`, `--ss-orange-600`, slate neutrals). No violet/rose/amber/indigo.
- **Lint**: clean. **Dev server**: compiles cleanly.
- **AppShell integration**: `import { CareerPage } from "@/components/app/student/career"` — AppShell should mount `<CareerPage section={appSection(route)[1] ?? "jobs"} />` when route matches `/app/career/<section>`.
