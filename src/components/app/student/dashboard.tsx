"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, TrendingUp, Sparkles, ArrowRight, Briefcase, FileText, Trophy,
  ChevronRight, CheckCircle2, PlayCircle, AlertTriangle, Building2, MapPin, Clock, Award,
  FlaskConical, RotateCcw, Pencil,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  STUDENT, UPCOMING_HACKATHONS, APPLICATIONS,
} from "@/lib/student-data";
import {
  useIntelligence, useIntelligenceDerived, IntelligenceService,
  COMPETENCY_TARGET_THRESHOLD, getRoleConfig, ALL_ROLES,
} from "@/lib/intelligence";
import { useCareer, useCareerStore } from "@/lib/career";
import type { EvidenceRecord, SkillGap } from "@/lib/intelligence";
import {
  DashHeader, Modal, Drawer, RoleSelector, EvidenceDetailDrawer,
  DemoBadge, CalcBadge, MatchBadge, PriorityBadge, ConfidenceBadge, EvidenceStatusBadge,
  ApplicationTimeline, Field, SsStat,
} from "@/components/app/student-parts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { navigate } = useRouter();
  const derived = useIntelligenceDerived();
  const { student, role, readiness, gaps, nextAction, evidence, competencies } = derived;
  const { applied, apply, completeAction, joinTeam } = useStudentState();

  const [calcOpen, setCalcOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [gapDrawer, setGapDrawer] = useState<SkillGap | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [evDrawer, setEvDrawer] = useState<EvidenceRecord | null>(null);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashHeader
        title={`Good morning, ${student.studentId}`}
        subtitle={`${student.branch} · Target: ${role?.roleName ?? "—"}`}
        icon={Target}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Top stats — all derived from the engine */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Role Readiness" value={`${readiness.displayValue}%`} sub={readiness.status} icon={TrendingUp} tone="navy" />
        <SsStat label="Target Role" value={role?.roleName ?? "—"} sub="Configured" icon={Target} tone="blue" />
        <SsStat label="Top Gap" value={gaps[0]?.skill ?? "None"} sub={gaps[0] ? `${gaps[0].currentScore} / 100` : "no gaps"} icon={AlertTriangle} tone="orange" />
        <SsStat label="Evidence" value={evidence.length} sub={`${evidence.filter((e) => e.status === "Evaluated").length} evaluated`} icon={Award} tone="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT (main, 2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          {/* ROLE READINESS — calculated */}
          <ReadinessCard readiness={readiness} onViewCalc={() => setCalcOpen(true)} onWhatIf={() => setWhatIfOpen(true)} />

          {/* CRITICAL SKILL GAPS — calculated */}
          <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" />
                <h2 className="text-sm font-bold text-[var(--ss-ink)]">Critical Skill Gaps</h2>
                <DemoBadge />
              </div>
            </div>
            {gaps.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--ss-muted)]">No critical gaps above the configured threshold ({COMPETENCY_TARGET_THRESHOLD}).</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {gaps.slice(0, 3).map((g) => (
                  <GapMiniCard key={g.skillId} gap={g} onView={() => setGapDrawer(g)} />
                ))}
              </div>
            )}
          </section>

          {/* NEXT BEST ACTION — calculated */}
          {nextAction && (
            <NextBestActionCard action={nextAction} onView={() => setActionOpen(true)} onStart={() => { completeAction("nba-1"); setActionOpen(true); }} done={useStudentState.getState().completedActions.has("nba-1")} />
          )}

          {/* BEST OPPORTUNITY MATCH — from career matching engine (calculated) */}
          <BestMatchCard />

          {/* RECENT EVIDENCE — from store */}
          <RecentEvidence evidence={evidence} onOpen={(e) => setEvDrawer(e)} onViewAll={() => navigate("/app/passport/verified")} />
        </div>

        {/* RIGHT (1 col) */}
        <div className="space-y-4">
          {/* TARGET ROLE */}
          <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Target Role</h2>
              <DemoBadge />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]">
                <Target className="h-5 w-5" />
              </span>
              <p className="text-lg font-bold text-[var(--ss-ink)]">{role?.roleName}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setRoleOpen(true)}>
              Change Role
            </Button>
            <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Switching role recalculates readiness, gaps &amp; next action from the central intelligence state.</p>
          </section>

          {/* COMPETENCY EDITOR (what-if / live recalculation demo) */}
          <CompetencyEditor />

          {/* MY APPLICATIONS — Phase 2 demo */}
          <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">My Applications</h2>
              <DemoBadge />
            </div>
            <div className="space-y-3">
              {APPLICATIONS.map((a) => (
                <div key={a.id} className="rounded-lg border border-[var(--ss-border)] p-3">
                  <p className="text-sm font-semibold text-[var(--ss-ink)]">{a.title}</p>
                  <p className="text-[11px] text-[var(--ss-muted)]">{a.company} · {a.date}</p>
                  <div className="mt-2"><ApplicationTimeline timeline={a.timeline} current={a.status} /></div>
                </div>
              ))}
            </div>
          </section>

          {/* UPCOMING HACKATHONS — Phase 2 demo */}
          <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Upcoming Hackathons</h2>
              <DemoBadge />
            </div>
            <div className="space-y-2.5">
              {UPCOMING_HACKATHONS.map((h) => (
                <div key={h.id} className="rounded-lg border border-[var(--ss-border)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{h.name}</p>
                      <p className="text-[10px] text-[var(--ss-muted)]">{h.domain} · Team {h.teamSize} · {h.deadline}</p>
                    </div>
                    <MatchBadge score={h.match} />
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => navigate("/app/hackathons/discover")}>View</Button>
                    <Button variant="navy" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => joinTeam(h.id)}>Find Team</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ReadinessCalcDrawer open={calcOpen} onClose={() => setCalcOpen(false)} />
      <GapDetailDrawer gap={gapDrawer} open={!!gapDrawer} onClose={() => setGapDrawer(null)} />
      <NextBestActionModal open={actionOpen} onClose={() => setActionOpen(false)} onStart={() => completeAction("nba-1")} action={nextAction} />
      <WhatIfModal open={whatIfOpen} onClose={() => setWhatIfOpen(false)} />
      <RoleSelector open={roleOpen} onClose={() => setRoleOpen(false)} />
      <EvidenceDetailDrawer evidence={evDrawer ? toPhase2Evidence(evDrawer) : null} open={!!evDrawer} onClose={() => setEvDrawer(null)} />
    </div>
  );
}

