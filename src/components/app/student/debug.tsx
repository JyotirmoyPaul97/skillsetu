"use client";

import {
  Bug, Database, RefreshCw, Trash2, CheckCircle2, AlertTriangle, FileText,
} from "lucide-react";
import {
  useIntelligence, useIntelligenceDerived, ALL_ROLES, validateRoleWeights,
  COMPETENCY_TARGET_THRESHOLD,
} from "@/lib/intelligence";
import { DashHeader, DemoBadge, CalcBadge, Field } from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";

export function DebugPage() {
  const { navigate } = useRouter();
  const d = useIntelligenceDerived();
  const { resetAll, setCompetency, evidence, assessmentResults, readinessHistory } = useIntelligence();
  const { student, role, competencies, readiness, gaps, nextAction } = d;

  const weightCheck = role ? validateRoleWeights(role.roleId) : null;

  return (
    <div className="space-y-6">
      <DashHeader
        title="Intelligence Diagnostics"
        subtitle="Developer-only debug view — single source of truth inspection"
        icon={Bug}
        accent="#6D28D9"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => { setCompetency("machine-learning", 60); }}><RefreshCw className="h-3.5 w-3.5" /> Test: ML 43→60</Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[var(--ss-orange-600)]" onClick={resetAll}><Trash2 className="h-3.5 w-3.5" /> Reset all</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Current state */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Central state</h3><DemoBadge /></div>
          <div className="space-y-2">
            <Field label="Student" value={`${student.name} (${student.studentId})`} />
            <Field label="Branch" value={student.branch} />
            <Field label="Current role" value={role?.roleName ?? "—"} />
            <Field label="Competencies stored" value={`${Object.keys(competencies).length} skills`} />
            <Field label="Evidence records" value={evidence.length} />
            <Field label="Assessment results" value={assessmentResults.length} />
            <Field label="Readiness history" value={readinessHistory.length} />
          </div>
        </SsCard>

        {/* Readiness */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--ss-teal-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Readiness (calculated)</h3><CalcBadge>{readiness.status}</CalcBadge></div>
          {readiness.status === "Error" ? (
            <p className="text-sm text-rose-600">{readiness.error}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2"><span className="text-3xl font-bold text-[var(--ss-ink)]">{readiness.displayValue}%</span><span className="text-xs text-[var(--ss-muted)]">raw {readiness.value.toFixed(2)}%</span></div>
              <Field label="Calculated at" value={new Date(readiness.calculatedAt).toLocaleString()} />
              <Field label="Breakdown rows" value={readiness.skillBreakdown.length} />
              <Field label="Evidence considered" value={`${readiness.evidenceIds.length} records`} />
              {weightCheck && (
                <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-2 text-xs">
                  <span className="font-semibold text-[var(--ss-ink-soft)]">Weight validation: </span>
                  {weightCheck.ok ? <span className="text-[var(--ss-teal-600)]">✓ sums to 100%</span> : <span className="text-rose-600">✗ {(weightCheck.sum * 100).toFixed(2)}%</span>}
                </div>
              )}
            </div>
          )}
        </SsCard>
      </div>

      {/* Skills + weights */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[var(--ss-ink)]">Role skills, weights &amp; competencies</h3><DemoBadge /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
              <tr><th className="py-2 pr-3 text-left font-semibold">Skill</th><th className="py-2 pr-3 text-right font-semibold">Weight</th><th className="py-2 pr-3 text-right font-semibold">Competency</th><th className="py-2 pr-3 text-right font-semibold">Contribution</th><th className="py-2 pr-3 text-left font-semibold">Confidence</th><th className="py-2 text-left font-semibold">Gap</th></tr>
            </thead>
            <tbody>
              {(role?.skills ?? []).map((rs) => {
                const c = competencies[rs.skillId];
                const cont = (c?.competencyScore ?? 0) * rs.weight;
                const gap = gaps.find((g) => g.skillId === rs.skillId);
                return (
                  <tr key={rs.skillId} className="border-t border-[var(--ss-border)]">
                    <td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{rs.skillName}</td>
                    <td className="py-2 pr-3 text-right text-[var(--ss-muted)]">{Math.round(rs.weight * 100)}%</td>
                    <td className="py-2 pr-3 text-right text-[var(--ss-ink-soft)]">{c?.competencyScore ?? 0}</td>
                    <td className="py-2 pr-3 text-right font-bold text-[var(--ss-blue-600)]">{cont.toFixed(2)}</td>
                    <td className="py-2 pr-3 text-left text-[var(--ss-muted)]">{c?.evidenceConfidence ?? "None"}</td>
                    <td className="py-2 text-left">{gap ? <span className="text-[var(--ss-orange-600)]">{gap.gap}</span> : <span className="text-[var(--ss-teal-600)]">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gaps */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Skill gaps</h3></div>
          {gaps.length === 0 ? <p className="text-sm text-[var(--ss-teal-600)]">No gaps above threshold {COMPETENCY_TARGET_THRESHOLD}.</p> : (
            <div className="space-y-2">{gaps.map((g) => (
              <div key={g.skillId} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5">
                <div><p className="text-xs font-semibold text-[var(--ss-ink)]">{g.skill}</p><p className="text-[10px] text-[var(--ss-muted)]">current {g.currentScore} · target {g.targetScore}</p></div>
                <div className="flex items-center gap-2"><SsBadge tone="orange" className="text-[10px]">gap {g.gap}</SsBadge><SsBadge tone={g.priority === "High" ? "orange" : "blue"} className="text-[10px]">{g.priority}</SsBadge></div>
              </div>
            ))}</div>
          )}
        </SsCard>

        {/* Next action */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Next best action</h3></div>
          {nextAction ? (
            <div className="space-y-2">
              <Field label="Action" value={nextAction.actionTitle} />
              <Field label="Skill" value={nextAction.skill} />
              <Field label="Priority" value={nextAction.priority} />
              <Field label="Projected impact" value={nextAction.projectedImpact} />
              <p className="text-[11px] text-[var(--ss-muted)]">{nextAction.reason}</p>
            </div>
          ) : <p className="text-sm text-[var(--ss-muted)]">No action.</p>}
        </SsCard>
      </div>

      {/* All roles validation */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">All role weight validations</h3></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_ROLES.map((r) => {
            const v = validateRoleWeights(r.roleId);
            return (
              <button key={r.roleId} onClick={() => navigate(`/app/debug`)} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2 text-left hover:bg-[var(--ss-surface-2)]">
                <span className="text-xs font-medium text-[var(--ss-ink-soft)]">{r.roleName}</span>
                {v.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--ss-teal-600)]" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
              </button>
            );
          })}
        </div>
      </SsCard>

      <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] text-[var(--ss-muted)]">
        Prototype persistence: state is stored in localStorage (key <code className="font-mono">skillsetu-intelligence-v1</code>). Refreshing the page preserves competency/evidence changes. This is not production persistence.
      </p>
    </div>
  );
}
