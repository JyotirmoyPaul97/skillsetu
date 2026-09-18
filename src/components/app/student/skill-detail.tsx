"use client";

import { useState } from "react";
import {
  ChevronLeft, Code, FileText, Target, AlertTriangle, Sparkles, Clock, Award, TrendingUp, Pencil,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import {
  useIntelligence, useIntelligenceDerived, IntelligenceService,
  calculateRoleReadiness, calculateSkillGaps, COMPETENCY_TARGET_THRESHOLD,
} from "@/lib/intelligence";
import type { EvidenceRecord } from "@/lib/intelligence";
import {
  DashHeader, Drawer, Modal, DemoBadge, CalcBadge, PriorityBadge, ConfidenceBadge,
  EvidenceStatusBadge, VerificationBadge, Field, EmptyState,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsSkillBar } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { EvidenceDetailDrawer } from "@/components/app/student-parts";

export function SkillDetailPage({ skillId }: { skillId: string }) {
  const { navigate } = useRouter();
  const derived = useIntelligenceDerived();
  const { student, role, competencies, evidence, readiness } = derived;
  const { setCompetency } = useIntelligence();
  const [evDrawer, setEvDrawer] = useState<EvidenceRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editScore, setEditScore] = useState(competencies[skillId]?.competencyScore ?? 0);

  const comp = competencies[skillId];
  const roleSkill = role?.skills.find((s) => s.skillId === skillId);
  const skillEv = evidence.filter((e) => e.skillId === skillId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const gap = calculateSkillGaps(student.studentId, role!.roleId, competencies, evidence).find((g) => g.skillId === skillId);
  const nextAction = derived.nextAction;

  if (!comp) {
    return (
      <div className="space-y-4">
        <DashHeader title="Skill not found" icon={Code} accent="#BE123C" action={<button onClick={() => navigate("/app/skills/technical")} className="text-sm font-semibold text-[var(--ss-blue-600)] hover:underline"><ChevronLeft className="mr-1 inline h-4 w-4" />Back to My Skills</button>} />
        <EmptyState icon={Code} title="Skill not found" hint="This skill isn't in your current competency profile." />
      </div>
    );
  }

  const contribution = roleSkill ? (comp.competencyScore * roleSkill.weight).toFixed(2) : "n/a";

  return (
    <div className="space-y-6">
      <DashHeader
        title={comp.skillName}
        subtitle={`${role?.roleName} · ${skillEv.length} evidence record(s)`}
        icon={Code}
        accent="#0D9488"
        action={
          <div className="flex items-center gap-2">
            <DemoBadge />
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => { setEditScore(comp.competencyScore); setEditOpen(true); }}><Pencil className="h-3.5 w-3.5" /> Edit competency</Button>
          </div>
        }
      />

      {/* Overview */}
      <SsCard tone="soft" className="p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Competency</p>
            <p className="mt-1 text-3xl font-bold text-[var(--ss-ink)]">{comp.competencyScore}<span className="text-sm text-[var(--ss-faint)]"> / 100</span></p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evidence Confidence</p>
            <p className="mt-1 text-lg font-bold text-[var(--ss-ink)]">{comp.evidenceConfidence}</p>
            <p className="text-[10px] text-[var(--ss-muted)]">{comp.evidenceConfidencePercent}%</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Role Importance</p>
            <p className="mt-1 text-lg font-bold text-[var(--ss-ink)]">{roleSkill ? `${Math.round(roleSkill.weight * 100)}%` : "not in role"}</p>
            <p className="text-[10px] text-[var(--ss-muted)]">Contribution: {contribution}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Last Updated</p><p className="mt-0.5 text-sm text-[var(--ss-ink)]">{comp.lastUpdated.slice(0, 10)}</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evidence Count</p><p className="mt-0.5 text-sm text-[var(--ss-ink)]">{comp.evidenceCount}</p></div>
        </div>
        {roleSkill && (
          <div className="mt-4"><SsSkillBar label={`${comp.skillName} vs target ${COMPETENCY_TARGET_THRESHOLD}`} level={comp.competencyScore} target={COMPETENCY_TARGET_THRESHOLD} accent="#0D9488" /></div>
        )}
      </SsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Why this score? */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Why this score?</h3><CalcBadge>Traceable</CalcBadge></div>
          <p className="text-xs leading-relaxed text-[var(--ss-ink-soft)]">
            The competency of <b>{comp.competencyScore}</b> for {comp.skillName} is derived from your assessment and evidence records. Evidence confidence is <b>{comp.evidenceConfidence}</b> ({comp.evidenceConfidencePercent}%) based on a transparent prototype policy — not scientifically validated.
          </p>
          {roleSkill && (
            <div className="mt-3 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs text-[var(--ss-ink-soft)]">
              <b>Role contribution:</b> {comp.competencyScore} × {Math.round(roleSkill.weight * 100)}% = <b className="text-[var(--ss-blue-600)]">{contribution}</b> towards your {role?.roleName} readiness.
            </div>
          )}
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate("/app/dashboard")}>View full readiness calculation</Button>
        </SsCard>

        {/* Skill Gap */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Skill Gap</h3></div>
          {gap ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm text-[var(--ss-ink-soft)]">Current</span><span className="text-sm font-bold text-[var(--ss-ink)]">{gap.currentScore}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-[var(--ss-ink-soft)]">Target</span><span className="text-sm font-bold text-[var(--ss-ink)]">{gap.targetScore}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-[var(--ss-ink-soft)]">Gap</span><span className="text-sm font-bold text-[var(--ss-orange-600)]">{gap.gap}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-[var(--ss-ink-soft)]">Priority</span><PriorityBadge priority={gap.priority} /></div>
              <p className="rounded-lg bg-[var(--ss-surface-2)] p-2 text-[11px] text-[var(--ss-muted)]">{gap.reason}</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--ss-teal-600)]">No gap — competency meets the configured target ({COMPETENCY_TARGET_THRESHOLD}).</p>
          )}
        </SsCard>
      </div>

      {/* Evidence */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Evidence</h3></div>
          <DemoBadge />
        </div>
        {skillEv.length === 0 ? (
          <EmptyState icon={FileText} title="No evidence yet" hint="Complete an assessment, project or experience to generate evidence for this skill." />
        ) : (
          <div className="space-y-2">
            {skillEv.map((e) => (
              <button key={e.evidenceId} onClick={() => setEvDrawer(e)} className="flex w-full items-center gap-3 rounded-lg border border-[var(--ss-border)] p-3 text-left hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]"><FileText className="h-3.5 w-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--ss-ink)]">{e.sourceTitle}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{e.createdAt.slice(0, 10)} · {e.createdAt.slice(11, 16)}{e.reference ? ` · ${e.reference}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">{e.score !== null && <span className="text-xs font-bold text-[var(--ss-ink)]">{e.score}</span>}<EvidenceStatusBadge status={e.status} /></div>
              </button>
            ))}
          </div>
        )}
      </SsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Role relevance */}
        <SsCard tone="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Role relevance</h3></div>
          {roleSkill ? (
            <div className="space-y-2">
              <Field label="Role" value={role?.roleName} />
              <Field label="Importance" value={`${Math.round(roleSkill.weight * 100)}%`} />
              <Field label="Weighted contribution" value={contribution} />
              <div className="mt-2"><SsSkillBar label="Importance in role" level={Math.round(roleSkill.weight * 100)} accent="#2563EB" showTarget={false} /></div>
            </div>
          ) : (
            <p className="text-sm text-[var(--ss-muted)]">{comp.skillName} is not in the current {role?.roleName} skill set — it doesn't affect your readiness for this role.</p>
          )}
        </SsCard>

        {/* Next Action */}
        {nextAction && nextAction.skillId === skillId && (
          <SsCard tone="soft" className="p-5">
            <div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ss-blue-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Next Action</h3></div>
            <p className="text-sm font-bold text-[var(--ss-ink)]">{nextAction.actionTitle}</p>
            <p className="mt-1 text-xs text-[var(--ss-muted)]">{nextAction.reason}</p>
            <div className="mt-2 flex flex-wrap gap-1">{nextAction.whyPoints.map((w) => <SsBadge key={w} tone="blue" className="text-[10px]">{w}</SsBadge>)}</div>
            <p className="mt-2 text-[11px] text-[var(--ss-muted)]">Projected impact: <b>{nextAction.projectedImpact}</b></p>
          </SsCard>
        )}
      </div>

      {/* Competency history (§37) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[var(--ss-teal-600)]" /><h3 className="text-sm font-bold text-[var(--ss-ink)]">Competency &amp; Evidence History</h3></div><DemoBadge /></div>
        <p className="mb-3 text-[10px] text-[var(--ss-muted)]">Evidence ≠ competency improvement — each entry is an evidence event, not a score change.</p>
        <div className="space-y-2">
          {skillEv.length === 0 ? (
            <p className="text-sm text-[var(--ss-muted)]">No history yet.</p>
          ) : skillEv.map((e) => (
            <div key={e.evidenceId} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5">
              <div>
                <p className="text-xs font-semibold text-[var(--ss-ink)]">{e.sourceTitle}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{e.createdAt.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-2">
                {e.score !== null ? <span className="text-xs font-bold text-[var(--ss-ink)]">Score: {e.score}</span> : <span className="text-[10px] text-[var(--ss-muted)]">no score</span>}
                <EvidenceStatusBadge status={e.status} />
              </div>
            </div>
          ))}
        </div>
      </SsCard>

      {/* Edit competency modal (live recalculation) */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit competency" subtitle={`${comp.skillName} — changes recalculate the whole portal`} size="sm">
        <div className="space-y-3">
          <DemoBadge />
          <div>
            <label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">New competency: {editScore}</label>
            <input type="range" min={0} max={100} value={editScore} onChange={(e) => setEditScore(Number(e.target.value))} className="w-full accent-[var(--ss-blue-600)]" />
          </div>
          <p className="text-[10px] text-[var(--ss-muted)]">This updates the central intelligence state — readiness, gaps & next action recalculate everywhere.</p>
          <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button><Button variant="navy" className="flex-1" onClick={() => { setCompetency(skillId, editScore); setEditOpen(false); }}>Apply</Button></div>
        </div>
      </Modal>

      <EvidenceDetailDrawer evidence={evDrawer ? { id: evDrawer.evidenceId, date: evDrawer.createdAt.slice(0, 10), time: evDrawer.createdAt.slice(11, 16), skill: evDrawer.skillName, source: evDrawer.sourceTitle, score: evDrawer.score, status: evDrawer.status, verification: evDrawer.verificationStatus, description: evDrawer.description, reference: evDrawer.reference } : null} open={!!evDrawer} onClose={() => setEvDrawer(null)} />
    </div>
  );
}
