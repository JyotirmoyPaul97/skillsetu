"use client";

import { useMemo, useState } from "react";
import {
  LayoutDashboard, BarChart3, GraduationCap, TrendingUp, AlertTriangle, Sparkles,
  ArrowRight, Layers, Users, Briefcase, Filter,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useInstitution, InstitutionService, useInstitutionStore } from "@/lib/institution";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useCareerStore } from "@/lib/career/store";
import { AcademiaService } from "@/lib/academia/academia-service";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import { InstitutionAggregator, useAggregators } from "@/lib/intelligence/aggregators";
import { DashHeader, EmptyState } from "@/components/app/student-parts";
import { SsCard, SsBadge, SsStat as SsStatTile } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import type { DemandSupplyRow, BranchSkillCell, Priority } from "@/lib/institution/institution-model";
import {
  SsDemandBadge, SsPriorityPill, SsCoverageBar, SsHeatmap, SsAlertPill,
  SsWhyModal, SsDataSourceLabel, SsIntelligenceAssistant,
  SsMatrixCellDetail, SsWorkflowBanner,
  SsEmptyState, SsLoadingState, SsErrorState,
} from "@/components/ui/ss-intelligence";

export function InstitutionCore({ section }: { section: string }) {
  if (section === "dashboard") return <InstitutionDashboard />;
  if (section === "skills") return <SkillsIntelligencePage />;
  if (section === "branches") return <BranchIntelligencePage />;
  return <InstitutionDashboard />;
}

