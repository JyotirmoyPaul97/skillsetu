"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, TrendingUp, Sparkles, ArrowRight, Briefcase, FileText, Trophy, Bell,
  ChevronRight, CheckCircle2, PlayCircle, AlertTriangle, Building2, MapPin, Clock, Award, Bot,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  STUDENT, READINESS, GAPS, NEXT_BEST_ACTION, BEST_MATCH, EVIDENCE, UPCOMING_HACKATHONS, APPLICATIONS,
  type EvidenceRow, type GapRow,
} from "@/lib/student-data";
import {
  DashHeader, Modal, Drawer, RoleSelector, EvidenceDetailDrawer,
  DemoBadge, CalcBadge, MatchBadge, PriorityBadge, ConfidenceBadge, EvidenceStatusBadge, VerificationBadge,
  ApplicationTimeline, Field, SsStat,
} from "@/components/app/student-parts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { navigate } = useRouter();
  const { applied, apply, completeAction, joinTeam } = useStudentState();
  const [calcOpen, setCalcOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [gapDrawer, setGapDrawer] = useState<GapRow | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [evDrawer, setEvDrawer] = useState<EvidenceRow | null>(null);
  const [appliedBest, setAppliedBest] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashHeader
        title={`${STUDENT.greeting}, ${STUDENT.id}`}
        subtitle={`${STUDENT.branch} · Target: ${useStudentState.getState().currentRole}`}
        icon={Target}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Role Readiness" value={`${READINESS.displayed}%`} sub={READINESS.status} icon={TrendingUp} tone="navy" />
        <SsStat label="Target Role" value="Data Scientist" sub="Configured" icon={Target} tone="blue" />
        <SsStat label="Top Gap" value="Machine Learning" sub="43 / 100" icon={AlertTriangle} tone="orange" />
        <SsStat label="Evidence" value={EVIDENCE.length} sub="items" icon={Award} tone="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT (main, 2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          {/* ROLE READINESS — main card */}
          <ReadinessCard onViewCalc={() => setCalcOpen(true)} />

          {/* CRITICAL SKILL GAPS */}
          <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" />
                <h2 className="text-sm font-bold text-[var(--ss-ink)]">Critical Skill Gaps</h2>
                <DemoBadge />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {GAPS.map((g) => (
                <GapMiniCard key={g.skill} gap={g} onView={() => setGapDrawer(g)} />
              ))}
            </div>
          </section>

          {/* NEXT BEST ACTION */}
          <NextBestActionCard onView={() => setActionOpen(true)} onStart={() => { completeAction("nba-1"); setActionOpen(true); }} />

          {/* BEST OPPORTUNITY MATCH */}
          <BestMatchCard
            applied={appliedBest}
            onApply={() => { apply(BEST_MATCH.id); setAppliedBest(true); }}
            onWhy={() => setWhyOpen(true)}
          />

          {/* RECENT EVIDENCE */}
          <RecentEvidence onOpen={(e) => setEvDrawer(e)} onViewAll={() => navigate("/app/passport/verified")} />
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
              <p className="text-lg font-bold text-[var(--ss-ink)]">{useStudentState.getState().currentRole}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setRoleOpen(true)}>
              Change Role
            </Button>
          </section>

          {/* MY APPLICATIONS */}
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
                  <div className="mt-2">
                    <ApplicationTimeline timeline={a.timeline} current={a.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* UPCOMING HACKATHONS */}
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
                    <Button variant="navy" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => { joinTeam(h.id); }}>Find Team</Button>
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
      <NextBestActionModal open={actionOpen} onClose={() => setActionOpen(false)} onStart={() => completeAction("nba-1")} done={useStudentState.getState().completedActions.has("nba-1")} />
      <WhyMatchModal open={whyOpen} onClose={() => setWhyOpen(false)} />
      <RoleSelector open={roleOpen} onClose={() => setRoleOpen(false)} />
      <EvidenceDetailDrawer evidence={evDrawer} open={!!evDrawer} onClose={() => setEvDrawer(null)} />
    </div>
  );
}

