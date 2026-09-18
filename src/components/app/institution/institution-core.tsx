"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, GraduationCap, TrendingUp, AlertTriangle, Sparkles,
  ArrowRight, CheckCircle2, Info, ChevronRight, Layers,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useInstitution, InstitutionService, useInstitutionStore, DEMO_USER } from "@/lib/institution";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DemandSupplyRow, BranchSkillCell, CohortIntervention, InterventionType, Priority } from "@/lib/institution/institution-model";

export function InstitutionCore({ section }: { section: string }) {
  if (section === "dashboard") return <InstitutionDashboard />;
  if (section === "skills") return <SkillIntelligence />;
  if (section === "branches") return <BranchAnalytics />;
  return <InstitutionDashboard />;
}

// ─── Dashboard (§3, §4, §71, §72) ────────────────────────────
function InstitutionDashboard() {
  const { navigate } = useRouter();
  const inst = useInstitution();
  const exec = inst.execSummary;
  const alerts = inst.alerts.filter((a) => !a.read).slice(0, 3);
  return (
    <div className="space-y-6">
      <DashHeader title={`Good morning, ${DEMO_USER.name.split(" ").slice(-1)[0]}`} subtitle={`IIT Madras · ${DEMO_USER.role}`} icon={LayoutDashboard} accent="#6D28D9" action={<DemoBadge />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <SsStat label="Critical Gaps" value={inst.cohortInterventions.filter((i) => i.gap === "Critical").length} icon={AlertTriangle} tone="orange" />
        <SsStat label="Demand Signals" value={inst.demandSupply.length} icon={TrendingUp} tone="blue" />
        <SsStat label="Active Interventions" value={inst.interventions.filter((i) => i.status === "Active" || i.status === "Scheduled").length} icon={Sparkles} tone="navy" />
        <SsStat label="Collaborations" value={inst.collabInsights.total} icon={Layers} tone="teal" />
      </div>
      {/* Intelligence flow (§72) */}
      <SsCard tone="soft" className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-[var(--ss-ink)]">Institution Intelligence:</span>
          {["Student Evidence", "Skill Intelligence", "Demand vs Supply", "Branch Gap", "Priority", "Intervention", "New Evidence"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2"><span className="text-[var(--ss-navy-800)]">{s}</span>{i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}</span>
          ))}
        </div>
      </SsCard>
      {/* Executive summary (§4) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-teal-600)]">Strong</h3>{exec.strong.map((s) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">✓ {s}</p>)}</SsCard>
        <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-orange-600)]">Needs Attention</h3>{exec.needsAttention.map((s) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">• {s}</p>)}</SsCard>
        <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-blue-600)]">Emerging</h3>{exec.emerging.map((s) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">→ {s}</p>)}</SsCard>
        <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-navy-800)]">Recommended Next Actions</h3>{exec.suggestedActions.map((s, i) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">{i + 1}. {s}</p>)}</SsCard>
      </div>
      {/* Alerts (§49) */}
      {alerts.length > 0 && (
        <SsCard tone="soft" className="p-5"><div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">Intelligence Alerts</h2><DemoBadge /></div>
          <div className="space-y-2">{alerts.map((a) => (
            <div key={a.id} className={cn("rounded-lg border p-3", a.priority === "Critical" ? "border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)]" : "border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)]")}>
              <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ss-ink)]">{a.title}</p><SsBadge tone={a.priority === "Critical" ? "orange" : "blue"} className="text-[9px]">{a.priority}</SsBadge></div>
              <p className="text-[11px] text-[var(--ss-muted)]">{a.detail}</p>
            </div>
          ))}</div>
        </SsCard>
      )}
    </div>
  );
}

