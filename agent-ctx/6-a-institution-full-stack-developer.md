# Task 6-a — Institution Portal Phase 9 Rebuild

Agent: full-stack-developer (Institution Portal)
Task: Rebuild INSTITUTION PORTAL as "Executive Skill Intelligence Command Center"

## Files I'm working on (ONLY these 3 — do not touch others)
- `/home/z/my-project/src/components/app/institution/institution-shell.tsx`
- `/home/z/my-project/src/components/app/institution/institution-core.tsx`
- `/home/z/my-project/src/components/app/institution/institution-extra.tsx`

## Shared primitives I import (DO NOT modify these)
- `@/components/ui/ss-intelligence` exports:
  SsDemandBadge, SsPriorityPill, SsCoverageBar, SsPipeline, SsAlignmentChain,
  SsHeatmap, SsAlertPill, SsWhyFactor, SsWhyModal, SsDataSourceLabel,
  SsIntelligenceAssistant, SsMatrixCellDetail, SsWorkflowBanner
- `@/lib/intelligence/aggregators` exports:
  InstitutionAggregator (getAlerts, getNextActions, getOutcomeMonitoring,
  getHackathonIntelligence, getInternshipIntelligence, getPlacementIntelligence),
  useAggregators(), IntelligenceAlert
- `@/components/ui/ss` exports: SsCard, SsBadge, SsStat, SsEyebrow, SsSectionHeading
- `@/components/app/student-parts` exports: DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, SsStat
- `@/lib/institution` re-exports: useInstitutionStore, DEMO_USER, InstitutionService, useInstitution, types
- `@/lib/industry/candidates` exports: DEMO_CANDIDATES
- `@/lib/career/store` exports: useCareerStore
- `@/lib/academia/academia-store` exports: useAcademiaStore
- `@/lib/academia/academia-service` exports: AcademiaService

## Institution portal accent = NAVY (`--ss-navy-900 #0F2547`, `--ss-navy-50 #DBE7F5` tint)

## Status: in progress
