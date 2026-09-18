"use client";

/**
 * SKILL SETU — Phase 9 Academia Portal · core pages.
 *
 * Portal identity (Phase 9 §19–§35): INDUSTRY–ACADEMIC ALIGNMENT WORKSPACE.
 *   "Understand Demand. Align Learning. Enable Practical Exposure. Connect Faculty."
 *
 * Information hierarchy (§63):
 *   WHAT INDUSTRY NEEDS → WHAT STUDENTS DEMONSTRATE → WHERE CURRICULUM IS ALIGNED
 *   → WHERE PRACTICAL EXPOSURE IS MISSING → WHAT COLLABORATION CAN HELP
 *
 * Pages in this file:
 *   - AcademiaDashboard   (/academia/dashboard) — full Phase 9 §21–§32 rebuild
 *   - SkillIntelligence    (/academia/skills)   — restyle + SsDataSourceLabel
 *   - CurriculumAlignmentPage (/academia/curriculum) — SsAlignmentChain + SsHeatmap + SsMatrixCellDetail
 *   - FacultyDevelopmentPage  (/academia/opportunities) — REBUILD as Faculty Development (§29, §30)
 *
 * Rules calculate. AI explains. We do NOT invent numbers — every value is read
 * from `AcademiaService`, `AcademiaAggregator`, or shared Phase 3/4/5 stores.
 * Honest data-source labels (SsDataSourceLabel) on every panel (§69).
 */

import { useMemo, useState } from "react";
import {
  BarChart3, BookOpen, Briefcase,
  TrendingUp, AlertTriangle, Sparkles, ArrowRight,
  Info, HelpCircle, Lightbulb, Users,
  GraduationCap, Wrench, FileText, Trophy, Target,
  Workflow, Layers, Building2, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import {
  useAcademia, AcademiaService, useAcademiaStore,
  DEMO_FACULTY, DEMO_INSTITUTION,
} from "@/lib/academia";
import { AcademiaAggregator } from "@/lib/intelligence/aggregators";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import {
  DashHeader, Drawer, DemoBadge, EmptyState, Field,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsEyebrow } from "@/components/ui/ss";
import {
  SsDemandBadge, SsCoverageBar, SsAlignmentChain, SsHeatmap,
  SsAlertPill, SsWhyFactor, SsWhyModal, SsDataSourceLabel,
  SsIntelligenceAssistant, SsMatrixCellDetail, SsWorkflowBanner,
} from "@/components/ui/ss-intelligence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CurriculumAlignmentRow, IndustrySkillSignal, CohortSkillGap,
  FacultyOpportunity, CoverageLevel, Collaboration,
} from "@/lib/academia/academia-model";
import type { FacultyProfile } from "@/lib/academia/academia-model";
import type { Candidate } from "@/lib/industry";

// ─────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────
export function AcademiaCore({ section }: { section: string }) {
  if (section === "dashboard") return <AcademiaDashboard />;
  if (section === "skills") return <SkillIntelligence />;
  if (section === "curriculum") return <CurriculumAlignmentPage />;
  if (section === "opportunities") return <FacultyDevelopmentPage />;
  return <AcademiaDashboard />;
}

// ─────────────────────────────────────────────────────────────────
// Shared constants & helpers
// ─────────────────────────────────────────────────────────────────
/** Phase 3 configured prototype competency target threshold (not an industry standard). */
const COMPETENCY_TARGET = 70;

/** Coverage level → numeric rank for SsHeatmap cell values. */
function coverageRank(c: CoverageLevel): number {
  return { "Not Covered": 0, "Introductory": 25, "Moderate": 60, "Strong": 90 }[c];
}

/** Coverage level → short code for the matrix cell label. */
function coverageShort(c: CoverageLevel | undefined): string | undefined {
  if (!c) return undefined;
  return { "Not Covered": "—", "Introductory": "I", "Moderate": "M", "Strong": "S" }[c];
}

/**
 * Safe mentor-matching hook.
 *
 * The shared `AcademiaAggregator.getMentorMatches()` references `role.weightedSkills`
 * which is not present on the current `RoleConfig` type — calling it would throw.
 * We try it first; on error we fall back to a local computation using the SAME shared
 * data sources (DEMO_CANDIDATES, ALL_ROLES, DEMO_FACULTY) and the configured prototype
 * competency target (70). Numbers are computed, not invented.
 */
export interface MentorMatch {
  student: Candidate;
  gapSkills: string[];
  faculty: FacultyProfile | null;
  reason: string;
}

export function useMentorMatches(): MentorMatch[] {
  const a = useAcademia();
  return useMemo(() => {
    try {
      const m = AcademiaAggregator.getMentorMatches();
      if (Array.isArray(m) && m.length > 0) {
        return m as MentorMatch[];
      }
    } catch {
      // fall through to local computation
    }
    const faculty = DEMO_FACULTY;
    const out: MentorMatch[] = [];
    for (const c of DEMO_CANDIDATES) {
      const role = ALL_ROLES.find((r) => r.roleId === c.roleId);
      if (!role) continue;
      const gapSkillIds = role.skills
        .filter((ws) => (c.competencies[ws.skillId]?.competencyScore ?? 0) < COMPETENCY_TARGET)
        .map((ws) => ws.skillId);
      if (gapSkillIds.length === 0) continue;
      const matchedSkillNames = faculty.skills
        .filter((fs) => gapSkillIds.includes(fs.skillId))
        .map((fs) => fs.skillName);
      const facultyHasExpertise = faculty.skills.some((fs) => gapSkillIds.includes(fs.skillId));
      out.push({
        student: c,
        gapSkills: gapSkillIds.map((id) => SKILL_NAMES[id] ?? id),
        faculty: facultyHasExpertise ? faculty : null,
        reason: facultyHasExpertise
          ? `Faculty ${faculty.name} has expertise in ${matchedSkillNames.join(", ")}.`
          : `No faculty expertise currently mapped for ${gapSkillIds.map((id) => SKILL_NAMES[id] ?? id).join(", ")}.`,
      });
    }
    return out;
  }, [a]);
}