// adapt intelligence EvidenceRecord → Phase 2 EvidenceRow shape expected by EvidenceDetailDrawer
function toPhase2Evidence(e: EvidenceRecord) {
  return {
    id: e.evidenceId,
    date: e.createdAt.slice(0, 10),
    time: e.createdAt.slice(11, 16),
    skill: e.skillName,
    source: e.sourceTitle,
    score: e.score,
    status: e.status,
    verification: e.verificationStatus,
    description: e.description,
    reference: e.reference,
  };
}

// ─── Role Readiness card (calculated) ──────────────────────────
function ReadinessCard({ readiness, onViewCalc, onWhatIf }: { readiness: ReturnType<typeof useIntelligenceDerived>["readiness"]; onViewCalc: () => void; onWhatIf: () => void }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-navy-gradient p-6 text-white shadow-soft">
      <div className="bg-dot-grid-dark absolute inset-0 opacity-30" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Role Readiness</h2>
            <CalcBadge>{readiness.status}</CalcBadge>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-extrabold leading-none text-gradient-light">{readiness.displayValue}%</span>
            <span className="pb-1 text-xs text-slate-300">Target Role: {readiness.roleName}</span>
          </div>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">Calculated from your current skill competencies weighted by the configured role requirements.</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" /> Raw: {readiness.value.toFixed(2)}% · Last calculated: {new Date(readiness.calculatedAt).toLocaleDateString()} <DemoBadge className="ml-1 border-white/20 bg-white/10 text-slate-200" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ReadinessRing value={readiness.displayValue} />
          <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={onViewCalc}>
            Why is my readiness {readiness.displayValue}%?
          </Button>
        </div>
      </div>
      <div className="relative mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={onWhatIf}>
          <FlaskConical className="mr-1 h-3.5 w-3.5" /> What-If Preview
        </Button>
      </div>
    </motion.section>
  );
}

function ReadinessRing({ value }: { value: number }) {
  const r = 44, circ = 2 * Math.PI * r, off = circ - (value / 100) * circ;
  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#5eead4" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
    </div>
  );
}