// ─── Role Readiness card (61%) ──────────────────────────────────
function ReadinessCard({ onViewCalc }: { onViewCalc: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-navy-gradient p-6 text-white shadow-soft"
    >
      <div className="bg-dot-grid-dark absolute inset-0 opacity-30" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Role Readiness</h2>
            <CalcBadge><span className="text-[var(--ss-blue-100)]">{READINESS.status}</span></CalcBadge>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-extrabold leading-none text-gradient-light">{READINESS.displayed}%</span>
            <span className="pb-1 text-xs text-slate-300">Target Role: {READINESS.targetRole}</span>
          </div>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">{READINESS.note}</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" /> Last calculated: {READINESS.lastCalculated} <DemoBadge className="ml-1 border-white/20 bg-white/10 text-slate-200" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ReadinessRing value={READINESS.displayed} />
          <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={onViewCalc}>
            View Calculation
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

function ReadinessRing({ value }: { value: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const off = circ - (value / 100) * circ;
  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#5eead4" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
    </div>
  );
}

// ─── Readiness calculation drawer ────────────────────────────────
function ReadinessCalcDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Role Readiness Calculation" subtitle={`Target: ${READINESS.targetRole} · ${READINESS.lastCalculated}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalcBadge>Calculated</CalcBadge>
          <DemoBadge />
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--ss-border)]">
          <table className="w-full text-xs">
            <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Skill</th>
                <th className="px-2 py-2 text-right font-semibold">Competency</th>
                <th className="px-2 py-2 text-right font-semibold">Weight</th>
                <th className="px-3 py-2 text-right font-semibold">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {READINESS.breakdown.map((b) => (
                <tr key={b.skill} className="border-t border-[var(--ss-border)]">
                  <td className="px-3 py-2 font-medium text-[var(--ss-ink)]">{b.skill}</td>
                  <td className="px-2 py-2 text-right text-[var(--ss-ink-soft)]">{b.competency}</td>
                  <td className="px-2 py-2 text-right text-[var(--ss-muted)]">× {b.weight}%</td>
                  <td className="px-3 py-2 text-right font-bold text-[var(--ss-blue-600)]">{b.contribution.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--ss-line)] bg-[var(--ss-surface-2)]">
                <td className="px-3 py-2.5 font-bold text-[var(--ss-ink)]" colSpan={3}>Total</td>
                <td className="px-3 py-2.5 text-right font-extrabold text-[var(--ss-blue-600)]">{READINESS.total.toFixed(2)}%</td>
              </tr>
              <tr className="bg-[var(--ss-surface-2)]">
                <td className="px-3 py-2 text-[10px] text-[var(--ss-muted)]" colSpan={3}>Displayed (rounded)</td>
                <td className="px-3 py-2 text-right font-bold text-[var(--ss-ink)]">{READINESS.displayed}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--ss-muted)]">
          Structured to later consume a real readiness calculation service. Currently fed by controlled demo data for S042.
        </p>
        <Button variant="navy" className="w-full" onClick={onClose}>Close</Button>
      </div>
    </Drawer>
  );
}

// ─── Gap mini card + detail drawer ──────────────────────────────
function GapMiniCard({ gap, onView }: { gap: GapRow; onView: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--ss-border)] p-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-[var(--ss-ink)]">{gap.skill}</p>
        <PriorityBadge priority={gap.priority} />
      </div>
      <p className="mt-1 text-2xl font-bold text-[var(--ss-orange-600)]">{gap.current}<span className="text-xs text-[var(--ss-faint)]"> / {gap.target}</span></p>
      <p className="text-[10px] text-[var(--ss-muted)]">Role importance: {gap.roleImportance}%</p>
      <Button variant="outline" size="sm" className="mt-3 w-full text-[11px]" onClick={onView}>View Gap</Button>
    </div>
  );
}

function GapDetailDrawer({ gap, open, onClose }: { gap: GapRow | null; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Skill Gap Details" subtitle={gap?.skill}>
      {gap && (
        <div className="space-y-3">
          <DemoBadge />
          <Field label="Skill" value={gap.skill} />
          <Field label="Current Competency" value={`${gap.current} / 100`} />
          <Field label="Target" value={`${gap.target} / 100`} />
          <Field label="Role" value={READINESS.targetRole} />
          <Field label="Role Importance" value={`${gap.roleImportance}%`} />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence Confidence</p>
            <div className="mt-1"><ConfidenceBadge level={gap.confidence} /></div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Priority</p>
            <div className="mt-1"><PriorityBadge priority={gap.priority} /></div>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Why is this a gap?</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ss-ink-soft)]">{gap.why}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Suggested next actions</p>
            <ul className="mt-1 space-y-1">
              {gap.suggestions.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-blue-600)]" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ─── Next Best Action ───────────────────────────────────────────
function NextBestActionCard({ onView, onStart }: { onView: () => void; onStart: () => void }) {
  const done = useStudentState((s) => s.completedActions.has("nba-1"));
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--ss-blue-600)]/30 bg-gradient-to-br from-[var(--ss-blue-50)] to-white p-5 shadow-soft"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ss-blue-600)] text-white"><Sparkles className="h-4 w-4" /></span>
        <h2 className="text-sm font-bold text-[var(--ss-ink)]">Next Best Action</h2>
        <DemoBadge />
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-blue-600)]">Recommended</p>
      <p className="mt-0.5 text-lg font-bold text-[var(--ss-ink)]">{NEXT_BEST_ACTION.title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--ss-muted)]">
        Addresses a high-impact skill gap and can generate portfolio evidence relevant to the target role.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={onView}>View Action</Button>
        <Button variant="navy" size="sm" className="gap-1.5" onClick={onStart}>
          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
          {done ? "Started" : "Start"}
        </Button>
      </div>
    </motion.section>
  );
}