/** Build deterministic WHY factors for an action item from a CurriculumAlignmentRow. */
function buildWhyFactors(r?: CurriculumAlignmentRow): {
  ok: "pass" | "warn" | "fail";
  label: string;
  detail?: string;
}[] {
  if (!r) {
    return [
      { ok: "warn", label: "Alignment row not found", detail: "This skill is not in the current curriculum alignment dataset." },
    ];
  }
  return [
    {
      ok: r.industryDemand === "High" ? "pass" : r.industryDemand === "Medium" ? "warn" : "fail",
      label: `Industry demand: ${r.industryDemand}`,
      detail: `${r.demandCount} active opportunity(ies) on the platform reference this skill.`,
    },
    {
      ok: r.curriculumCoverage === "Strong" || r.curriculumCoverage === "Moderate" ? "pass" : r.curriculumCoverage === "Introductory" ? "warn" : "fail",
      label: `Curriculum coverage: ${r.curriculumCoverage}`,
      detail: `Highest coverage level across the courses mapped for this skill.`,
    },
    {
      ok: r.alignment === "Gap" ? "fail" : r.alignment === "Needs Attention" ? "warn" : "pass",
      label: `Alignment status: ${r.alignment}`,
      detail: `Student cohort average competency: ${r.studentAvgCompetency}/100.`,
    },
    {
      ok: r.practicalEvidence === "Strong" ? "pass" : r.practicalEvidence === "Moderate" ? "warn" : "fail",
      label: `Practical evidence: ${r.practicalEvidence}`,
      detail: `Practical exposure gap: ${r.practicalExposureGap}.`,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// ACADEMIA DASHBOARD — Phase 9 §21–§32 rebuild
// ═══════════════════════════════════════════════════════════════
function AcademiaDashboard() {
  const { navigate } = useRouter();
  const a = useAcademia();
  const { createCollaboration } = useAcademiaStore();

  // §21 — Industry Is Asking For (derived from opportunities + challenges)
  const industryAsking = useMemo(
    () => AcademiaAggregator.getIndustryAskingFor(),
    [a.signals],
  );
  // §22 — Our Students Are Demonstrating
  const studentsDemonstrating = useMemo(
    () => AcademiaAggregator.getStudentsDemonstrating(),
    [a.signals],
  );
  // §23 — Where Is The Gap? (centerpiece)
  const alignmentGaps = useMemo(
    () => AcademiaAggregator.getAcademicAlignmentGaps(),
    [a.alignment],
  );
  // §24 — top 2 gap skills for alignment chain
  const topGapSkills = useMemo(
    () => alignmentGaps.slice(0, 2),
    [alignmentGaps],
  );
  // §27 — Action Center
  const actionCenter = useMemo(
    () => AcademiaAggregator.getAcademiaActionCenter(),
    [a.alignment],
  );
  // §31 — Mentor matches (safe)
  const mentorMatches = useMentorMatches();
  // §29/§32 — faculty opportunities + collaborations
  const facultyOpps = AcademiaService.getFacultyOpportunities();
  const activeCollabs = a.collaborations.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* ── 1. Hero header (§63) ─────────────────────────────────── */}
      <SsCard tone="pop" className="overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-[var(--ss-blue-50)] via-white to-[var(--ss-teal-50)] p-6 sm:p-7">
          <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <SsBadge tone="academia" className="text-[10px]">ACADEMIA PORTAL</SsBadge>
              <DemoBadge>PROTOTYPE BUILD</DemoBadge>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[var(--ss-ink)] sm:text-3xl md:text-4xl">
              ACADEMIC ALIGNMENT <span className="text-gradient-nbt">INTELLIGENCE</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ss-ink-soft)] sm:text-base">
              Turn industry signals into curriculum alignment, faculty development and practical exposure.
            </p>
            <div className="mt-4">
              <SsWorkflowBanner
                tone="blue"
                steps={[
                  "Industry demand", "Curriculum alignment", "Practical exposure",
                  "Faculty development", "Collaboration",
                ]}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ss-muted)]">
              <span className="font-semibold text-[var(--ss-ink-soft)]">{DEMO_FACULTY.name}</span>
              <span>·</span>
              <span>{DEMO_FACULTY.department}</span>
              <span>·</span>
              <span>{DEMO_INSTITUTION.name}</span>
            </div>
          </div>
        </div>
      </SsCard>

      {/* ── 2. INDUSTRY IS ASKING FOR (§21) ──────────────────────── */}
      <IndustryAskingPanel
        rows={industryAsking}
        onExplore={() => navigate("/academia/skills")}
      />

      {/* ── 3. OUR STUDENTS ARE DEMONSTRATING (§22) ───────────────── */}
      <StudentsDemonstratingPanel
        rows={studentsDemonstrating}
        onExplore={() => navigate("/academia/curriculum")}
      />

      {/* ── 4. WHERE IS THE GAP? (§23) — CENTERPIECE ─────────────── */}
      <GapCenterpiece rows={alignmentGaps} />

      {/* ── 5. CURRICULUM ALIGNMENT VISUAL (§24) ──────────────────── */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="blue" icon={Workflow}>§24 · Alignment chain</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
              Curriculum alignment visual
            </h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
              The full chain: industry demand → skill → curriculum coverage → student competency → practical evidence → alignment status.
            </p>
          </div>
          <SsDataSourceLabel source="curriculum" />
        </div>
        {topGapSkills.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No alignment gaps" hint="Every demanded skill is currently aligned." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topGapSkills.map((r) => {
              const chain = AcademiaAggregator.getAlignmentChain(r.skillId);
              if (!chain) return null;
              return (
                <div key={r.skillId} className="rounded-xl border border-[var(--ss-border)] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Skill</p>
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{r.skillName}</p>
                    </div>
                    <SsAlertPill tone={r.alignment === "Gap" ? "critical" : "warning"} label={r.alignment} />
                  </div>
                  <SsAlignmentChain rows={chain} />
                </div>
              );
            })}
          </div>
        )}
      </SsCard>

      {/* ── 6. PRACTICAL EXPOSURE GAP (§26) ──────────────────────── */}
      <PracticalExposureGapPanel rows={alignmentGaps} />

      {/* ── 7. WHAT SHOULD WE DO NEXT? (§27, §28) ─────────────────── */}
      <ActionCenterPanel
        rows={actionCenter}
        alignment={a.alignment}
        onNavigate={(path) => navigate(path)}
      />

      {/* ── 8. FACULTY DEVELOPMENT teaser (§29, §30) ─────────────── */}
      <FacultyDevelopmentTeaser
        opps={facultyOpps}
        onExplore={() => navigate("/academia/opportunities")}
      />

      {/* ── 9. MENTOR MATCHING teaser (§31) ──────────────────────── */}
      <MentorMatchingTeaser
        matches={mentorMatches.slice(0, 2)}
        onExplore={() => navigate("/academia/mentorship")}
      />

      {/* ── 10. COLLABORATION HUB teaser (§32) ───────────────────── */}
      <CollaborationTeaser
        rows={activeCollabs}
        onExplore={() => navigate("/academia/collaboration")}
        onPropose={() => createCollaboration({
          organization: "Industry partner (TBD)",
          type: "Workshop",
          title: "New collaboration request",
          skills: [],
          targetRoles: [],
          participants: 0,
          date: new Date().toISOString().slice(0, 10),
          requestedBy: "Academia",
        })}
      />

      {/* ── 11. INTELLIGENCE ASSISTANT (§58) ─────────────────────── */}
      <AcademiaAssistant
        industryAsking={industryAsking}
        studentsDemonstrating={studentsDemonstrating}
        alignmentGaps={alignmentGaps}
        mentorMatches={mentorMatches}
      />
    </div>
  );
}