// ─── Skill Intelligence (§5, §7, §8, §9, §10) ──────────────────
function SkillIntelligence() {
  const inst = useInstitution();
  const [whyRow, setWhyRow] = useState<DemandSupplyRow | null>(null);
  const [whyCell, setWhyCell] = useState<BranchSkillCell | null>(null);
  const depts = [...new Set(inst.branchMatrix.map((c) => c.department))];
  const skills = [...new Set(inst.branchMatrix.map((c) => c.skillId))];

  return (
    <div className="space-y-6">
      <DashHeader title="Skill Intelligence" subtitle="Demand vs supply, gaps, branch×skill matrix — all derived from shared data" icon={BarChart3} accent="#6D28D9" action={<DemoBadge />} />
      {/* Demand vs Supply (§10) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Demand vs Supply</h2><DemoBadge /></div>
        <div className="space-y-3">{inst.demandSupply.map((row) => <DemandSupplyRowCard key={row.skillId} row={row} onWhy={() => setWhyRow(row)} />)}</div>
      </SsCard>
      {/* Branch × Skill matrix (§7, §8) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Branch × Skill Matrix</h2><DemoBadge /></div>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]"><tr><th className="py-2 pr-3 text-left font-semibold">Branch</th>{skills.map((sid) => <th key={sid} className="py-2 px-1 text-center font-semibold">{SKILL_NAMES_SHORT(sid)}</th>)}</tr></thead><tbody>
          {depts.map((dept) => (
            <tr key={dept} className="border-t border-[var(--ss-border)]">
              <td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{dept}</td>
              {skills.map((sid) => {
                const cell = inst.branchMatrix.find((c) => c.department === dept && c.skillId === sid);
                if (!cell) return <td key={sid} className="py-2 px-1 text-center text-[var(--ss-faint)]">—</td>;
                const color = cell.avgCompetency >= 70 ? "#0D9488" : cell.avgCompetency >= 50 ? "#2563EB" : cell.avgCompetency >= 30 ? "#EA580C" : "#BE123C";
                return <td key={sid} className="cursor-pointer py-2 px-1 text-center" onClick={() => setWhyCell(cell)}><span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: color + "20", color }}>{cell.avgCompetency}</span></td>;
              })}
            </tr>
          ))}
        </tbody></table></div>
      </SsCard>
      {/* Role readiness aggregation (§17) */}
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Role Readiness Aggregation</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{inst.roleReadiness.map((r) => (
          <div key={r.roleId} className="rounded-lg border border-[var(--ss-border)] p-3"><p className="text-sm font-bold text-[var(--ss-ink)]">{r.roleName}</p><p className="text-lg font-bold" style={{ color: r.avgReadiness >= 70 ? "#0D9488" : r.avgReadiness >= 50 ? "#2563EB" : "#EA580C" }}>{r.avgReadiness}%</p><p className="text-[10px] text-[var(--ss-muted)]">{r.studentCount} students · Evidence: {r.evidenceConfidence}</p><div className="mt-1.5 space-y-0.5">{r.topGaps.map((g) => <p key={g.skillName} className="text-[10px] text-[var(--ss-orange-600)]">{g.skillName}: {g.avgCompetency}</p>)}</div></div>
        ))}</div>
      </SsCard>
      <Modal open={!!whyRow} onClose={() => setWhyRow(null)} title={`Why is ${whyRow?.skillName} demand high?`} size="sm">
        {whyRow && <div className="space-y-2"><DemoBadge /><p className="text-sm text-[var(--ss-ink-soft)]">{whyRow.demandSources} active opportunities require {whyRow.skillName}. Demand score: {whyRow.demand}/100.</p><p className="text-[11px] text-[var(--ss-muted)]">Based on current platform opportunities. Not an industry-wide claim.</p></div>}
      </Modal>
      <Modal open={!!whyCell} onClose={() => setWhyCell(null)} title={`${whyCell?.department} — ${whyCell?.skillName}`} size="sm">
        {whyCell && <div className="space-y-2"><DemoBadge /><Field label="Avg Competency" value={`${whyCell.avgCompetency}/100`} /><Field label="Affected Students" value={String(whyCell.affectedStudents)} /><Field label="Industry Demand" value={whyCell.industryDemand} /><Field label="Gap Priority" value={whyCell.gap} /><Field label="Role Relevance" value={whyCell.roleRelevance.join(", ")} /></div>}
      </Modal>
    </div>
  );
}

function DemandSupplyRowCard({ row, onWhy }: { row: DemandSupplyRow; onWhy: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-3">
      <div><p className="text-sm font-semibold text-[var(--ss-ink)]">{row.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">Demand {row.demand} · Supply {row.supply} · Gap {row.gap} · {row.demandSources} opps · {row.supplySources} students</p></div>
      <div className="flex items-center gap-2"><SsBadge tone={row.gap >= 40 ? "orange" : row.gap >= 20 ? "blue" : "teal"} className="text-[10px]">gap {row.gap}</SsBadge><button onClick={onWhy} className="text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Why?</button></div>
    </div>
  );
}

function SKILL_NAMES_SHORT(sid: string) { return (sid ?? "").slice(0, 4); }

// ─── Branch Analytics (§16, §55, §56) ──────────────────────────
function BranchAnalytics() {
  const inst = useInstitution();
  const depts = [...new Set(inst.branchMatrix.map((c) => c.department))];
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Branch Analytics" subtitle="Department intelligence — readiness, gaps, practical exposure" icon={GraduationCap} accent="#6D28D9" action={<DemoBadge />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{depts.map((dept) => {
        const cells = inst.branchMatrix.filter((c) => c.department === dept);
        const avg = cells.length ? Math.round(cells.reduce((s, c) => s + c.avgCompetency, 0) / cells.length) : 0;
        const gaps = cells.filter((c) => c.gap === "Critical" || c.gap === "High").length;
        return <SsCard key={dept} tone="lift" className="p-4"><p className="text-sm font-bold text-[var(--ss-ink)]">{dept}</p><p className="mt-1 text-2xl font-bold" style={{ color: avg >= 70 ? "#0D9488" : avg >= 50 ? "#2563EB" : "#EA580C" }}>{avg}%</p><p className="text-[10px] text-[var(--ss-muted)]">Avg competency · {gaps} critical gaps</p><Button variant="outline" size="sm" className="mt-3 h-7 w-full text-[11px]" onClick={() => setSelectedDept(dept)}>View Detail</Button></SsCard>;
      })}</div>
      <Drawer open={!!selectedDept} onClose={() => setSelectedDept(null)} title={`${selectedDept} — Department Intelligence`}>
        {selectedDept && (() => {
          const cells = inst.branchMatrix.filter((c) => c.department === selectedDept);
          const interventions = inst.cohortInterventions.filter((i) => cells.some((c) => c.skillId === i.skillId));
          return <div className="space-y-4"><DemoBadge /><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Skills</p><div className="mt-1 space-y-1">{cells.map((c) => <div key={c.skillId} className="flex justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{c.skillName}</span><span className="font-bold text-[var(--ss-ink)]">{c.avgCompetency} <SsBadge tone={c.gap === "Critical" ? "orange" : "teal"} className="ml-1 text-[9px]">{c.gap}</SsBadge></span></div>)}</div></div>{interventions.length > 0 && <div className="rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-3"><p className="text-[10px] font-semibold uppercase text-[var(--ss-blue-600)]">What should this department do next?</p><div className="mt-1 space-y-1">{interventions.map((i) => <p key={i.skillId} className="text-xs text-[var(--ss-ink-soft)]">→ {i.suggestedAction} for {i.skillName}</p>)}</div></div>}</div>;
        })()}
      </Drawer>
    </div>
  );
}