function NextBestActionModal({ open, onClose, onStart, done }: { open: boolean; onClose: () => void; onStart: () => void; done: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title="Next Best Action" subtitle={NEXT_BEST_ACTION.title} size="md">
      <div className="space-y-3">
        <DemoBadge />
        <Field label="Action" value={NEXT_BEST_ACTION.title} />
        <Field label="Skill addressed" value={NEXT_BEST_ACTION.skill} />
        <Field label="Role" value={NEXT_BEST_ACTION.role} />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Why recommended</p>
          <ul className="mt-1 space-y-1">
            {NEXT_BEST_ACTION.why.map((w) => (
              <li key={w} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Projected Impact</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--ss-teal-600)]">{NEXT_BEST_ACTION.projectedImpact}</p>
          <p className="mt-1 text-[10px] text-[var(--ss-muted)]">We project impact qualitatively — we do not promise a specific score increase.</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Suggested steps</p>
          <ol className="mt-1 space-y-1">
            {NEXT_BEST_ACTION.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--ss-blue-50)] text-[9px] font-bold text-[var(--ss-blue-600)]">{i + 1}</span> {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="navy" className="flex-1 gap-1.5" onClick={() => { onStart(); }}>
            {done ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {done ? "Started" : "Start"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Best Opportunity Match ─────────────────────────────────────
function BestMatchCard({ applied, onApply, onWhy }: { applied: boolean; onApply: () => void; onWhy: () => void }) {
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Best Opportunity Match</h2>
          <DemoBadge />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-[var(--ss-ink)]">{BEST_MATCH.title}</p>
          <p className="text-[11px] text-[var(--ss-muted)]"><Building2 className="mr-1 inline h-3 w-3" />{BEST_MATCH.company} · <MapPin className="inline h-3 w-3" /> {BEST_MATCH.location}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[var(--ss-muted)] sm:grid-cols-4">
            <span><b className="text-[var(--ss-ink-soft)]">Duration:</b> {BEST_MATCH.duration}</span>
            <span><b className="text-[var(--ss-ink-soft)]">Compensation:</b> {BEST_MATCH.compensation}</span>
            <span><b className="text-[var(--ss-ink-soft)]">Mode:</b> {BEST_MATCH.mode}</span>
            <span><b className="text-[var(--ss-ink-soft)]">Deadline:</b> {BEST_MATCH.deadline}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BEST_MATCH.requiredSkills.map((s) => (
              <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
            ))}
          </div>
        </div>
        <MatchBadge score={BEST_MATCH.match} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => useStudentState.getState()}>View Details</Button>
        <Button variant="ghost" size="sm" onClick={onWhy} className="text-[var(--ss-blue-600)]">Why Match?</Button>
        <Button variant="navy" size="sm" className="ml-auto gap-1.5" disabled={applied} onClick={onApply}>
          {applied ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
          {applied ? "Applied" : "Apply Now"}
        </Button>
      </div>
      {applied && (
        <p className="mt-2 rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
          <CheckCircle2 className="mr-1 inline h-3 w-3" /> Successfully applied (prototype workflow — no external application created).
        </p>
      )}
    </section>
  );
}

function WhyMatchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Why this opportunity?" subtitle={`${BEST_MATCH.title} · ${BEST_MATCH.match}% match`} size="sm">
      <div className="space-y-3">
        <DemoBadge />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Alignment</p>
          <ul className="mt-1 space-y-1">
            {BEST_MATCH.whyMatch.map((w) => (
              <li key={w} className="flex items-center gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                <CheckCircle2 className="h-3 w-3 text-[var(--ss-teal-600)]" /> {w}
              </li>
            ))}
          </ul>
        </div>
        {BEST_MATCH.potentialGap && (
          <div className="rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-orange-600)]">Potential gap</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--ss-ink)]">{BEST_MATCH.potentialGap}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence considered</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {BEST_MATCH.evidenceConsidered.map((e) => (
              <span key={e} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{e}</span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Recent Evidence ────────────────────────────────────────────
function RecentEvidence({ onOpen, onViewAll }: { onOpen: (e: EvidenceRow) => void; onViewAll: () => void }) {
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Recent Evidence</h2>
          <DemoBadge />
        </div>
        <button onClick={onViewAll} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View All Evidence →</button>
      </div>
      <div className="space-y-2">
        {EVIDENCE.slice(0, 4).map((e) => (
          <button key={e.id} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-lg border border-[var(--ss-border)] p-3 text-left transition-colors hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]"><FileText className="h-3.5 w-3.5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ss-ink)]">{e.source} · {e.skill}</p>
              <p className="text-[10px] text-[var(--ss-muted)]">{e.date} · {e.time}</p>
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
