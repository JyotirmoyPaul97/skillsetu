# Task 4-a — Industry Portal (Phase 9 Rebuild)

**Agent**: full-stack-developer (Industry Portal)
**Task**: Phase 9 Industry Portal rebuild — Talent Intelligence Workspace

## Files Modified (only 3)
1. `src/components/app/industry/industry-shell.tsx` — NAV labels + breadcrumbs updated (Post Opportunity → Create Opportunity, Demand Intelligence → Demand Pulse, Talent Discovery → Discover Talent, Feedback → Feedback Center); sidebar sub-header changed to "Talent Intelligence"
2. `src/components/app/industry/industry-core.tsx` — Full Phase 9 rebuild: dashboard (5-section §63 hierarchy + SsIntelligenceAssistant), demand pulse page (SsPipeline + Demand Pulse by Skill panel), Create Opportunity (problem-first + live talent availability via getOpportunityIntelligence), opportunity management (light restyle), Discover Talent (rebuilt with new filters + SsWhyModal + evidence-first drawer)
3. `src/components/app/industry/industry-extra.tsx` — Rebuilt challenges (SsPipeline + Create Challenge), team-builder (BUILD A TEAM with safeTeamBuilderCoverage wrapper), feedback (FEEDBACK CENTER tabs + rubric + ConfirmEvidenceModal), analytics (§65 KPIs: Talent Coverage / Skill Demand / Evidence-Backed Candidates); learning/notifications/profile lightly restyled

## Shared Files Used (not modified)
- `src/components/ui/ss-intelligence.tsx` — SsDemandBadge, SsCoverageBar, SsPipeline, SsWorkflowBanner, SsWhyModal, SsWhyFactor, SsAlertPill, SsDataSourceLabel, SsIntelligenceAssistant
- `src/lib/intelligence/aggregators.ts` — IndustryAggregator (getDemandPulse, getWhatWeNeed, getTalentSupply, getOpportunityIntelligence, getTeamBuilderCoverage, getIndustryIntelligenceSummary) + useAggregators hook
- `src/components/ui/ss.tsx` — SsCard, SsBadge, SsStat
- `src/lib/industry/*` (industry-service, industry-store, industry-model, candidates) — all reused as-is

## Phase 9 Spec Sections Implemented
- §1 Hero header + contextual controls — `industry-core.tsx` IndustryDashboard
- §3 Demand Pulse — `industry-core.tsx` IndustryDashboard + DemandIntelligence page
- §4 What We Need (more prominent than Post Opportunity) — `industry-core.tsx` IndustryDashboard section 1
- §5 Talent Supply / Who Can Demonstrate It — `industry-core.tsx` IndustryDashboard section 2
- §6–§9 Talent Discovery (filters, cards, Why modal, evidence-first drawer) — `industry-core.tsx` TalentDiscovery
- §10 Demand → Candidate Workflow pipeline — `industry-core.tsx` DemandIntelligence (SsPipeline)
- §11, §12 Create Opportunity (problem-first + Opportunity Intelligence preview) — `industry-core.tsx` CreateOpportunity
- §13 Challenges — `industry-extra.tsx` ChallengesPage (SsPipeline)
- §14 Team Builder — `industry-extra.tsx` TeamBuilderPage (rebuilt with safeTeamBuilderCoverage)
- §15, §16 Feedback Center (rubric + evidence creation + not-auto-verified confirmation) — `industry-extra.tsx` FeedbackCenter
- §17 Intelligence Summary (Q&A) — `industry-core.tsx` SsIntelligenceAssistant
- §18 Visual language (orange accent + Demand badges + Coverage bars + Pipeline) — throughout
- §65 Analytics without generic KPIs — `industry-extra.tsx` AnalyticsPage
- §67 Explainability (WHY affordances) — SsWhyModal + SsWhyFactor throughout
- §69 Data honesty (SsDataSourceLabel demo/platform) — throughout

## Known Issues / Decisions
- `IndustryAggregator.getTeamBuilderCoverage` references `role.weightedSkills` which doesn't exist on `RoleConfig` (which has `skills` with `weight`, not `requiredLevel`). Wrapped call in `safeTeamBuilderCoverage()` try/catch with manual fallback using `role.skills` + `COMPETENCY_TARGET_THRESHOLD` (70) so the page works regardless. Did NOT modify aggregators.ts (shared file, off-limits).
- `IndustryAggregator.getWhatWeNeed`'s inferred TypeScript return type collapses `criticalSkills` to a single object (TS can't infer across the dynamic Map+spread). Cast result via `as unknown as Array<{...}>` with explicit shape. Did NOT modify aggregators.ts.
- Dev server was down at verification time (curl 000) due to a syntax error in `academia-shell.tsx` (line 37 — another agent's WIP). My industry files produce ZERO compile errors — `bun run lint` exits 0 and `tsc --noEmit` shows no industry-related errors.
- Lint clean (EXIT 0). TypeScript clean for industry files.

## What This Agent Did NOT Touch
- Student Portal (off-limits per spec)
- Academia Portal files (another agent's scope)
- Institution Portal files (another agent's scope)
- Phase 1 landing page (off-limits per spec)
- Shared `ss-intelligence.tsx` and `aggregators.ts` (read-only per spec)