// ─── Readiness calculation drawer (live breakdown) ──────────────
function ReadinessCalcDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { readiness } = useIntelligenceDerived();
  return (
    <Drawer open={open} onClose={onClose} title="Readiness Explanation" subtitle={`${readiness.roleName} · ${readiness.value.toFixed(2)}%`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2"><CalcBadge>Calculated</CalcBadge><DemoBadge /></div>
        {readiness.status === "Error" ? (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{readiness.error}</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-[var(--ss-border)]">
              <table className="w-full text-xs">
                <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
                  <tr><th className="px-3 py-2 text-left font-semibold">Skill</th><th className="px-2 py-2 text-right font-semibold">Competency</th><th className="px-2 py-2 text-right font-semibold">Weight</th><th className="px-3 py-2 text-right font-semibold">Contribution</th></tr>
                </thead>
                <tbody>
                  {readiness.skillBreakdown.map((b) => (
                    <tr key={b.skillId} className="border-t border-[var(--ss-border)]">
                      <td className="px-3 py-2 font-medium text-[var(--ss-ink)]">{b.skill}</td>
                      <td className="px-2 py-2 text-right text-[var(--ss-ink-soft)]">{b.competency}</td>
                      <td className="px-2 py-2 text-right text-[var(--ss-muted)]">× {b.importancePercent}%</td>
                      <td className="px-3 py-2 text-right font-bold text-[var(--ss-blue-600)]">{b.contribution.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--ss-line)] bg-[var(--ss-surface-2)]"><td className="px-3 py-2.5 font-bold text-[var(--ss-ink)]" colSpan={3}>Total</td><td className="px-3 py-2.5 text-right font-extrabold text-[var(--ss-blue-600)]">{readiness.value.toFixed(2)}%</td></tr>
                  <tr className="bg-[var(--ss-surface-2)]"><td className="px-3 py-2 text-[10px] text-[var(--ss-muted)]" colSpan={3}>Displayed (rounded)</td><td className="px-3 py-2 text-right font-bold text-[var(--ss-ink)]">{readiness.displayValue}%</td></tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--ss-muted)]">{readiness.explanation}</p>
            <p className="text-[10px] text-[var(--ss-muted)]">Evidence considered: {readiness.evidenceIds.length} records.</p>
          </>
        )}
        <Button variant="navy" className="w-full" onClick={onClose}>Close</Button>
      </div>
    </Drawer>
  );
}

// ─── Gap card + detail drawer ───────────────────────────────────
function GapMiniCard({ gap, onView }: { gap: SkillGap; onView: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--ss-border)] p-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-[var(--ss-ink)]">{gap.skill}</p>
        <PriorityBadge priority={gap.priority} />
      </div>
      <p className="mt-1 text-2xl font-bold text-[var(--ss-orange-600)]">{gap.currentScore}<span className="text-xs text-[var(--ss-faint)]"> / {gap.targetScore}</span></p>
      <p className="text-[10px] text-[var(--ss-muted)]">Role importance: {gap.roleImportancePercent}%</p>
      <Button variant="outline" size="sm" className="mt-3 w-full text-[11px]" onClick={onView}>View Gap</Button>
    </div>
  );
}

function GapDetailDrawer({ gap, open, onClose }: { gap: SkillGap | null; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Why is this a gap?" subtitle={gap?.skill}>
      {gap && (
        <div className="space-y-3">
          <DemoBadge />
          <Field label="Skill" value={gap.skill} />
          <Field label="Current Competency" value={`${gap.currentScore} / 100`} />
          <Field label="Configured Target" value={`${gap.targetScore} / 100`} />
          <Field label="Gap" value={`${gap.gap} points`} />
          <Field label="Role Importance" value={`${gap.roleImportancePercent}%`} />
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Priority</p><div className="mt-1"><PriorityBadge priority={gap.priority} /></div></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence Confidence</p><div className="mt-1"><ConfidenceBadge level={gap.evidenceConfidence} /></div></div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Explanation</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ss-ink-soft)]">{gap.reason}</p>
          </div>
          <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]">Target {gap.targetScore} is a configured prototype threshold — not an external industry standard.</p>
        </div>
      )}
    </Drawer>
  );
}