// Inline alias removed — CheckCircle2 is imported directly from lucide-react.

// ── §21 panel ────────────────────────────────────────────────────
function IndustryAskingPanel({
  rows,
  onExplore,
}: {
  rows: ReturnType<typeof AcademiaAggregator.getIndustryAskingFor>;
  onExplore: () => void;
}) {
  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="orange" icon={TrendingUp}>§21 · What industry needs</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Industry is asking for
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Derived from published opportunities + industry challenges. Not a separate demand dataset.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SsDataSourceLabel source="platform" />
          <button onClick={onExplore} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">
            Explore →
          </button>
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => (
          <div key={s.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--ss-ink)]">{s.skillName}</p>
              <SsDemandBadge level={s.demandLevel} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--ss-muted)]">
              <span><b className="text-[var(--ss-ink)]">{s.opportunityCount}</b> opps</span>
              <span><b className="text-[var(--ss-ink)]">{s.challengeCount}</b> challenges</span>
            </div>
            {s.targetRoles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {s.targetRoles.slice(0, 3).map((roleId) => (
                  <span key={roleId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-blue-600)]">
                    {ALL_ROLES.find((r) => r.roleId === roleId)?.roleName ?? roleId}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SsCard>
  );
}

// ── §22 panel ────────────────────────────────────────────────────
function StudentsDemonstratingPanel({
  rows,
  onExplore,
}: {
  rows: ReturnType<typeof AcademiaAggregator.getStudentsDemonstrating>;
  onExplore: () => void;
}) {
  const confTone = (c: string): "info" | "warning" | "emerging" =>
    c === "High" ? "info" : c === "Moderate" ? "warning" : "emerging";
  const expTone = (p: string): "critical" | "warning" | "info" | "emerging" =>
    p === "Strong" ? "info" : p === "Moderate" ? "warning" : p === "Limited" ? "emerging" : "critical";

  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="teal" icon={Users}>§22 · What students demonstrate</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Our students are demonstrating
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Aggregate evidence across the shared candidate pool — no private individual records exposed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SsDataSourceLabel source="platform" />
          <button onClick={onExplore} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">
            Open matrix →
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
            <tr>
              <th className="py-2 pr-3 text-left font-semibold">Skill</th>
              <th className="py-2 pr-3 text-left font-semibold">Avg Competency</th>
              <th className="py-2 pr-3 text-left font-semibold">Evidence Confidence</th>
              <th className="py-2 pr-3 text-left font-semibold">Practical Exposure</th>
              <th className="py-2 pr-3 text-left font-semibold">Evidence Records</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.skillId} className="border-t border-[var(--ss-border)]">
                <td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{s.skillName}</td>
                <td className="py-2 pr-3">
                  <span className="font-semibold text-[var(--ss-ink)]">{s.avgCompetency}</span>
                  <span className="text-[var(--ss-muted)]">/100</span>
                </td>
                <td className="py-2 pr-3"><SsAlertPill tone={confTone(s.evidenceConfidence)} label={s.evidenceConfidence} /></td>
                <td className="py-2 pr-3"><SsAlertPill tone={expTone(s.practicalExposure)} label={s.practicalExposure} /></td>
                <td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{s.evidenceCount} <span className="text-[var(--ss-muted)]">({s.verifiedCount} verified)</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SsCard>
  );
}

