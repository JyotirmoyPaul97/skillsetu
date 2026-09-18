# Task ID: P2-Learning
# Agent: full-stack-developer (my skills + assessment)

## Task
Build `src/components/app/student/learning.tsx` — the SKILL SETU Phase 2 Student Portal
Learning section per master spec sections 19–24.

## Mandatory context reads (done before writing any code)
- `/home/z/my-project/worklog.md` (full history)
- `src/lib/student-data.ts` — S042 single-source-of-truth: TECHNICAL_SKILLS,
  SOFT_SKILLS, APTITUDE, GAPS, ASSESSMENTS, ROLES, EVIDENCE, types SkillRow /
  GapRow / EvidenceRow / AssessmentCard, helper findGap.
- `src/lib/student-state.ts` — useStudentState Zustand store:
  currentRole, setRole, assessmentProgress, startAssessment, completeAssessment.
- `src/lib/router.ts` — useRouter().navigate, hash router.
- `src/components/app/student-parts.tsx` — DashHeader, Modal, Drawer,
  EmptyState, DemoBadge, ConfidenceBadge, PriorityBadge, EvidenceStatusBadge,
  VerificationBadge, Field, SsStat, EvidenceDetailDrawer, RoleSelector.
- `src/components/app/student/dashboard.tsx` — PATTERN REFERENCE (style match).
- `src/components/ui/ss.tsx` — SsCard, SsBadge, SsSkillBar, SsStat, SsEyebrow,
  SsSectionHeading.
- `src/components/ui/button.tsx` — SKILL SETU button variants (navy/blue/teal/
  orange/outline/ghost).
- `src/app/globals.css` — master tokens (--ss-* palette).

## Export contract (the AppShell imports BOTH)
- `MySkillsPage({ section }: { section: "technical" | "soft" | "aptitude" | "gap" })`
- `AssessmentPage()`