// ─── Next Best Action ───────────────────────────────────────────
function NextBestActionCard({ action, onView, onStart, done }: { action: NonNullable<ReturnType<typeof useIntelligenceDerived>["nextAction"]>; onView: () => void; onStart: () => void; done: boolean }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-[var(--ss-blue-600)]/30 bg-gradient-to-br from-[var(--ss-blue-50)] to-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ss-blue-600)] text-white"><Sparkles className="h-4 w-4" /></span>
        <h2 className="text-sm font-bold text-[var(--ss-ink)]">Next Best Action</h2>
        <CalcBadge>Rule-based</CalcBadge>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-blue-600)]">Recommended</p>
      <p className="mt-0.5 text-lg font-bold text-[var(--ss-ink)]">{action.actionTitle}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--ss-muted)]">{action.reason}</p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={onView}>Why this action?</Button>
        <Button variant="navy" size="sm" className="gap-1.5" onClick={onStart}>
          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
          {done ? "Started" : "Start"}
        </Button>
      </div>
    </motion.section>
  );
}

function NextBestActionModal({ open, onClose, onStart, action }: { open: boolean; onClose: () => void; onStart: () => void; action: ReturnType<typeof useIntelligenceDerived>["nextAction"] }) {
  if (!action) return null;
  return (
    <Modal open={open} onClose={onClose} title="Why this action?" subtitle={action.actionTitle} size="md">
      <div className="space-y-3">
        <DemoBadge />
        <Field label="Action" value={action.actionTitle} />
        <Field label="Skill" value={action.skill} />
        <Field label="Priority" value={<PriorityBadge priority={action.priority} />} />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Why</p>
          <ul className="mt-1 space-y-1">{action.whyPoints.map((w) => (<li key={w} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}</li>))}</ul>
        </div>
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Projected Impact</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--ss-teal-600)]">{action.projectedImpact}</p>
          <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Projected qualitatively — we do not predict a specific score increase.</p>
        </div>
        <div className="flex gap-2 pt-1"><Button variant="outline" className="flex-1" onClick={onClose}>Close</Button><Button variant="navy" className="flex-1 gap-1.5" onClick={onStart}><PlayCircle className="h-4 w-4" />Start</Button></div>
      </div>
    </Modal>
  );
}