// ── §23 centerpiece ──────────────────────────────────────────────
function GapCenterpiece({ rows }: { rows: CurriculumAlignmentRow[] }) {
  return (
    <SsCard tone="pop" className="overflow-hidden p-0">
      <div className="border-l-4 border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]/60 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="orange" icon={AlertTriangle}>§23 · Centerpiece</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
              Where is the gap?
            </h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
              The intersection of industry demand, curriculum coverage and student practical evidence. Skills that need attention.
            </p>
          </div>
          <SsDataSourceLabel source="curriculum" />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No alignment gaps" hint="Every demanded skill is currently aligned with student competency." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--ss-border)] bg-white">
            <table className="w-full text-xs">
              <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Skill</th>
                  <th className="px-3 py-2 text-left font-semibold">Industry Demand</th>
                  <th className="px-3 py-2 text-left font-semibold">Curriculum</th>
                  <th className="px-3 py-2 text-left font-semibold">Practical Evidence</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((r) => (
                  <tr key={r.skillId} className="border-t border-[var(--ss-border)]">
                    <td className="px-3 py-2.5 font-semibold text-[var(--ss-ink)]">{r.skillName}</td>
                    <td className="px-3 py-2.5"><SsDemandBadge level={r.industryDemand} /></td>
                    <td className="px-3 py-2.5 text-[var(--ss-ink-soft)]">{r.curriculumCoverage}</td>
                    <td className="px-3 py-2.5"><SsAlertPill tone={r.practicalEvidence === "Strong" ? "info" : r.practicalEvidence === "Moderate" ? "warning" : "critical"} label={r.practicalEvidence} /></td>
                    <td className="px-3 py-2.5"><SsAlertPill tone={r.alignment === "Gap" ? "critical" : "warning"} label={r.alignment === "Gap" ? "Needs Attention" : "Watch"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SsCard>
  );
}

// ── §26 Practical exposure gap ────────────────────────────────────
function PracticalExposureGapPanel({ rows }: { rows: CurriculumAlignmentRow[] }) {
  const withGap = rows.filter((r) => r.practicalExposureGap !== "Low").slice(0, 6);
  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="blue" icon={Layers}>§26 · Theory vs practice</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Practical exposure gap
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Where the curriculum covers theory but students have limited practical evidence. Recommended actions per skill.
          </p>
        </div>
        <SsDataSourceLabel source="curriculum" />
      </div>
      {withGap.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No practical exposure gaps" />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {withGap.map((r) => (
            <div key={r.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ss-ink)]">{r.skillName}</p>
                <SsAlertPill tone={r.practicalExposureGap === "High" ? "critical" : "warning"} label={`${r.practicalExposureGap} exposure gap`} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Curriculum (theory)</p>
                  <p className="text-[var(--ss-ink)]">{r.curriculumCoverage}</p>
                </div>
                <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Student evidence</p>
                  <p className="text-[var(--ss-ink)]">{r.practicalEvidence}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.suggestedEnrichment.map((e) => (
                  <span key={e} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)] uppercase tracking-wide">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SsCard>
  );
}

// ── §27 + §28 Action Center ──────────────────────────────────────
const ACTION_CTAS: { key: string; label: string; icon: LucideIcon; route: string }[] = [
  { key: "workshop", label: "Industry Workshop", icon: Wrench, route: "/academia/workshops" },
  { key: "fdp", label: "Faculty FDP", icon: FileText, route: "/academia/fdp" },
  { key: "project", label: "Live Project", icon: Briefcase, route: "/academia/projects" },
  { key: "mentorship", label: "Mentorship", icon: GraduationCap, route: "/academia/mentorship" },
  { key: "hackathon", label: "Hackathon", icon: Trophy, route: "/academia/collaboration" },
  { key: "curriculum", label: "Curriculum Enrichment", icon: BookOpen, route: "/academia/curriculum" },
];

function ActionCenterPanel({
  rows,
  alignment,
  onNavigate,
}: {
  rows: ReturnType<typeof AcademiaAggregator.getAcademiaActionCenter>;
  alignment: CurriculumAlignmentRow[];
  onNavigate: (path: string) => void;
}) {
  const [whyFor, setWhyFor] = useState<string | null>(null);
  const whyRow = whyFor ? alignment.find((r) => r.skillId === whyFor) : undefined;

  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="blue" icon={Lightbulb}>§27 · Action center</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            What should we do next?
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Each recommended action is derived from alignment data. Open the “Why?” affordance to see the contributing factors.
          </p>
        </div>
        <SsDataSourceLabel source="curriculum" />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No actions queued" hint="All demanded skills are currently aligned." />
      ) : (
        <div className="space-y-3">
          {rows.slice(0, 6).map((ac) => (
            <div key={ac.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{ac.skillName}</p>
                    <SsDemandBadge level={ac.demand as "High" | "Medium" | "Low"} />
                    <SsAlertPill tone={ac.gap === "High" ? "critical" : "warning"} label={`${ac.gap} gap`} />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--ss-muted)]">
                    <span className="font-semibold text-[var(--ss-ink-soft)]">Affected cohort:</span> {ac.affectedCohort || "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--ss-muted)]">
                    <span className="font-semibold text-[var(--ss-ink-soft)]">Expected outcome:</span> {ac.expectedOutcome || "—"}
                  </p>
                </div>
                <button
                  onClick={() => setWhyFor(ac.skillId)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ss-blue-600)] hover:bg-[var(--ss-blue-50)]"
                >
                  <HelpCircle className="h-3 w-3" /> Why?
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ACTION_CTAS.map((cta) => {
                  const recommended = ac.recommendedActions.some((ra: string) =>
                    ra.toLowerCase().includes(cta.key === "workshop" ? "workshop" : cta.key === "project" ? "project" : cta.key)
                  );
                  const Icon = cta.icon;
                  return (
                    <button
                      key={cta.key}
                      onClick={() => onNavigate(cta.route)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
                        recommended
                          ? "bg-[var(--ss-blue-600)] text-white hover:bg-[var(--ss-blue-500)]"
                          : "border border-[var(--ss-border)] bg-white text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {cta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <SsWhyModal
        open={!!whyFor}
        onClose={() => setWhyFor(null)}
        title={whyRow ? `Why this action for ${whyRow.skillName}?` : "Why this action?"}
        subtitle="Contributing factors derived from the curriculum alignment dataset"
        factors={buildWhyFactors(whyRow)}
      >
        <div className="rounded-md border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] text-[var(--ss-muted)]">
          <Info className="mr-1 inline h-3 w-3" />
          Recommendations are computed from alignment data — industry demand, curriculum coverage, student competency and practical evidence. The numbers above come from the platform dataset, not a separate demand forecast.
        </div>
      </SsWhyModal>
    </SsCard>
  );
}

// ── §29/§30 Faculty Development teaser ───────────────────────────
function FacultyDevelopmentTeaser({
  opps,
  onExplore,
}: {
  opps: FacultyOpportunity[];
  onExplore: () => void;
}) {
  const faculty = DEMO_FACULTY;
  const recommended = opps.filter((o) => o.skills.some((s) => faculty.skills.some((fs) => fs.skillId === s.skillId))).slice(0, 2);
  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="blue" icon={Briefcase}>§29 · Recommended for you</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Faculty development
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Opportunities that match your expertise and current industry demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SsDataSourceLabel source="demo" />
          <button onClick={onExplore} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View all →</button>
        </div>
      </div>
      {recommended.length === 0 ? (
        <EmptyState icon={Briefcase} title="No matching opportunities" hint="No faculty opportunities currently match your expertise." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {recommended.map((o) => {
            const matchesExpertise = o.skills.some((s) => faculty.skills.some((fs) => fs.skillId === s.skillId));
            return (
              <div key={o.id} className="rounded-lg border border-[var(--ss-blue-600)]/40 bg-[var(--ss-blue-50)]/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{o.organization} · {o.type.replace(/_/g, " ")} · {o.duration}</p>
                  </div>
                  <SsBadge tone="blue" className="text-[10px]">Recommended</SsBadge>
                </div>
                <div className="mt-3 space-y-1.5">
                  <SsWhyFactor ok="pass" label="Matches faculty expertise" detail={faculty.skills.filter((fs) => o.skills.some((s) => s.skillId === fs.skillId)).map((fs) => fs.skillName).join(", ") || "—"} />
                  <SsWhyFactor ok="pass" label="Relevant to current industry demand" detail={`${o.targetRoles.length} target role(s) mapped`} />
                  <SsWhyFactor ok="pass" label="Student-facing practical opportunity" detail={matchesExpertise ? "Skills map to current curriculum" : "Cross-domain exposure"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {o.skills.map((s) => (
                    <span key={s.skillId} className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-blue-600)]">{s.skillName}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SsCard>
  );
}

// ── §31 Mentor Matching teaser ───────────────────────────────────
function MentorMatchingTeaser({
  matches,
  onExplore,
}: {
  matches: MentorMatch[];
  onExplore: () => void;
}) {
  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="teal" icon={GraduationCap}>§31 · Mentor matching</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Find a mentor
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Student gap × faculty expertise — derived from shared platform data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SsDataSourceLabel source="platform" />
          <button onClick={onExplore} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">Open mentorship →</button>
        </div>
      </div>
      {matches.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No matches" hint="No students currently need mentorship mapped to your expertise." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {matches.map((m) => (
            <div key={m.student.studentId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: m.student.avatarColor }}>{m.student.name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--ss-ink)]">{m.student.name}</p>
                  <p className="truncate text-[10px] text-[var(--ss-muted)]">{m.student.targetRole} · {m.student.college}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--ss-faint)]" />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ss-blue-50)] text-[10px] font-bold text-[var(--ss-blue-600)]">{m.faculty?.name.slice(0, 1) ?? "?"}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.gapSkills.map((g) => (
                  <span key={g} className="rounded-full bg-[var(--ss-orange-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-orange-600)]">{g} gap</span>
                ))}
              </div>
              {m.faculty && (
                <p className="mt-2 text-[10px] text-[var(--ss-muted)]">{m.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SsCard>
  );
}

// ── §32 Collaboration teaser ─────────────────────────────────────
function CollaborationTeaser({
  rows,
  onExplore,
  onPropose,
}: {
  rows: Collaboration[];
  onExplore: () => void;
  onPropose: () => void;
}) {
  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <SsEyebrow tone="blue" icon={Building2}>§32 · Industry ↔ Academia</SsEyebrow>
          <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)] sm:text-lg">
            Collaboration hub
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
            Active industry-academia collaborations across the lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SsDataSourceLabel source="demo" />
          <button onClick={onExplore} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">Open hub →</button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Building2} title="No collaborations" hint="Propose your first industry collaboration." action={
          <Button variant="blue" size="sm" className="h-8" onClick={onPropose}>Propose collaboration</Button>
        } />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <div key={c.id} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ss-ink)]">{c.title}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.date}</p>
                </div>
                <SsBadge tone={c.status === "Completed" ? "teal" : c.status === "Active" || c.status === "Scheduled" ? "blue" : "orange"} className="text-[10px]">{c.status}</SsBadge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.skills.map((s) => (
                  <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[var(--ss-muted)]">{c.participants} participants</p>
            </div>
          ))}
        </div>
      )}
    </SsCard>
  );
}

// ── §58 Intelligence Assistant ────────────────────────────────────
function AcademiaAssistant({
  industryAsking,
  studentsDemonstrating,
  alignmentGaps,
  mentorMatches,
}: {
  industryAsking: ReturnType<typeof AcademiaAggregator.getIndustryAskingFor>;
  studentsDemonstrating: ReturnType<typeof AcademiaAggregator.getStudentsDemonstrating>;
  alignmentGaps: CurriculumAlignmentRow[];
  mentorMatches: MentorMatch[];
}) {
  const [answered, setAnswered] = useState<Record<string, React.ReactNode>>({});

  const questions = [
    { id: "skills-attention", label: "Which skills need curriculum attention?" },
    { id: "workshops-relevant", label: "Which industry workshops are relevant?" },
    { id: "students-mentorship", label: "Which students need mentorship?" },
    { id: "practical-missing", label: "What practical exposure is missing?" },
  ];

  const onAsk = (id: string) => {
    if (id === "skills-attention") {
      const list = alignmentGaps.slice(0, 4).map((g) => `${g.skillName} (${g.alignment}, ${g.curriculumCoverage} coverage)`).join(" · ") || "No alignment gaps detected.";
      setAnswered((prev) => ({ ...prev, [id]: <span>{list}</span> }));
    } else if (id === "workshops-relevant") {
      const list = industryAsking
        .filter((s) => s.demandLevel === "High")
        .slice(0, 3)
        .map((s) => `${s.skillName} — ${s.opportunityCount} active opportunities, ${s.challengeCount} challenge(s)`)
        .join(" · ") || "No high-demand skills detected.";
      setAnswered((prev) => ({ ...prev, [id]: <span>{list}</span> }));
    } else if (id === "students-mentorship") {
      const list = mentorMatches.slice(0, 3).map((m) => `${m.student.name} (${m.student.targetRole}) — gap: ${m.gapSkills.join(", ")}`).join(" · ") || "No students currently need mentorship mapped to faculty expertise.";
      setAnswered((prev) => ({ ...prev, [id]: <span>{list}</span> }));
    } else if (id === "practical-missing") {
      const list = studentsDemonstrating
        .filter((s) => s.practicalExposure === "Limited" || s.practicalExposure === "None")
        .slice(0, 4)
        .map((s) => `${s.skillName} — exposure ${s.practicalExposure}`)
        .join(" · ") || "No practical exposure gaps detected.";
      setAnswered((prev) => ({ ...prev, [id]: <span>{list}</span> }));
    }
  };

  return (
    <SsIntelligenceAssistant
      tone="blue"
      title="Academic Alignment Assistant"
      questions={questions}
      onAsk={onAsk}
      answered={answered}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// SKILL INTELLIGENCE PAGE (/academia/skills) — restyle + labels
// ═══════════════════════════════════════════════════════════════
function SkillIntelligence() {
  const a = useAcademia();
  const [whySig, setWhySig] = useState<IndustrySkillSignal | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader
        title="Skill Intelligence"
        subtitle="Industry signals + emerging skills + student cohort gaps (derived from shared platform data)"
        icon={BarChart3}
        accent="#2563EB"
        action={<DemoBadge />}
      />

      {/* §5/§6 — Industry signals */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="orange" icon={TrendingUp}>§5 · Industry skill signals</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Industry demand signals</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Derived from published opportunities — not a separate demand dataset.</p>
          </div>
          <SsDataSourceLabel source="platform" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
              <tr>
                <th className="py-2 pr-3 text-left font-semibold">Skill</th>
                <th className="py-2 pr-3 text-left font-semibold">Demand</th>
                <th className="py-2 pr-3 text-left font-semibold">Opp Count</th>
                <th className="py-2 pr-3 text-left font-semibold">Target Roles</th>
                <th className="py-2 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {a.signals.map((sig) => (
                <tr key={sig.skillId} className="border-t border-[var(--ss-border)]">
                  <td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{sig.skillName}</td>
                  <td className="py-2 pr-3"><SsDemandBadge level={sig.demandLevel} /></td>
                  <td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{sig.opportunityCount}</td>
                  <td className="py-2 pr-3 text-[var(--ss-muted)]">{sig.targetRoles.map((r) => ALL_ROLES.find((role) => role.roleId === r)?.roleName ?? r).join(", ")}</td>
                  <td className="py-2"><button onClick={() => setWhySig(sig)} className="text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Why?</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SsCard>

      {/* §7/§8 — Emerging skills */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="blue" icon={Sparkles}>§7 · Emerging skills</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">High-demand skills</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Transparent rule: skills with High demand across current opportunities, surfaced with their curriculum coverage.</p>
          </div>
          <SsDataSourceLabel source="platform" />
        </div>
        {a.emerging.length === 0 ? (
          <EmptyState icon={Sparkles} title="No emerging skills" hint="No high-demand skills detected in current data." />
        ) : (
          <div className="grid gap-2.5 md:grid-cols-2">
            {a.emerging.map((s) => (
              <div key={s.skillId} className="rounded-lg border border-[var(--ss-border)] p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ss-ink)]">{s.skillName}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{s.reason}</p>
                  </div>
                  <SsAlertPill tone="emerging" label={`Coverage: ${s.curriculumCoverage}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SsCard>

      {/* §9/§10 — Cohort gaps */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="teal" icon={Users}>§9 · Cohort skill gaps</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Student skill gaps (aggregate)</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Aggregate from shared candidate pool — no private individual data exposed.</p>
          </div>
          <SsDataSourceLabel source="platform" />
        </div>
        <div className="space-y-2">
          {a.gaps.map((g: CohortSkillGap) => <CohortGapRow key={g.skillId} gap={g} />)}
        </div>
      </SsCard>

      <SsWhyModal
        open={!!whySig}
        onClose={() => setWhySig(null)}
        title={whySig ? `Why is ${whySig.skillName} in demand?` : ""}
        subtitle="Derived from current platform/demo opportunity data"
        factors={[
          { ok: "pass", label: `${whySig?.opportunityCount ?? 0} active opportunities reference this skill`, detail: whySig?.recentSignal },
          { ok: "warn", label: "Demand is computed from the platform dataset", detail: "It is not a claim about industry-wide demand beyond the platform dataset." },
        ]}
      >
        <div className="rounded-md border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] text-[var(--ss-muted)]">
          <Info className="mr-1 inline h-3 w-3" />
          DEMO DATA — the platform opportunity dataset is the only source for this signal. No external labour-market feed is integrated yet.
        </div>
      </SsWhyModal>
    </div>
  );
}

function CohortGapRow({ gap: g }: { gap: CohortSkillGap }) {
  return (
    <div className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--ss-ink)]">{g.skillName}</p>
          <p className="text-[10px] text-[var(--ss-muted)]">Avg {g.avgCompetency} · {g.affectedStudents} students · roles: {g.targetRoles.map((r) => ALL_ROLES.find((role) => role.roleId === r)?.roleName ?? r).join(", ")}</p>
        </div>
        <SsAlertPill tone={g.gap === "High" ? "critical" : g.gap === "Medium" ? "warning" : "info"} label={`${g.gap} gap`} />
      </div>
      <div className="mt-2">
        <SsCoverageBar label="Cohort avg vs target" demand={COMPETENCY_TARGET} supply={g.avgCompetency} required={COMPETENCY_TARGET} suffix="" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CURRICULUM ALIGNMENT PAGE (/academia/curriculum) — REBUILD
// (§24 alignment chain · §25 course×skill matrix · §26 practical gap)
// ═══════════════════════════════════════════════════════════════
function CurriculumAlignmentPage() {
  const a = useAcademia();
  const matrix = useMemo(() => AcademiaAggregator.getCourseSkillMatrix(), [a.alignment]);

  // Skill picker for the alignment chain section (top 5 by gap rank)
  const chainSkills = useMemo(
    () => a.alignment.slice(0, 5).map((r) => ({ skillId: r.skillId, skillName: r.skillName })),
    [a.alignment],
  );
  const [selectedSkill, setSelectedSkill] = useState<string>(chainSkills[0]?.skillId ?? "");
  // If the picker is reset (e.g., data changed), keep selection valid
  const effectiveSkillId = chainSkills.some((s) => s.skillId === selectedSkill) ? selectedSkill : (chainSkills[0]?.skillId ?? "");

  const [cellDetail, setCellDetail] = useState<{ courseId: string; skillId: string } | null>(null);

  // Build SsHeatmap rows/cols/cells
  const rows = matrix.courseRows.map((c) => `${c.name} (Sem ${c.semester})`);
  const cols = matrix.skillCols.map((s) => s.name);
  const cells: Record<string, { value: number; label?: string }> = {};
  for (let y = 0; y < matrix.courseRows.length; y++) {
    for (let x = 0; x < matrix.skillCols.length; x++) {
      const course = matrix.courseRows[y];
      const sk = matrix.skillCols[x];
      const entry = matrix.matrix[course.id]?.[sk.id];
      const rank = entry ? coverageRank(entry.coverage) : 0;
      cells[`${y}|${x}`] = { value: rank, label: entry ? coverageShort(entry.coverage) : undefined };
    }
  }

  // Detail panel content for the selected matrix cell
  const cellDetailContent = useMemo(() => {
    if (!cellDetail) return null;
    const course = matrix.courseRows.find((c) => c.id === cellDetail.courseId);
    const sk = matrix.skillCols.find((s) => s.id === cellDetail.skillId);
    const entry = matrix.matrix[cellDetail.courseId]?.[cellDetail.skillId];
    const alignmentRow = a.alignment.find((r) => r.skillId === cellDetail.skillId);
    if (!course || !sk) return null;
    const recommended = alignmentRow?.suggestedEnrichment ?? [];
    return {
      course,
      sk,
      entry,
      alignmentRow,
      recommended,
    };
  }, [cellDetail, matrix, a.alignment]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Curriculum Alignment"
        subtitle="Industry demand → curriculum coverage → student competency → practical evidence"
        icon={BookOpen}
        accent="#2563EB"
        action={<DemoBadge />}
      />

      {/* §24 — Alignment chain */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="blue" icon={Workflow}>§24 · Alignment chain</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Skill alignment chain</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Pick a skill to see the full chain from industry demand to alignment status.</p>
          </div>
          <SsDataSourceLabel source="curriculum" />
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Skill</label>
          <select
            value={effectiveSkillId}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="h-9 rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"
          >
            {chainSkills.map((s) => (
              <option key={s.skillId} value={s.skillId}>{s.skillName}</option>
            ))}
          </select>
        </div>
        {effectiveSkillId ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--ss-border)] bg-white p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Vertical chain</p>
              {(() => {
                const chain = AcademiaAggregator.getAlignmentChain(effectiveSkillId);
                if (!chain) return <p className="text-sm text-[var(--ss-muted)]">No alignment chain available for this skill.</p>;
                return <SsAlignmentChain rows={chain} />;
              })()}
            </div>
            <AlignmentChainLegend />
            <div className="rounded-xl border border-[var(--ss-border)] bg-white p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">What this means</p>
              <p className="text-xs text-[var(--ss-ink-soft)]">
                The chain surfaces where the break in alignment happens — between demand and curriculum, between curriculum and competency, or between competency and practical evidence.
              </p>
              <p className="mt-2 text-[11px] text-[var(--ss-muted)]">
                Every value above is derived from the current curriculum mappings and the shared candidate pool. No external LMS/ERP feed is integrated.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="No skills available" />
        )}
      </SsCard>

      {/* §25 — Course × Skill matrix */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="teal" icon={Layers}>§25 · Course × skill matrix</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Curriculum coverage heatmap</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Click any cell to drill into the course-skill alignment detail.</p>
          </div>
          <SsDataSourceLabel source="curriculum" />
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-muted)]">
          <span>Legend:</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[var(--ss-surface-3)]" /> Not covered</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-red-50" /> Introductory</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-amber-50" /> Moderate</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[var(--ss-blue-50)]" /> Strong</span>
        </div>
        <SsHeatmap rows={rows} cols={cols} cells={cells} onCellClick={(y, x) => {
          const course = matrix.courseRows[y];
          const sk = matrix.skillCols[x];
          if (course && sk) setCellDetail({ courseId: course.id, skillId: sk.id });
        }} />
      </SsCard>

      {/* §26 — Practical exposure gap table */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="orange" icon={Target}>§26 · Theory vs practice</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Practical exposure gap</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">Where the curriculum covers theory but practical evidence is limited.</p>
          </div>
          <SsDataSourceLabel source="curriculum" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-[var(--ss-border)] bg-white">
          <table className="w-full text-xs">
            <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Skill</th>
                <th className="px-3 py-2 text-left font-semibold">Curriculum (theory)</th>
                <th className="px-3 py-2 text-left font-semibold">Student competency</th>
                <th className="px-3 py-2 text-left font-semibold">Practical evidence</th>
                <th className="px-3 py-2 text-left font-semibold">Exposure gap</th>
                <th className="px-3 py-2 text-left font-semibold">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {a.alignment.map((r) => (
                <tr key={r.skillId} className="border-t border-[var(--ss-border)]">
                  <td className="px-3 py-2 font-medium text-[var(--ss-ink)]">{r.skillName}</td>
                  <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{r.curriculumCoverage}</td>
                  <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{r.studentAvgCompetency}</td>
                  <td className="px-3 py-2"><SsAlertPill tone={r.practicalEvidence === "Strong" ? "info" : r.practicalEvidence === "Moderate" ? "warning" : "critical"} label={r.practicalEvidence} /></td>
                  <td className="px-3 py-2"><SsAlertPill tone={r.practicalExposureGap === "High" ? "critical" : r.practicalExposureGap === "Medium" ? "warning" : "info"} label={r.practicalExposureGap} /></td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.suggestedEnrichment.map((e) => (
                        <span key={e} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--ss-blue-600)]">{e}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SsCard>

      <SsMatrixCellDetail
        open={!!cellDetailContent}
        onClose={() => setCellDetail(null)}
        title={cellDetailContent ? `${cellDetailContent.course.name} × ${cellDetailContent.sk.name}` : ""}
        rows={cellDetailContent ? [
          { label: "Course", value: `${cellDetailContent.course.name} (Sem ${cellDetailContent.course.semester}, ${cellDetailContent.course.department})` },
          { label: "Skill", value: cellDetailContent.sk.name },
          { label: "Curriculum coverage", value: cellDetailContent.entry?.coverage ?? "Not Covered" },
          { label: "Allocated hours", value: cellDetailContent.entry ? `${cellDetailContent.entry.hours}h` : "—" },
          { label: "Industry demand", value: cellDetailContent.entry?.demand ?? "—" },
          { label: "Student competency (cohort avg)", value: cellDetailContent.alignmentRow ? `${cellDetailContent.alignmentRow.studentAvgCompetency}/100` : "—" },
          { label: "Practical evidence", value: cellDetailContent.alignmentRow?.practicalEvidence ?? "—" },
        ] : []}
        action={cellDetailContent && cellDetailContent.recommended.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Recommended action</p>
            <div className="flex flex-wrap gap-1">
              {cellDetailContent.recommended.map((e: string) => (
                <span key={e} className="rounded-full bg-[var(--ss-blue-50)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-blue-600)] uppercase tracking-wide">{e}</span>
              ))}
            </div>
          </div>
        ) : undefined}
      />
    </div>
  );
}

function AlignmentChainLegend() {
  const items: { tone: string; label: string }[] = [
    { tone: "border-l-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]", label: "Industry demand" },
    { tone: "border-l-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]", label: "Skill" },
    { tone: "border-l-[var(--ss-blue-500)] bg-[var(--ss-blue-50)]", label: "Curriculum coverage" },
    { tone: "border-l-[var(--ss-teal-600)] bg-[var(--ss-teal-50)]", label: "Student competency" },
    { tone: "border-l-[var(--ss-teal-500)] bg-[var(--ss-teal-50)]", label: "Practical evidence" },
    { tone: "border-l-[var(--ss-navy-900)] bg-[var(--ss-surface-3)]", label: "Alignment status" },
  ];
  return (
    <div className="rounded-xl border border-[var(--ss-border)] bg-white p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Legend</p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className={cn("rounded-md border border-l-4 border-[var(--ss-border)] px-2 py-1 text-[10px] font-semibold", it.tone)}>
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FACULTY DEVELOPMENT PAGE (/academia/opportunities) — REBUILD
// (§29, §30) — every opportunity surfaces skill / industry / eligibility /
// availability relevance, with a "Recommended for you" pinned card
// ═══════════════════════════════════════════════════════════════
const FAC_DEV_FILTERS: { key: string; label: string }[] = [
  { key: "MY_EXPERTISE", label: "My Expertise" },
  { key: "INDUSTRY_OPPORTUNITIES", label: "Industry Opportunities" },
  { key: "FDP", label: "FDP" },
  { key: "INDUSTRIAL_TRAINING", label: "Industrial Training" },
  { key: "RESEARCH_COLLABORATION", label: "Research" },
  { key: "CONSULTANCY", label: "Consultancy" },
  { key: "MENTORSHIP", label: "Mentorship" },
];

function FacultyDevelopmentPage() {
  const opps = AcademiaService.getFacultyOpportunities();
  const apps = useAcademiaStore((s) => s.facultyApplications);
  const { applyToFacultyOpp } = useAcademiaStore();
  const [detail, setDetail] = useState<FacultyOpportunity | null>(null);
  const [filter, setFilter] = useState<string>("MY_EXPERTISE");
  const faculty = DEMO_FACULTY;

  const matchesExpertise = (o: FacultyOpportunity) =>
    o.skills.some((s) => faculty.skills.some((fs) => fs.skillId === s.skillId));

  const filtered = useMemo(() => {
    if (filter === "MY_EXPERTISE") return opps.filter(matchesExpertise);
    if (filter === "INDUSTRY_OPPORTUNITIES") return opps.filter((o) => o.type === "FACULTY_INTERNSHIP" || o.type === "GUEST_LECTURE");
    if (filter === "MENTORSHIP") return opps.filter((o) => o.type === "GUEST_LECTURE");
    return opps.filter((o) => o.type === filter);
  }, [filter, opps]);

  // §30 — "Recommended for you" pinned card
  const recommended = opps.find((o) => matchesExpertise(o) && o.type === "FACULTY_INTERNSHIP") ?? opps.find(matchesExpertise) ?? null;

  return (
    <div className="space-y-6">
      <DashHeader
        title="Faculty Development"
        subtitle="Opportunities aligned to your expertise, current industry demand and student-facing curriculum"
        icon={Briefcase}
        accent="#2563EB"
        action={<DemoBadge />}
      />

      <SsWorkflowBanner tone="blue" steps={["Match expertise", "Industry exposure", "Curriculum feedback", "Student evidence"]} />

      {/* §30 — Recommended for you */}
      {recommended && (
        <SsCard tone="pop" className="overflow-hidden p-0">
          <div className="border-l-4 border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]/60 p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <SsEyebrow tone="blue" icon={Sparkles}>§30 · Recommended for you</SsEyebrow>
                <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">{recommended.title}</h2>
                <p className="text-[10px] text-[var(--ss-muted)]">{recommended.organization} · {recommended.type.replace(/_/g, " ")} · {recommended.duration} · {recommended.location}</p>
              </div>
              <SsDataSourceLabel source="demo" />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <SsWhyFactor ok="pass" label="Matches faculty expertise" detail={faculty.skills.filter((fs) => recommended.skills.some((s) => s.skillId === fs.skillId)).map((fs) => fs.skillName).join(", ") || "—"} />
              <SsWhyFactor ok="pass" label="Relevant to current industry demand" detail={`${recommended.targetRoles.length} target role(s) mapped`} />
              <SsWhyFactor ok="pass" label="Student-facing practical opportunity" detail={recommended.expectedOutcomes ?? "Curriculum feedback loop"} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="blue" size="sm" className="h-8" disabled={apps.some((ap) => ap.opportunityId === recommended.id)} onClick={() => applyToFacultyOpp(recommended.id, faculty.facultyId)}>
                {apps.some((ap) => ap.opportunityId === recommended.id) ? "Applied" : "Apply"}
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setDetail(recommended)}>View details</Button>
            </div>
          </div>
        </SsCard>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FAC_DEV_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
              filter === f.key ? "bg-[var(--ss-blue-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Opportunity cards — surfaces skill/industry/eligibility/availability */}
      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities in this category" hint="Try another filter or check back later." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((o) => {
            const applied = apps.some((ap) => ap.opportunityId === o.id);
            const expMatch = matchesExpertise(o);
            return (
              <SsCard key={o.id} tone="lift" className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{o.organization} · {o.type.replace(/_/g, " ")}</p>
                  </div>
                  {expMatch && <SsBadge tone="blue" className="text-[10px]">Expertise match</SsBadge>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Skill relevance</p>
                    <p className="text-[var(--ss-ink-soft)]">{o.skills.map((s) => s.skillName).join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Industry relevance</p>
                    <p className="text-[var(--ss-ink-soft)]">{o.targetRoles.map((r) => ALL_ROLES.find((role) => role.roleId === r)?.roleName ?? r).join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Eligibility</p>
                    <p className="text-[var(--ss-ink-soft)]">{o.eligibility}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Availability</p>
                    <p className="text-[var(--ss-ink-soft)]">{o.mode} · {o.duration} · deadline {o.deadline}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-8 flex-1 text-[11px]" onClick={() => setDetail(o)}>View</Button>
                  <Button variant="blue" size="sm" className="h-8 flex-1 text-[11px]" disabled={applied} onClick={() => applyToFacultyOpp(o.id, faculty.facultyId)}>{applied ? "Applied" : "Apply"}</Button>
                </div>
              </SsCard>
            );
          })}
        </div>
      )}

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle={detail?.organization}>
        {detail && (
          <div className="space-y-3">
            <DemoBadge />
            <Field label="About" value={detail.description} />
            <Field label="Type" value={detail.type.replace(/_/g, " ")} />
            <Field label="Duration" value={detail.duration} />
            <Field label="Location" value={`${detail.location} · ${detail.mode}`} />
            <Field label="Deadline" value={detail.deadline} />
            <Field label="Eligibility" value={detail.eligibility} />
            {detail.expectedOutcomes && <Field label="Expected Outcomes" value={detail.expectedOutcomes} />}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Relevant Skills</p>
              <div className="mt-1 flex flex-wrap gap-1">{detail.skills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName}</SsBadge>)}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