## Work Log
- Read all 8 mandatory context files. Confirmed:
  * dashboard.tsx & passport.tsx live in `src/components/app/student/`; correct
    relative import for student-parts.tsx is `../student-parts` (matched
    passport.tsx pattern, NOT dashboard.tsx's stale `./student-parts` path).
  * Master palette: navy #0F2547, blue #2563EB, teal #0D9488, orange #EA580C,
    white/slate — no violet/rose/amber/indigo.
  * Existing shared sub-components in student-parts.tsx: DashHeader, Drawer,
    Modal, EvidenceDetailDrawer, RoleSelector, EmptyState, DemoBadge,
    ConfidenceBadge, PriorityBadge, EvidenceStatusBadge, VerificationBadge,
    Field, SsStat re-export.
- Built `MySkillsPage` with tab switcher (Technical / Soft Skills / Aptitude /
  Skill Gap). Tabs call `navigate("/app/skills/<section>")` per spec. Active
  tab uses navy bg + white text; inactive uses ghost styling.
  Body uses framer-motion AnimatePresence via `motion.div` keyed on section.
- Built `TechnicalSkillsTab` (spec §19 + §20): top stats (avg/evidence/below-
  target/top skill), DemoBadge header, SkillCardGrid of all 5 TECHNICAL_SKILLS
  (Python 82, SQL 64, Statistics 51, Machine Learning 43, Problem Solving 75).
  Each SkillCard: name, score (big navy number /100), evidence count (blue),
  last updated, ConfidenceBadge, SsSkillBar score-vs-target(80) with dynamic
  accent (teal ≥80, blue ≥60, orange <60). Whole card is keyboard-accessible
  (role="button", tabIndex=0, Enter/Space handler, focus-visible ring) → opens
  CompetencyDetailDrawer.
- Built `SoftSkillsTab` (spec §21): explicit DEMO DATA banner (orange dashed
  border), DemoBadge labelled "SOFT-SKILL DEMO", same SkillCardGrid for the
  7 SOFT_SKILLS (Communication, Teamwork, Leadership, Problem Solving,
  Adaptability, Presentation, Professionalism).
- Built `AptitudeTab` (spec §22): 4 stat tiles + grid of 4 APTITUDE cards
  (Quantitative 72, Logical 78, Verbal 70, Analytical 75). Each card: category,
  score (big navy /100), EvidenceStatusBadge, SsSkillBar vs target(80),
  attempted-date row.
- Built `SkillGapTab` (spec §22b): 3 stat tiles (open gaps / high priority /
  avg gap), grid of 3 GAPS cards. Each GapCard: skill, role-importance %,
  PriorityBadge, current/target with diff (−pts), SsSkillBar accent=orange,
  ConfidenceBadge, "View Gap" button → opens local GapDetailDrawerLocal
  (built inline using Drawer + Field primitives per spec — did NOT import
  dashboard.tsx's non-exported GapDetailDrawer). Drawer shows: skill, current,
  target, role importance, gap, confidence, priority, why explanation,
  suggested next actions list, "we don't promise specific score increase"
  note. Falls back to EmptyState when GAPS is empty (defensive).
- Built `CompetencyDetailDrawer` (spec §20): shows Skill, Competency,
  Evidence Confidence (ConfidenceBadge + count), Role Importance %,
  Contribution (score×weight, formatted to 2 decimals), Last Updated,
  Evidence Count, SsSkillBar, contribution explainer note, related EVIDENCE
  list filtered by skill name (each item clickable → opens EvidenceDetailDrawer),
  and a "View Evidence" navy button (disabled if no related evidence; otherwise
  opens EvidenceDetailDrawer with primary related evidence). Matches the
  Machine Learning example exactly: Competency 43, Confidence Limited, Role
  Importance 30%, Contribution 12.90 pts, Last Updated 15 Sept 2026, Evidence
  Count 1 item, View Evidence button.
- Built `AssessmentPage` (spec §23 + §24): DashHeader "Take Skill Assessment"
  with currentRole in subtitle, 4 stat tiles (total/completed/in-progress/not-
  started, computed from useStudentState.assessmentProgress), grid of 3
  AssessmentCardView cards (Aptitude / Technical / Coding-Practical from
  ASSESSMENTS). Each card: icon-tinted header, AssessmentStatusBadge, full
  description, Duration + Questions stat tiles, role-focus row, and a
  status-driven action button:
    * Not started  → "Start Assessment" (navy) → opens StartAssessmentRoleModal
    * In Progress  → "Continue & Complete" (blue) → completeAssessment(id) →
                     status flips to Completed
    * Completed    → "View Result" (teal) → opens ResultModal
  Replaced all "meaningless empty square cards" — every visible card carries
  useful content (icon, title, description, stats, action). Added one extra
  "How assessments work" info card (with two cross-link buttons to skills/
  passport) to round out the page without placeholders.
- Built `StartAssessmentRoleModal` (spec §24): Modal size=lg listing all 12
  ROLES as cards with description + keySkills (top 3 chips). Clicking a role
  card calls onChoose(roleName) → setRole(roleName) + startAssessment(pendingId)
  + close. Also a "Keep '<current>' & Start →" ghost button for the no-change
  path. Includes phase-2 disclaimer ("frontend config only"). Note: chose to
  build this role-selection modal inline (spec allows "OR a role-selection
  modal listing ROLES as cards") rather than reusing RoleSelector, because
  RoleSelector's "Apply" button always navigates to /app/dashboard which
  would interrupt the start-assessment flow.
- Built `AssessmentStatusBadge` and `ResultModal`: ResultModal shows a demo
  score + percentile per assessment type (Aptitude 73/68p, Technical 64/58p,
  Coding/Practical 71/62p), assessment meta, evidence-generated field, info
  note, and Close + "View Skills" buttons.
- Reused `EvidenceDetailDrawer` (from student-parts) for the skill-evidence
  drill-down — Drawer chain: skill card → CompetencyDetailDrawer → (related
  evidence button) → EvidenceDetailDrawer.
- All animations: subtle framer-motion (opacity+y for tab body + cards). All
  icons: lucide-react. All buttons: SKILL SETU Button variants only.
- Verified palette compliance: navy/blue/teal/orange/white/slate only via
  var(--ss-*) tokens. No violet/rose/amber/indigo anywhere.
- Verified responsive: stat grids 2-col mobile → 4-col desktop; tab switcher
  flex-1 with truncated labels on mobile (sm:inline reveals full label);
  SkillCardGrid 1-col mobile → 2-col sm → 3-col lg; Assessment cards 1-col →
  3-col lg; StartAssessmentRoleModal role cards 1-col mobile → 2-col sm with
  max-h-[50vh] scroll.
- Verified "use client" + TypeScript strict (no implicit any, all typed).
- Lint: `bun run lint` → 0 errors. Dev log: clean compile (`✓ Compiled in
  ...`).
- Wrote this work record at `/home/z/my-project/agent-ctx/P2-Learning-full-stack-developer.md`.

## Stage Summary
- `src/components/app/student/learning.tsx` COMPLETE and verified.
- Exports `MySkillsPage({ section })` and `AssessmentPage()` exactly per
  AppShell contract.
- 4 skill tabs (Technical / Soft Skills / Aptitude / Skill Gap) all
  implemented with demo data, demo labels (DemoBadge + orange banner for
  soft skills), and competency detail drawer showing Skill / Competency /
  Evidence Confidence / Role Importance % / Contribution / Last Updated /
  Evidence Count / SsSkillBar + related-evidence list + "View Evidence"
  button (chains to EvidenceDetailDrawer).
- Assessment page: 3 cards (Aptitude / Technical / Coding-Practical) with
  status-driven buttons (Start → role-selection modal → In Progress → Continue
  & Complete → Completed → View Result). Role-selection modal lists all 12
  ROLES as cards with description + key skills; selection updates currentRole
  via useStudentState.setRole. NO placeholder empty cards.
- All stateful via useStudentState (currentRole, setRole, assessmentProgress,
  startAssessment, completeAssessment). No backend/fetch — reads student-data
  and mutates student-state only.
- Reuses Phase 1 design system exactly (SsCard, SsStat, SsSkillBar, Button
  variants, master tokens, Drawer/Modal/EmptyState/Field/EvidenceDetailDrawer
  from student-parts). Matches dashboard.tsx style.
- Lint clean, dev server compiles cleanly, responsive verified.