// ─── What-If preview (§35) ──────────────────────────────────────
function WhatIfModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { competencies, readiness, role } = useIntelligenceDerived();
  const { setCompetency } = useIntelligence();
  const roleSkills = role?.skills ?? [];
  const [skillId, setSkillId] = useState(roleSkills[0]?.skillId ?? "");
  const [score, setScore] = useState(competencies[skillId]?.competencyScore ?? 50);

  const currentComp = competencies[skillId]?.competencyScore ?? 0;
  const projection = IntelligenceService.projectWhatIf(skillId, score);

  return (
    <Modal open={open} onClose={onClose} title="What-If Preview" subtitle="Projected readiness — simulation only" size="md">
      <div className="space-y-3">
        <DemoBadge />
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">Skill</label>
          <select value={skillId} onChange={(e) => { setSkillId(e.target.value); setScore(competencies[e.target.value]?.competencyScore ?? 50); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            {roleSkills.map((s) => <option key={s.skillId} value={s.skillId}>{s.skillName}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">New competency: {score}</label>
          <input type="range" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full accent-[var(--ss-blue-600)]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[var(--ss-border)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Current Readiness</p>
            <p className="mt-1 text-2xl font-bold text-[var(--ss-ink)]">{readiness.displayValue}%</p>
            <p className="text-[10px] text-[var(--ss-muted)]">raw {readiness.value.toFixed(2)}%</p>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--ss-blue-600)]/40 bg-[var(--ss-blue-50)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-blue-600)]">Projected Readiness</p>
            {projection.ok ? (
              <>
                <p className="mt-1 text-2xl font-bold text-[var(--ss-blue-600)]">{projection.data.projectedDisplay}%</p>
                <p className="text-[10px] text-[var(--ss-muted)]">raw {projection.data.projectedReadiness.toFixed(2)}% · {currentComp}→{score}</p>
              </>
            ) : <p className="mt-1 text-sm text-rose-600">{projection.error}</p>}
          </div>
        </div>
        <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]">Projected / What-If — this is a simulation. It does not change your real competency or evidence.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="navy" className="flex-1 gap-1.5" onClick={() => { setCompetency(skillId, score); onClose(); }}><Pencil className="h-3.5 w-3.5" /> Apply for real</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Competency editor (live recalculation demo, §34) ────────────
function CompetencyEditor() {
  const { competencies, role, readiness } = useIntelligenceDerived();
  const { setCompetency, resetCompetenciesForRole } = useIntelligence();
  const roleSkills = role?.skills ?? [];
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Competency Editor</h2>
        <CalcBadge>Live recalculation</CalcBadge>
      </div>
      <p className="mb-3 text-[10px] text-[var(--ss-muted)]">Change a competency — readiness, gaps &amp; next action recalculate automatically across the whole portal.</p>
      <div className="space-y-3">
        {roleSkills.map((rs) => {
          const c = competencies[rs.skillId];
          const v = c?.competencyScore ?? 0;
          return (
            <div key={rs.skillId}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium text-[var(--ss-ink-soft)]">{rs.skillName} <span className="text-[var(--ss-faint)]">({Math.round(rs.weight * 100)}%)</span></span>
                <span className="font-bold text-[var(--ss-ink)]">{v}</span>
              </div>
              <input type="range" min={0} max={100} value={v} onChange={(e) => setCompetency(rs.skillId, Number(e.target.value))} className="w-full accent-[var(--ss-blue-600)]" />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[var(--ss-muted)]">Readiness: <b className="text-[var(--ss-ink)]">{readiness.displayValue}%</b></span>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={resetCompetenciesForRole}><RotateCcw className="h-3 w-3" /> Reset role profile</Button>
      </div>
    </section>
  );
}

// ─── Best Opportunity Match — from career matching engine (calculated) ──
function BestMatchCard() {
  const { bestMatch, applications } = useCareer();
  const { navigate } = useRouter();
  if (!bestMatch) {
    return (
      <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[var(--ss-teal-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">Best Opportunity Match</h2></div>
        <p className="mt-3 text-sm text-[var(--ss-muted)]">No matching opportunities yet. Explore Career &amp; Opportunities.</p>
      </section>
    );
  }
  const { opportunity: opp, match } = bestMatch;
  const applied = applications.some((a) => a.opportunityId === opp.id && a.status !== "WITHDRAWN");
  const handleApply = () => { useCareerStore.getState().apply(opp.id); };
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[var(--ss-teal-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">Best Opportunity Match</h2><CalcBadge>Calculated</CalcBadge></div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-[var(--ss-ink)]">{opp.title}</p>
          <p className="text-[11px] text-[var(--ss-muted)]"><Building2 className="mr-1 inline h-3 w-3" />{opp.company} · <MapPin className="inline h-3 w-3" /> {opp.location}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{opp.requiredSkills.slice(0, 4).map((s) => (<span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s.skillName}</span>))}</div>
        </div>
        <MatchBadge score={match.matchScore} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/app/career/recommended")}>View Details</Button>
        <Button variant="navy" size="sm" className="ml-auto gap-1.5" disabled={applied} onClick={handleApply}>{applied ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}{applied ? "Applied" : "Apply Now"}</Button>
      </div>
      {applied && <p className="mt-2 rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]"><CheckCircle2 className="mr-1 inline h-3 w-3" /> Successfully applied (prototype workflow — no external application created).</p>}
    </section>
  );
}

// ─── Recent Evidence ────────────────────────────────────────────
function RecentEvidence({ evidence, onOpen, onViewAll }: { evidence: EvidenceRecord[]; onOpen: (e: EvidenceRecord) => void; onViewAll: () => void }) {
  const sorted = [...evidence].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--ss-blue-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">Recent Evidence</h2><DemoBadge /></div>
        <button onClick={onViewAll} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View All Evidence →</button>
      </div>
      <div className="space-y-2">
        {sorted.slice(0, 4).map((e) => (
          <button key={e.evidenceId} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-lg border border-[var(--ss-border)] p-3 text-left transition-colors hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]"><FileText className="h-3.5 w-3.5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ss-ink)]">{e.sourceTitle} · {e.skillName}</p>
              <p className="text-[10px] text-[var(--ss-muted)]">{e.createdAt.slice(0, 10)} · {e.createdAt.slice(11, 16)}</p>
            </div>
            <div className="flex items-center gap-2">
              {e.score !== null && <span className="text-xs font-bold text-[var(--ss-ink)]">{e.score}</span>}
              <EvidenceStatusBadge status={e.status} />
              <ChevronRight className="h-4 w-4 text-[var(--ss-faint)]" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