// ──────────────────────────────────────────────────────────────────
// Dashboard — Executive Skill Intelligence Command Center (§36–§54)
// ──────────────────────────────────────────────────────────────────
function InstitutionDashboard() {
  const { navigate } = useRouter();
  const inst = useInstitution();
  const { Institution: agg } = useAggregators();
  const alerts = useMemo(() => agg.getAlerts(), [agg]);
  const nextActions = useMemo(() => agg.getNextActions(), [agg]);
  const filters = useInstitutionStore((s) => s.filters);
  const setFilter = useInstitutionStore((s) => s.setFilter);

  // Apply filters to heatmap and demand/supply views (§55 — at least Department + Skill + Role)
  const filteredDemandSupply = useMemo(() => {
    let rows = inst.demandSupply;
    if (filters.skill) rows = rows.filter((r) => r.skillId === filters.skill);
    if (filters.role) rows = rows.filter((r) => r.targetRoles.some((rl) => rl.toLowerCase().includes(filters.role.toLowerCase())));
    return rows;
  }, [inst.demandSupply, filters]);

  const filteredMatrix = useMemo(() => {
    let cells = inst.branchMatrix;
    if (filters.department) cells = cells.filter((c) => c.department === filters.department);
    if (filters.skill) cells = cells.filter((c) => c.skillId === filters.skill);
    return cells;
  }, [inst.branchMatrix, filters]);

  return (
    <div className="space-y-6">
      {/* 1. Hero header (§36) */}
      <DashHeader
        title="Institution Skill Intelligence"
        subtitle="Turn student evidence and industry signals into institution-level decisions."
        icon={LayoutDashboard}
        accent="#0F2547"
      />
      <SsCard tone="soft" className="p-4">
        <SsWorkflowBanner tone="navy" steps={["WHERE WE STAND", "WHAT INDUSTRY NEEDS", "WHERE THE GAP IS", "WHO IS AFFECTED", "WHAT TO DO", "WHAT CHANGED"]} />
      </SsCard>

      {/* 2. INSTITUTION AT A GLANCE (§38) — exec summary, no generic totals */}
      <section>
        <SectionTitle
          eyebrow="§38 · Executive summary"
          title="Institution at a glance"
          right={<SsDataSourceLabel source="platform" />}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          <GlanceTile
            label="Critical skill gaps"
            value={inst.cohortInterventions.filter((i) => i.gap === "Critical").length}
            sub={inst.execSummary.needsAttention[0] ?? "No critical gaps"}
            icon={AlertTriangle}
            tone="orange"
            onClick={() => navigate("/institution/skills")}
          />
          <GlanceTile
            label="Industry demand signals"
            value={inst.demandSupply.length}
            sub={inst.execSummary.emerging[0] ?? "No emerging signals"}
            icon={TrendingUp}
            tone="blue"
            onClick={() => navigate("/institution/skills")}
          />
          <GlanceTile
            label="Students needing intervention"
            value={inst.cohortInterventions.reduce((s, i) => s + i.affectedStudents, 0)}
            sub={`${inst.cohortInterventions.length} skills flagged`}
            icon={Users}
            tone="navy"
            onClick={() => navigate("/institution/interventions")}
          />
          <GlanceTile
            label="Industry collaborations"
            value={inst.collabInsights.active + inst.collabInsights.scheduled}
            sub={`${inst.collabInsights.total} total partnerships`}
            icon={Layers}
            tone="teal"
            onClick={() => navigate("/institution/collaborations")}
          />
          <GlanceTile
            label="Practical-exposure gaps"
            value={AcademiaService.getCurriculumAlignment().filter((a) => a.practicalEvidence === "Limited" || a.practicalEvidence === "None").length}
            sub="skills with low practical evidence"
            icon={Sparkles}
            tone="orange"
            onClick={() => navigate("/institution/alignment")}
          />
          <GlanceTile
            label="Opportunity participation"
            value={inst.appFunnel.total}
            sub={`${inst.appFunnel.shortlisted} shortlisted · ${inst.appFunnel.selected} selected`}
            icon={Briefcase}
            tone="navy"
            onClick={() => navigate("/institution/placements")}
          />
        </div>
      </section>

      {/* 3. WHERE WE STAND (§39) — role readiness */}
      <section>
        <SectionTitle
          eyebrow="§39 · Aggregate standing"
          title="Where we stand"
          right={<SsDataSourceLabel source="platform" />}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SsStatTile label="Average role readiness" value={`${avg(inst.roleReadiness.map((r) => r.avgReadiness))}%`} sub={`${inst.roleReadiness.length} target roles`} icon={TrendingUp} tone="navy" />
          <SsStatTile label="Evidence coverage" value={`${inst.evidencePipeline.total} records`} sub={`${inst.evidencePipeline.byStatus["Verified"] ?? 0} verified`} icon={Layers} tone="teal" />
          <SsStatTile label="Practical exposure" value={`${AcademiaService.getCurriculumAlignment().filter((a) => a.practicalEvidence === "Strong").length} strong`} sub={`${AcademiaService.getCurriculumAlignment().filter((a) => a.practicalEvidence === "Limited" || a.practicalEvidence === "None").length} limited`} icon={Sparkles} tone="orange" />
          <SsStatTile label="Industry engagement" value={inst.collabInsights.active} sub="active partnerships" icon={Briefcase} tone="blue" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {inst.roleReadiness.slice(0, 6).map((r) => (
            <div key={r.roleId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--ss-ink)]">{r.roleName}</p>
                <SsBadge tone={r.avgReadiness >= 70 ? "teal" : r.avgReadiness >= 50 ? "blue" : "orange"} className="text-[10px]">{r.evidenceConfidence}</SsBadge>
              </div>
              <p className="mt-1 text-xl font-bold" style={{ color: r.avgReadiness >= 70 ? "#0D9488" : r.avgReadiness >= 50 ? "#2563EB" : "#EA580C" }}>{r.avgReadiness}%</p>
              <p className="text-[10px] text-[var(--ss-muted)]">{r.studentCount} students · top gap: {r.topGaps[0]?.skillName ?? "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHAT INDUSTRY NEEDS (§40) */}
      <section>
        <SectionTitle
          eyebrow="§40 · Industry demand"
          title="What industry needs"
          right={<SsDataSourceLabel source="platform" />}
        />
        {filteredDemandSupply.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No demand data for selected filters" hint="Adjust filters or publish opportunities in the Industry portal." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDemandSupply.slice(0, 6).map((row) => (
              <div key={row.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--ss-ink)]">{row.skillName}</p>
                  <SsDemandBadge level={row.demand >= 80 ? "Critical" : row.demand >= 60 ? "High" : row.demand >= 40 ? "Medium" : "Low"} />
                </div>
                <p className="mt-1 text-[10px] text-[var(--ss-muted)]">{row.demandSources} opportunities · target roles: {row.targetRoles.slice(0, 2).join(", ")}</p>
                <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Required competency: derived from opportunity skill levels (median 70)</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. WHAT OUR STUDENTS DEMONSTRATE (§41) */}
      <section>
        <SectionTitle
          eyebrow="§41 · Cohort supply"
          title="What our students demonstrate"
          right={<SsDataSourceLabel source="platform" />}
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDemandSupply.slice(0, 6).map((row) => {
            const verified = DEMO_CANDIDATES.flatMap((c) => c.evidence).filter((e) => e.skillId === row.skillId && e.status === "Verified").length;
            const total = DEMO_CANDIDATES.flatMap((c) => c.evidence).filter((e) => e.skillId === row.skillId).length;
            const confidence: "High" | "Moderate" | "Limited" = verified > 0 ? "High" : total > 0 ? "Moderate" : "Limited";
            return (
              <div key={row.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <div className="flex items-center justify-between"><p className="text-xs font-bold text-[var(--ss-ink)]">{row.skillName}</p><SsBadge tone={confidence === "High" ? "teal" : confidence === "Moderate" ? "blue" : "orange"} className="text-[9px]">{confidence}</SsBadge></div>
                <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Average competency: {row.supply}/100</p>
                <p className="text-[10px] text-[var(--ss-muted)]">Evidence: {total} records · {verified} verified</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. DEMAND VS SUPPLY (§42) */}
      <section>
        <SectionTitle
          eyebrow="§42 · Coverage bar"
          title="Demand vs supply"
          right={<SsDataSourceLabel source="demo" />}
        />
        <SsCard tone="soft" className="space-y-3 p-4">
          {filteredDemandSupply.slice(0, 6).map((row) => (
            <SsCoverageBar key={row.skillId} label={row.skillName} demand={row.demand} supply={row.supply} required={70} suffix="" />
          ))}
          {filteredDemandSupply.length === 0 && <p className="text-xs text-[var(--ss-muted)]">No data for current filters.</p>}
        </SsCard>
      </section>

      {/* 7. TOP INSTITUTIONAL SKILL GAPS (§43) */}
      <section>
        <SectionTitle
          eyebrow="§43 · Sorted by gap magnitude"
          title="Top institutional skill gaps"
          right={<SsDataSourceLabel source="platform" />}
        />
        {filteredDemandSupply.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No gaps found for current filters" />
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--ss-border)] bg-white">
            <table className="w-full text-xs">
              <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Skill</th>
                  <th className="px-3 py-2 text-left font-semibold">Demand</th>
                  <th className="px-3 py-2 text-left font-semibold">Supply</th>
                  <th className="px-3 py-2 text-left font-semibold">Gap</th>
                  <th className="px-3 py-2 text-left font-semibold">Affected programs</th>
                  <th className="px-3 py-2 text-left font-semibold">Students</th>
                  <th className="px-3 py-2 text-left font-semibold">Roles</th>
                  <th className="px-3 py-2 text-left font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandSupply.map((row) => {
                  const affectedDepts = [...new Set(inst.branchMatrix.filter((c) => c.skillId === row.skillId).map((c) => c.department))];
                  const affectedStudents = inst.branchMatrix.filter((c) => c.skillId === row.skillId).reduce((s, c) => s + c.affectedStudents, 0);
                  const priority: Priority = row.gap >= 40 ? "Critical" : row.gap >= 25 ? "High" : row.gap >= 10 ? "Medium" : "Low";
                  return (
                    <tr key={row.skillId} className="border-t border-[var(--ss-border)]">
                      <td className="px-3 py-2 font-semibold text-[var(--ss-ink)]">{row.skillName}</td>
                      <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{row.demand}</td>
                      <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{row.supply}</td>
                      <td className="px-3 py-2 font-semibold" style={{ color: row.gap >= 25 ? "#BE123C" : row.gap >= 10 ? "#B45309" : "#0D9488" }}>{row.gap}</td>
                      <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{affectedDepts.length ? affectedDepts.join(", ") : "—"}</td>
                      <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{affectedStudents || row.supplySources}</td>
                      <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{row.targetRoles.slice(0, 2).join(", ")}</td>
                      <td className="px-3 py-2"><SsPriorityPill priority={priority} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 8. BRANCH × SKILL INTELLIGENCE (§44) */}
      <BranchHeatmapSection matrix={filteredMatrix} />

      {/* 9. INTELLIGENCE ALERTS (§53) */}
      <section>
        <SectionTitle
          eyebrow="§53 · Aggregator alerts"
          title="Intelligence alerts"
          right={<SsDataSourceLabel source="platform" />}
        />
        {alerts.length === 0 ? (
          <SsEmptyState tone="institution" icon={Sparkles} title="No active intelligence alerts" hint="All demand, supply and evidence signals are within acceptable thresholds." />
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => <AlertRow key={a.id} alert={a} />)}
          </div>
        )}
      </section>

      {/* 10. WHAT SHOULD THE INSTITUTION DO NEXT? (§54) */}
      <section>
        <SectionTitle
          eyebrow="§54 · Prioritised recommendations"
          title="What should the institution do next?"
          right={<SsDataSourceLabel source="platform" />}
        />
        {nextActions.length === 0 ? (
          <SsEmptyState tone="institution" icon={Sparkles} title="No recommended actions" hint="All demand signals are matched by supply — no intervention priority surfaced." />
        ) : (
          <div className="space-y-2">
            {nextActions.map((a) => (
              <SsCard key={a.rank} tone="lift" className="flex items-start gap-3 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ss-navy-900)] text-xs font-bold text-white">{a.rank}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{a.title}</p>
                    <SsPriorityPill priority={a.priority as Priority} />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--ss-muted)]">{a.reason}</p>
                  <p className="mt-1 text-[10px] text-[var(--ss-blue-600)]">Suggested action: {a.suggestedAction}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 shrink-0 text-[11px]" onClick={() => navigate("/institution/interventions")}>Open Action Center</Button>
              </SsCard>
            ))}
          </div>
        )}
      </section>

      {/* 11. SsIntelligenceAssistant (§59) — navy tone */}
      <InstitutionAssistant alerts={alerts} nextActions={nextActions} />

      {/* 12. Executive filters (§55) */}
      <ExecutiveFilters />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Skills page — Demand vs Supply full table (§42)
// ──────────────────────────────────────────────────────────────────
function SkillsIntelligencePage() {
  const inst = useInstitution();
  const filters = useInstitutionStore((s) => s.filters);
  const setFilter = useInstitutionStore((s) => s.setFilter);
  const [whyRow, setWhyRow] = useState<DemandSupplyRow | null>(null);

  const rows = useMemo(() => {
    let r = inst.demandSupply;
    if (filters.skill) r = r.filter((x) => x.skillId === filters.skill);
    if (filters.role) r = r.filter((x) => x.targetRoles.some((rl) => rl.toLowerCase().includes(filters.role.toLowerCase())));
    if (filters.department) {
      const deptSkills = new Set(inst.branchMatrix.filter((c) => c.department === filters.department).map((c) => c.skillId));
      r = r.filter((x) => deptSkills.has(x.skillId));
    }
    return r;
  }, [inst.demandSupply, inst.branchMatrix, filters]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Demand vs Supply"
        subtitle="Per-skill demand (from opportunities) vs supply (from candidate competencies)."
        icon={BarChart3}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <FilterPills
        skillFilter={filters.skill}
        roleFilter={filters.role}
        deptFilter={filters.department}
        onSkill={(v) => setFilter("skill", v)}
        onRole={(v) => setFilter("role", v)}
        onDept={(v) => setFilter("department", v)}
      />

      {rows.length === 0 ? (
        <EmptyState icon={BarChart3} title="No demand/supply rows" hint="Publish opportunities in the Industry portal to populate demand." />
      ) : (
        <SsCard tone="soft" className="space-y-3 p-4">
          {rows.map((row) => {
            const verified = DEMO_CANDIDATES.flatMap((c) => c.evidence).filter((e) => e.skillId === row.skillId && e.status === "Verified").length;
            const confidence: "High" | "Moderate" | "Limited" = verified > 0 ? "High" : row.supplySources > 0 ? "Moderate" : "Limited";
            return (
              <div key={row.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{row.skillName}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{row.demandSources} opportunities · {row.supplySources} students · target roles: {row.targetRoles.slice(0, 3).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SsDemandBadge level={row.demand >= 80 ? "Critical" : row.demand >= 60 ? "High" : row.demand >= 40 ? "Medium" : "Low"} />
                    <SsPriorityPill priority={row.gap >= 40 ? "Critical" : row.gap >= 25 ? "High" : row.gap >= 10 ? "Medium" : "Low"} />
                    <SsBadge tone={confidence === "High" ? "teal" : confidence === "Moderate" ? "blue" : "orange"} className="text-[9px]">{confidence} evidence</SsBadge>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setWhyRow(row)}>Why?</Button>
                  </div>
                </div>
                <div className="mt-2">
                  <SsCoverageBar label={`${row.skillName} coverage`} demand={row.demand} supply={row.supply} required={70} />
                </div>
              </div>
            );
          })}
        </SsCard>
      )}

      <SsWhyModal
        open={!!whyRow}
        onClose={() => setWhyRow(null)}
        title={`Why is ${whyRow?.skillName} flagged?`}
        subtitle="Demand vs supply breakdown from platform data"
        factors={
          whyRow ? [
            { ok: whyRow.demand >= 60 ? "warn" : "pass", label: `Industry demand ${whyRow.demand}/100`, detail: `${whyRow.demandSources} active opportunities require this skill.` },
            { ok: whyRow.supply >= 70 ? "pass" : whyRow.supply >= 40 ? "warn" : "fail", label: `Student supply ${whyRow.supply}/100`, detail: `${whyRow.supplySources} candidate(s) with this skill, average competency ${whyRow.supply}.` },
            { ok: whyRow.gap >= 25 ? "fail" : whyRow.gap >= 10 ? "warn" : "pass", label: `Gap ${whyRow.gap} points`, detail: "Demand minus supply, normalised 0–100." },
            { ok: whyRow.targetRoles.length > 0 ? "pass" : "warn", label: `Relevant roles: ${whyRow.targetRoles.slice(0, 3).join(", ")}`, detail: "Roles whose weighted skill set includes this skill." },
          ] : []
        }
      >
        <SsDataSourceLabel source="platform" />
        <p className="mt-2 text-[11px] text-[var(--ss-muted)]">Based on current platform opportunities and candidate competency scores. Not an industry-wide claim.</p>
      </SsWhyModal>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Branches page — heatmap + drill-in (§44)
// ──────────────────────────────────────────────────────────────────
function BranchIntelligencePage() {
  const inst = useInstitution();
  const filters = useInstitutionStore((s) => s.filters);
  const setFilter = useInstitutionStore((s) => s.setFilter);

  const [cellDetail, setCellDetail] = useState<{ dept: string; skillId: string; skillName: string } | null>(null);

  const cells = useMemo(() => {
    let c = inst.branchMatrix;
    if (filters.department) c = c.filter((x) => x.department === filters.department);
    if (filters.skill) c = c.filter((x) => x.skillId === filters.skill);
    return c;
  }, [inst.branchMatrix, filters]);

  const depts = useMemo(() => [...new Set(cells.map((c) => c.department))], [cells]);
  const skillIds = useMemo(() => [...new Set(cells.map((c) => c.skillId))], [cells]);

  const heatmapCells = useMemo(() => {
    const map: Record<string, { value: number; label?: string }> = {};
    for (let y = 0; y < depts.length; y++) {
      for (let x = 0; x < skillIds.length; x++) {
        const cell = cells.find((c) => c.department === depts[y] && c.skillId === skillIds[x]);
        if (cell) map[`${y}|${x}`] = { value: cell.avgCompetency, label: String(cell.avgCompetency) };
      }
    }
    return map;
  }, [cells, depts, skillIds]);

  const detailRows = useMemo(() => {
    if (!cellDetail) return [];
    const cell = inst.branchMatrix.find((c) => c.department === cellDetail.dept && c.skillId === cellDetail.skillId);
    if (!cell) return [];
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published" && o.requiredSkills.some((rs) => rs.skillId === cell.skillId)).length;
    const supply = cell.avgCompetency;
    return [
      { label: "Department", value: cell.department },
      { label: "Skill", value: cell.skillName },
      { label: "Average competency", value: `${cell.avgCompetency}/100` },
      { label: "Affected students", value: String(cell.affectedStudents) },
      { label: "Industry demand", value: cell.industryDemand },
      { label: "Gap", value: cell.gap },
      { label: "Role relevance", value: cell.roleRelevance.join(", ") || "—" },
      { label: "Opportunities", value: String(opps) },
      { label: "Supply", value: `${supply}/100` },
    ];
  }, [cellDetail, inst.branchMatrix]);

  const suggestedAction = useMemo(() => {
    if (!cellDetail) return null;
    const cell = inst.branchMatrix.find((c) => c.department === cellDetail.dept && c.skillId === cellDetail.skillId);
    if (!cell) return null;
    const action = cell.gap === "Critical" ? "Industry Workshop" : cell.gap === "High" ? "Live Project" : cell.gap === "Medium" ? "Bootcamp" : "Certification";
    return action;
  }, [cellDetail, inst.branchMatrix]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Branch Intelligence"
        subtitle="Department × skill competency heatmap. Click a cell for drill-down and intervention suggestions."
        icon={GraduationCap}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <FilterPills
        skillFilter={filters.skill}
        roleFilter={filters.role}
        deptFilter={filters.department}
        onSkill={(v) => setFilter("skill", v)}
        onRole={(v) => setFilter("role", v)}
        onDept={(v) => setFilter("department", v)}
      />

      <SsCard tone="soft" className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--ss-ink)]">Department × Skill heatmap</p>
            <p className="text-[10px] text-[var(--ss-muted)]">Values are average competency (0–100). Thresholds: ≥75 strong · 60–74 moderate · 40–59 weak · &lt;40 critical.</p>
          </div>
          <SsDataSourceLabel source="platform" />
        </div>
        {cells.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No matrix data for selected filters" />
        ) : (
          <SsHeatmap
            rows={depts}
            cols={skillIds.map((id) => SKILL_NAMES[id] ?? id)}
            cells={heatmapCells}
            onCellClick={(y, x) => {
              const dept = depts[y];
              const skillId = skillIds[x];
              const skillName = SKILL_NAMES[skillId] ?? skillId;
              setCellDetail({ dept, skillId, skillName });
            }}
          />
        )}
      </SsCard>

      {/* Per-department intervention suggestions (§44) */}
      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-sm font-bold text-[var(--ss-ink)]">Per-cell intervention suggestions</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {depts.map((dept) => {
            const critical = cells.filter((c) => c.department === dept && (c.gap === "Critical" || c.gap === "High"));
            return (
              <div key={dept} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <p className="text-xs font-bold text-[var(--ss-ink)]">{dept}</p>
                {critical.length === 0 ? (
                  <p className="mt-1 text-[10px] text-[var(--ss-muted)]">No critical gaps in this department.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {critical.slice(0, 3).map((c) => {
                      const action = c.gap === "Critical" ? "Industry Workshop" : "Live Project";
                      return (
                        <li key={c.skillId} className="flex items-center gap-2 text-[11px]">
                          <SsPriorityPill priority={c.gap as Priority} />
                          <span className="text-[var(--ss-ink-soft)]">{c.skillName}</span>
                          <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />
                          <span className="font-semibold text-[var(--ss-blue-600)]">{action}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </SsCard>

      <SsMatrixCellDetail
        open={!!cellDetail}
        onClose={() => setCellDetail(null)}
        title={cellDetail ? `${cellDetail.dept} · ${cellDetail.skillName}` : ""}
        rows={detailRows.map((r) => ({ label: r.label, value: r.value }))}
        action={
          suggestedAction ? (
            <div className="rounded-lg border border-[var(--ss-blue-100)] bg-[var(--ss-blue-50)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-blue-600)]">Suggested intervention</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ss-ink)]">{suggestedAction}</p>
              <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Based on gap magnitude and affected students count. Not a guarantee of outcome.</p>
            </div>
          ) : null
        }
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Shared sub-components
// ──────────────────────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ss-muted)]">{eyebrow}</p>
        <h2 className="text-lg font-extrabold text-[var(--ss-ink)] sm:text-xl">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function GlanceTile({ label, value, sub, icon: Icon, tone, onClick }: { label: string; value: number | string; sub: string; icon: React.ComponentType<{ className?: string }>; tone: "navy" | "blue" | "teal" | "orange"; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-[var(--ss-border)] bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">{label}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            backgroundColor: tone === "navy" ? "var(--ss-surface-3)" : tone === "blue" ? "var(--ss-blue-50)" : tone === "teal" ? "var(--ss-teal-50)" : "var(--ss-orange-50)",
            color: tone === "navy" ? "var(--ss-navy-900)" : tone === "blue" ? "var(--ss-blue-600)" : tone === "teal" ? "var(--ss-teal-600)" : "var(--ss-orange-600)",
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--ss-ink)]">{value}</p>
      <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">{sub}</p>
    </button>
  );
}

function AlertRow({ alert }: { alert: ReturnType<typeof InstitutionAggregator.getAlerts>[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <SsCard tone="soft" className="p-3">
      <div className="flex flex-wrap items-start gap-2">
        <SsAlertPill tone={alert.tone} label={alert.category} />
        <p className="flex-1 text-sm font-semibold text-[var(--ss-ink)]">{alert.what}</p>
        <button onClick={() => setOpen(true)} className="text-[10px] font-bold uppercase text-[var(--ss-blue-600)] hover:underline">Why?</button>
      </div>
      <p className="mt-1 text-[11px] text-[var(--ss-muted)]">{alert.why}</p>
      <p className="mt-1 text-[10px] font-semibold text-[var(--ss-blue-600)]">Suggested action: {alert.suggestedAction}</p>
      <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">Affected items: {alert.affectedItems}</p>
      <SsWhyModal
        open={open}
        onClose={() => setOpen(false)}
        title={alert.category}
        subtitle={alert.what}
        factors={[
          { ok: alert.tone === "critical" ? "fail" : alert.tone === "warning" ? "warn" : "pass", label: "Triggered by platform rule", detail: alert.why },
          { ok: "warn", label: "Affected items", detail: `${alert.affectedItems} item(s)` },
          { ok: "pass", label: "Suggested action", detail: alert.suggestedAction },
        ]}
      >
        <SsDataSourceLabel source="platform" />
      </SsWhyModal>
    </SsCard>
  );
}

function BranchHeatmapSection({ matrix }: { matrix: BranchSkillCell[] }) {
  const [cellDetail, setCellDetail] = useState<{ dept: string; skillId: string; skillName: string } | null>(null);
  const depts = useMemo(() => [...new Set(matrix.map((c) => c.department))], [matrix]);
  const skillIds = useMemo(() => [...new Set(matrix.map((c) => c.skillId))], [matrix]);
  const cells = useMemo(() => {
    const map: Record<string, { value: number; label?: string }> = {};
    for (let y = 0; y < depts.length; y++) {
      for (let x = 0; x < skillIds.length; x++) {
        const cell = matrix.find((c) => c.department === depts[y] && c.skillId === skillIds[x]);
        if (cell) map[`${y}|${x}`] = { value: cell.avgCompetency, label: String(cell.avgCompetency) };
      }
    }
    return map;
  }, [matrix, depts, skillIds]);

  const detailRows = useMemo(() => {
    if (!cellDetail) return [];
    const cell = matrix.find((c) => c.department === cellDetail.dept && c.skillId === cellDetail.skillId);
    if (!cell) return [];
    return [
      { label: "Department", value: cell.department },
      { label: "Skill", value: cell.skillName },
      { label: "Average competency", value: `${cell.avgCompetency}/100` },
      { label: "Affected students", value: String(cell.affectedStudents) },
      { label: "Industry demand", value: cell.industryDemand },
      { label: "Gap", value: cell.gap },
      { label: "Role relevance", value: cell.roleRelevance.join(", ") || "—" },
    ];
  }, [cellDetail, matrix]);

  const suggested = useMemo(() => {
    if (!cellDetail) return null;
    const cell = matrix.find((c) => c.department === cellDetail.dept && c.skillId === cellDetail.skillId);
    if (!cell) return null;
    return cell.gap === "Critical" ? "Industry Workshop" : cell.gap === "High" ? "Live Project" : cell.gap === "Medium" ? "Bootcamp" : "Certification";
  }, [cellDetail, matrix]);

  return (
    <section>
      <SectionTitle
        eyebrow="§44 · Drill-down matrix"
        title="Branch × skill intelligence"
        right={<SsDataSourceLabel source="platform" />}
      />
      <SsCard tone="soft" className="p-4">
        {matrix.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No matrix data for selected filters" />
        ) : (
          <SsHeatmap
            rows={depts}
            cols={skillIds.map((id) => SKILL_NAMES[id] ?? id)}
            cells={cells}
            onCellClick={(y, x) => setCellDetail({ dept: depts[y], skillId: skillIds[x], skillName: SKILL_NAMES[skillIds[x]] ?? skillIds[x] })}
          />
        )}
      </SsCard>
      <SsMatrixCellDetail
        open={!!cellDetail}
        onClose={() => setCellDetail(null)}
        title={cellDetail ? `${cellDetail.dept} · ${cellDetail.skillName}` : ""}
        rows={detailRows}
        action={
          suggested ? (
            <div className="rounded-lg border border-[var(--ss-blue-100)] bg-[var(--ss-blue-50)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-blue-600)]">Suggested intervention</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ss-ink)]">{suggested}</p>
              <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Rule: gap magnitude × affected students. Not a causal claim.</p>
            </div>
          ) : null
        }
      />
    </section>
  );
}

function ExecutiveFilters() {
  const filters = useInstitutionStore((s) => s.filters);
  const setFilter = useInstitutionStore((s) => s.setFilter);
  return (
    <section>
      <SectionTitle eyebrow="§55 · Executive filters" title="Filter intelligence views" right={<SsDataSourceLabel source="platform" />} />
      <SsCard tone="soft" className="p-3">
        <div className="flex flex-wrap items-end gap-3 text-xs">
          <FilterSelect label="Academic year" value={filters.year} onChange={(v) => setFilter("year", v)} options={[{ value: "", label: "All years" }, { value: "3", label: "Year 3" }, { value: "4", label: "Year 4" }]} />
          <FilterSelect label="Department" value={filters.department} onChange={(v) => setFilter("department", v)} options={[{ value: "", label: "All departments" }, ...InstitutionService.getDepartments().map((d) => ({ value: d, label: d }))]} />
          <FilterSelect label="Role" value={filters.role} onChange={(v) => setFilter("role", v)} options={[{ value: "", label: "All roles" }, ...ALL_ROLES.map((r) => ({ value: r.roleName, label: r.roleName }))]} />
          <FilterSelect label="Skill" value={filters.skill} onChange={(v) => setFilter("skill", v)} options={[{ value: "", label: "All skills" }, ...Object.entries(SKILL_NAMES).map(([id, name]) => ({ value: id, label: name }))]} />
          <FilterSelect label="Date range" value={filters.dateRange} onChange={(v) => setFilter("dateRange", v)} options={[{ value: "all", label: "All time" }, { value: "30d", label: "Last 30 days" }, { value: "90d", label: "Last 90 days" }]} />
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => { setFilter("year", ""); setFilter("department", ""); setFilter("role", ""); setFilter("skill", ""); setFilter("dateRange", "all"); }}>
            <Filter className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Department + Role + Skill filters apply to the heatmap and demand/supply views above.</p>
      </SsCard>
    </section>
  );
}

function FilterPills({ skillFilter, roleFilter, deptFilter, onSkill, onRole, onDept }: {
  skillFilter: string;
  roleFilter: string;
  deptFilter: string;
  onSkill: (v: string) => void;
  onRole: (v: string) => void;
  onDept: (v: string) => void;
}) {
  return (
    <SsCard tone="soft" className="p-3">
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <FilterSelect label="Department" value={deptFilter} onChange={onDept} options={[{ value: "", label: "All departments" }, ...InstitutionService.getDepartments().map((d) => ({ value: d, label: d }))]} />
        <FilterSelect label="Skill" value={skillFilter} onChange={onSkill} options={[{ value: "", label: "All skills" }, ...Object.entries(SKILL_NAMES).map(([id, name]) => ({ value: id, label: name }))]} />
        <FilterSelect label="Role" value={roleFilter} onChange={onRole} options={[{ value: "", label: "All roles" }, ...ALL_ROLES.map((r) => ({ value: r.roleName, label: r.roleName }))]} />
      </div>
    </SsCard>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 w-full rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function InstitutionAssistant({ alerts, nextActions }: {
  alerts: ReturnType<typeof InstitutionAggregator.getAlerts>;
  nextActions: ReturnType<typeof InstitutionAggregator.getNextActions>;
}) {
  const inst = useInstitution();
  const [answered, setAnswered] = useState<Record<string, React.ReactNode>>({});

  const questions = [
    { id: "q1", label: "What are the biggest institutional skill gaps?" },
    { id: "q2", label: "Which departments need attention?" },
    { id: "q3", label: "What does industry demand?" },
    { id: "q4", label: "What intervention is suggested?" },
    { id: "q5", label: "What changed recently?" },
  ];

  const answer = (qid: string): React.ReactNode => {
    if (qid === "q1") {
      const gaps = inst.demandSupply.filter((r) => r.gap >= 25).slice(0, 5);
      if (gaps.length === 0) return <>No critical gaps in current data. Demand and supply are balanced.</>;
      return (
        <ul className="space-y-1">
          {gaps.map((g) => <li key={g.skillId}><b>{g.skillName}</b> — gap {g.gap} (demand {g.demand}, supply {g.supply})</li>)}
        </ul>
      );
    }
    if (qid === "q2") {
      const depts = inst.branchMatrix.filter((c) => c.gap === "Critical" || c.gap === "High").map((c) => c.department);
      const unique = [...new Set(depts)];
      if (unique.length === 0) return <>No department has critical or high gaps right now.</>;
      return <>{unique.join(", ")} — based on cells with Critical/High priority in the branch × skill matrix.</>;
    }
    if (qid === "q3") {
      const top = inst.demandSupply.slice(0, 5);
      return (
        <ul className="space-y-1">
          {top.map((r) => <li key={r.skillId}><b>{r.skillName}</b> — demand {r.demand}/100 across {r.demandSources} opportunities; target roles: {r.targetRoles.slice(0, 2).join(", ")}</li>)}
        </ul>
      );
    }
    if (qid === "q4") {
      if (nextActions.length === 0) return <>No interventions recommended at this time — supply matches demand.</>;
      return <>Next action: <b>{nextActions[0].title}</b> ({nextActions[0].priority} priority). {nextActions[0].reason}</>;
    }
    if (qid === "q5") {
      if (alerts.length === 0) return <>No new alerts in the current cycle.</>;
      return (
        <ul className="space-y-1">
          {alerts.slice(0, 3).map((a) => <li key={a.id}>{a.category}: {a.what}</li>)}
        </ul>
      );
    }
    return null;
  };

  return (
    <SsIntelligenceAssistant
      tone="navy"
      title="Institution Intelligence Assistant"
      questions={questions}
      onAsk={(qid) => setAnswered((prev) => ({ ...prev, [qid]: answer(qid) }))}
      answered={answered}
    />
  );
}

// ─── helper ───
function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
