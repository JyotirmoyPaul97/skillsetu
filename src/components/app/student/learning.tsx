"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Code2, Brain, Terminal, AlertTriangle, Clock, ListChecks,
  CheckCircle2, PlayCircle, Trophy, ChevronRight, ArrowRight, Users,
  Sparkles, FileText, Target, Info, Check, FileSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  TECHNICAL_SKILLS, SOFT_SKILLS, APTITUDE, GAPS, ASSESSMENTS, ROLES, EVIDENCE,
  type SkillRow, type GapRow, type EvidenceRow, type AssessmentCard,
} from "@/lib/student-data";
import {
  DashHeader, Modal, Drawer, EmptyState, DemoBadge,
  ConfidenceBadge, PriorityBadge, EvidenceStatusBadge,
  EvidenceDetailDrawer, Field,
} from "../student-parts";
import { SsCard, SsStat, SsSkillBar } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================================
   SKILL SETU — Student Portal · Learning section
   - MySkillsPage({ section }) — Technical / Soft / Aptitude / Gap tabs
   - AssessmentPage() — Take Skill Assessment + role selection on start
   Reuses Phase 1 design system (ss.tsx, button.tsx, master tokens).
   Master spec sections 19–24.
   ============================================================ */

// ─── Tab configuration ──────────────────────────────────────────
const SKILL_TABS = [
  { key: "technical", label: "Technical",  short: "Tech",  icon: Code2 },
  { key: "soft",      label: "Soft Skills", short: "Soft", icon: Users },
  { key: "aptitude",  label: "Aptitude",   short: "Aptitude", icon: Brain },
  { key: "gap",       label: "Skill Gap",  short: "Gaps", icon: AlertTriangle },
] as const;

type SkillSection = "technical" | "soft" | "aptitude" | "gap";

const TARGET_SCORE = 80;

// ─── Color helper for skill score → accent ─────────────────────
function scoreAccent(score: number): string {
  if (score >= 80) return "var(--ss-teal-600)";
  if (score >= 60) return "var(--ss-blue-600)";
  return "var(--ss-orange-600)";
}

/* ============================================================
   MySkillsPage — exported
   ============================================================ */
export function MySkillsPage({ section }: { section: SkillSection }) {
  const { navigate } = useRouter();
  const currentRole = useStudentState((s) => s.currentRole);

  const [compDrawer, setCompDrawer] = useState<SkillRow | null>(null);
  const [gapDrawer, setGapDrawer] = useState<GapRow | null>(null);
  const [evDrawer, setEvDrawer] = useState<EvidenceRow | null>(null);

  return (
    <div className="space-y-6">
      <DashHeader
        title="My Skills"
        subtitle={`Competency overview · Target: ${currentRole}`}
        icon={BarChart3}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Tab switcher — navigate between sections */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--ss-border)] bg-white p-1.5 shadow-soft">
        {SKILL_TABS.map((t) => {
          const Icon = t.icon;
          const active = t.key === section;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigate(`/app/skills/${t.key}`)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all sm:text-xs",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "text-[var(--ss-muted)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <motion.div
        key={section}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {section === "technical" && (
          <TechnicalSkillsTab onOpenComp={(s) => setCompDrawer(s)} />
        )}
        {section === "soft" && (
          <SoftSkillsTab onOpenComp={(s) => setCompDrawer(s)} />
        )}
        {section === "aptitude" && <AptitudeTab />}
        {section === "gap" && (
          <SkillGapTab onOpenGap={(g) => setGapDrawer(g)} />
        )}
      </motion.div>

      {/* Shared drawers */}
      <CompetencyDetailDrawer
        skill={compDrawer}
        open={!!compDrawer}
        onClose={() => setCompDrawer(null)}
        onViewEvidence={(e) => {
          setCompDrawer(null);
          setEvDrawer(e);
        }}
      />
      <GapDetailDrawerLocal
        gap={gapDrawer}
        open={!!gapDrawer}
        onClose={() => setGapDrawer(null)}
      />
      <EvidenceDetailDrawer
        evidence={evDrawer}
        open={!!evDrawer}
        onClose={() => setEvDrawer(null)}
      />
    </div>
  );
}

/* ============================================================
   Technical skills tab — section 19 + 20
   ============================================================ */
function TechnicalSkillsTab({ onOpenComp }: { onOpenComp: (s: SkillRow) => void }) {
  const stats = {
    avg: Math.round(TECHNICAL_SKILLS.reduce((a, b) => a + b.score, 0) / TECHNICAL_SKILLS.length),
    evidence: TECHNICAL_SKILLS.reduce((a, b) => a + b.evidenceCount, 0),
    belowTarget: TECHNICAL_SKILLS.filter((s) => s.score < TARGET_SCORE).length,
    top: TECHNICAL_SKILLS.reduce((a, b) => (a.score > b.score ? a : b)),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Avg Score" value={`${stats.avg}`} sub="out of 100" icon={BarChart3} tone="navy" />
        <SsStat label="Evidence" value={stats.evidence} sub="items" icon={FileText} tone="blue" />
        <SsStat label="Below Target" value={stats.belowTarget} sub={`skills < ${TARGET_SCORE}`} icon={AlertTriangle} tone="orange" />
        <SsStat label="Top Skill" value={stats.top.name} sub={`${stats.top.score} / 100`} icon={Trophy} tone="teal" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Technical Skills</h2>
          <DemoBadge />
        </div>
        <span className="hidden text-[10px] text-[var(--ss-faint)] sm:inline">Click a skill for competency details</span>
      </div>

      <SkillCardGrid rows={TECHNICAL_SKILLS} onOpenComp={onOpenComp} />
    </div>
  );
}

/* ============================================================
   Soft skills tab — section 21 (labelled DEMO)
   ============================================================ */
function SoftSkillsTab({ onOpenComp }: { onOpenComp: (s: SkillRow) => void }) {
  const stats = {
    avg: Math.round(SOFT_SKILLS.reduce((a, b) => a + b.score, 0) / SOFT_SKILLS.length),
    evidence: SOFT_SKILLS.reduce((a, b) => a + b.evidenceCount, 0),
    top: SOFT_SKILLS.reduce((a, b) => (a.score > b.score ? a : b)),
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-[var(--ss-orange-600)]/40 bg-[var(--ss-orange-50)]/60 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ss-orange-600)]" />
          <p className="text-xs leading-relaxed text-[var(--ss-ink-soft)]">
            These soft-skill scores are <b>DEMO DATA</b> — illustrative only. In a later phase, these will be derived from
            faculty/peer reviews and behavioural evidence (not self-reported).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Avg Score" value={`${stats.avg}`} sub="out of 100" icon={BarChart3} tone="navy" />
        <SsStat label="Evidence" value={stats.evidence} sub="items" icon={FileText} tone="blue" />
        <SsStat label="Categories" value={SOFT_SKILLS.length} sub="tracked" icon={ListChecks} tone="orange" />
        <SsStat label="Top Skill" value={stats.top.name} sub={`${stats.top.score} / 100`} icon={Trophy} tone="teal" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Soft Skills</h2>
          <DemoBadge>SOFT-SKILL DEMO</DemoBadge>
        </div>
      </div>

      <SkillCardGrid rows={SOFT_SKILLS} onOpenComp={onOpenComp} />
    </div>
  );
}

/* ============================================================
   Aptitude tab — section 22
   ============================================================ */
function AptitudeTab() {
  const highest = APTITUDE.reduce((a, b) => (a.score > b.score ? a : b));
  const avg = Math.round(APTITUDE.reduce((a, b) => a + b.score, 0) / APTITUDE.length);
  const last = APTITUDE[0]?.attemptDate ?? "—";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Aptitude Avg" value={`${avg}`} sub="out of 100" icon={Brain} tone="navy" />
        <SsStat label="Categories" value={APTITUDE.length} sub="evaluated" icon={ListChecks} tone="blue" />
        <SsStat label="Last Attempt" value={last} sub="all categories" icon={Clock} tone="teal" />
        <SsStat label="Highest" value={highest.category} sub={`${highest.score} / 100`} icon={Trophy} tone="orange" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Aptitude Categories</h2>
          <DemoBadge />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {APTITUDE.map((a) => (
          <SsCard key={a.category} tone="lift" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-[var(--ss-ink)]">{a.category}</p>
              <EvidenceStatusBadge status={a.status} />
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold leading-none text-[var(--ss-navy-900)]">{a.score}</p>
              <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">/ 100</p>
            </div>
            <div className="mt-3">
              <SsSkillBar
                label={`vs target (${TARGET_SCORE})`}
                level={a.score}
                target={TARGET_SCORE}
                accent={scoreAccent(a.score)}
              />
            </div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-[var(--ss-muted)]">
              <Clock className="h-3 w-3" />
              Attempted {a.attemptDate}
            </div>
          </SsCard>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Skill gap tab — section 22b
   ============================================================ */
function SkillGapTab({ onOpenGap }: { onOpenGap: (g: GapRow) => void }) {
  const highCount = GAPS.filter((g) => g.priority === "High").length;
  const avgGap = Math.round(GAPS.reduce((a, b) => a + (b.target - b.current), 0) / GAPS.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SsStat label="Open Gaps" value={GAPS.length} sub="vs target role" icon={AlertTriangle} tone="orange" />
        <SsStat label="High Priority" value={highCount} sub="need attention" icon={Target} tone="navy" />
        <SsStat label="Avg Gap" value={`${avgGap}`} sub="points to target" icon={BarChart3} tone="blue" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--ss-orange-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Skill Gaps vs Target Role</h2>
          <DemoBadge />
        </div>
      </div>

      {GAPS.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No skill gaps detected"
          hint="You're at or above target for every weighted skill in your configured role."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {GAPS.map((g) => (
            <GapCard key={g.skill} gap={g} onView={() => onOpenGap(g)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GapCard({ gap, onView }: { gap: GapRow; onView: () => void }) {
  return (
    <SsCard tone="lift" className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--ss-ink)]">{gap.skill}</p>
          <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">Role importance: {gap.roleImportance}%</p>
        </div>
        <PriorityBadge priority={gap.priority} />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-extrabold text-[var(--ss-orange-600)]">{gap.current}</span>
        <span className="pb-1 text-sm text-[var(--ss-faint)]">/ {gap.target}</span>
        <span className="ml-auto pb-1 text-[10px] font-semibold text-[var(--ss-orange-600)]">
          −{gap.target - gap.current} pts
        </span>
      </div>
      <div className="mt-2">
        <SsSkillBar
          label="Current vs target"
          level={gap.current}
          target={gap.target}
          accent="var(--ss-orange-600)"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <ConfidenceBadge level={gap.confidence} />
        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={onView}>
          View Gap
        </Button>
      </div>
    </SsCard>
  );
}

/* ============================================================
   Skill card grid — shared by Technical + Soft tabs
   Whole card clickable → Competency Detail Drawer
   ============================================================ */
function SkillCardGrid({
  rows,
  onOpenComp,
}: {
  rows: SkillRow[];
  onOpenComp: (s: SkillRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No skills to display"
        hint="Skills will appear here once evidence is captured for this section."
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((s) => (
        <SkillCard key={s.name} skill={s} onOpen={() => onOpenComp(s)} />
      ))}
    </div>
  );
}

function SkillCard({ skill, onOpen }: { skill: SkillRow; onOpen: () => void }) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <SsCard
      tone="lift"
      onClick={onOpen}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Open competency details for ${skill.name}`}
      className="cursor-pointer p-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-blue-600)]/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--ss-ink)]">{skill.name}</p>
          <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">Updated {skill.lastUpdated}</p>
        </div>
        <ConfidenceBadge level={skill.confidence} />
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-extrabold leading-none text-[var(--ss-navy-900)]">{skill.score}</p>
          <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">/ 100 competency</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evidence</p>
          <p className="text-sm font-bold text-[var(--ss-blue-600)]">{skill.evidenceCount} item{skill.evidenceCount === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="mt-3">
        <SsSkillBar
          label={`vs target (${TARGET_SCORE})`}
          level={skill.score}
          target={TARGET_SCORE}
          accent={scoreAccent(skill.score)}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--ss-faint)]">
        <span>Role importance: {skill.roleImportance}%</span>
        <span className="inline-flex items-center gap-0.5 font-semibold text-[var(--ss-blue-600)]">
          View details <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </SsCard>
  );
}

/* ============================================================
   Competency Detail Drawer — section 20
   ============================================================ */
function CompetencyDetailDrawer({
  skill,
  open,
  onClose,
  onViewEvidence,
}: {
  skill: SkillRow | null;
  open: boolean;
  onClose: () => void;
  onViewEvidence: (e: EvidenceRow) => void;
}) {
  const relatedEvidence = skill
    ? EVIDENCE.filter((e) => e.skill.toLowerCase() === skill.name.toLowerCase())
    : [];
  const primaryEvidence = relatedEvidence[0] ?? null;

  return (
    <Drawer open={open} onClose={onClose} title="Competency Details" subtitle={skill?.name}>
      {skill && (
        <div className="space-y-3">
          <DemoBadge />

          <Field label="Skill" value={skill.name} />
          <Field label="Competency" value={`${skill.score} / 100`} />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence Confidence</p>
            <div className="mt-1 flex items-center gap-2">
              <ConfidenceBadge level={skill.confidence} />
              <span className="text-[10px] text-[var(--ss-muted)]">
                based on {skill.evidenceCount} evidence item{skill.evidenceCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role Importance" value={`${skill.roleImportance}%`} />
            <Field label="Contribution" value={`${skill.contribution.toFixed(2)} pts`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Last Updated" value={skill.lastUpdated} />
            <Field label="Evidence Count" value={`${skill.evidenceCount} item${skill.evidenceCount === 1 ? "" : "s"}`} />
          </div>

          <div>
            <SsSkillBar
              label={`Competency vs target (${TARGET_SCORE})`}
              level={skill.score}
              target={TARGET_SCORE}
              accent={scoreAccent(skill.score)}
            />
          </div>

          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
            <Info className="mr-1 inline h-3 w-3" />
            <b>Contribution</b> = Competency × Role-Importance. Higher confidence comes from more diverse, evaluated evidence.
          </div>

          {/* Related evidence list */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Related Evidence</p>
            {relatedEvidence.length === 0 ? (
              <div className="mt-2">
                <EmptyState
                  icon={FileSearch}
                  title="No evidence linked yet"
                  hint="Submit an assessment or project to populate this skill's evidence."
                />
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {relatedEvidence.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onViewEvidence(e)}
                    className="flex w-full items-center gap-2 rounded-lg border border-[var(--ss-border)] p-2 text-left transition-colors hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--ss-blue-600)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--ss-ink)]">{e.source}</p>
                      <p className="text-[10px] text-[var(--ss-muted)]">{e.date} · {e.time}</p>
                    </div>
                    {e.score !== null && <span className="text-xs font-bold text-[var(--ss-ink)]">{e.score}</span>}
                    <EvidenceStatusBadge status={e.status} />
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--ss-faint)]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="navy"
            className="w-full gap-1.5"
            disabled={!primaryEvidence}
            onClick={() => primaryEvidence && onViewEvidence(primaryEvidence)}
          >
            <FileText className="h-4 w-4" />
            {primaryEvidence ? "View Evidence" : "No evidence available"}
          </Button>
        </div>
      )}
    </Drawer>
  );
}

/* ============================================================
   Gap Detail Drawer (local — reuses Drawer + Field primitives)
   Spec: do not import the non-exported GapDetailDrawer from dashboard.
   ============================================================ */
function GapDetailDrawerLocal({
  gap,
  open,
  onClose,
}: {
  gap: GapRow | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Skill Gap Details" subtitle={gap?.skill}>
      {gap && (
        <div className="space-y-3">
          <DemoBadge />

          <Field label="Skill" value={gap.skill} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current" value={`${gap.current} / 100`} />
            <Field label="Target" value={`${gap.target} / 100`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role Importance" value={`${gap.roleImportance}%`} />
            <Field label="Gap" value={`−${gap.target - gap.current} pts`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Confidence</p>
              <div className="mt-1"><ConfidenceBadge level={gap.confidence} /></div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Priority</p>
              <div className="mt-1"><PriorityBadge priority={gap.priority} /></div>
            </div>
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

          <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
            <Info className="mr-1 inline h-3 w-3" />
            Closing this gap is expected to raise your role-readiness. We do not promise a specific score increase.
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ============================================================
   AssessmentPage — exported
   Section 23 + 24 (role selection on Start)
   ============================================================ */
export function AssessmentPage() {
  const { navigate } = useRouter();
  const assessmentProgress = useStudentState((s) => s.assessmentProgress);
  const startAssessment = useStudentState((s) => s.startAssessment);
  const completeAssessment = useStudentState((s) => s.completeAssessment);
  const currentRole = useStudentState((s) => s.currentRole);
  const setRole = useStudentState((s) => s.setRole);

  const [roleModal, setRoleModal] = useState<{ open: boolean; pendingId: string | null }>({
    open: false,
    pendingId: null,
  });
  const [resultModal, setResultModal] = useState<string | null>(null);

  const stats = {
    total: ASSESSMENTS.length,
    completed: ASSESSMENTS.filter((a) => assessmentProgress[a.id] === "Completed").length,
    inProgress: ASSESSMENTS.filter((a) => assessmentProgress[a.id] === "In Progress").length,
    notStarted: ASSESSMENTS.filter((a) => assessmentProgress[a.id] === "Not started").length,
  };

  function handleStart(id: string) {
    setRoleModal({ open: true, pendingId: id });
  }
  function handleRoleChosen(roleName: string) {
    setRole(roleName);
    if (roleModal.pendingId) startAssessment(roleModal.pendingId);
    setRoleModal({ open: false, pendingId: null });
  }
  function handleContinue(id: string) {
    completeAssessment(id);
  }

  return (
    <div className="space-y-6">
      <DashHeader
        title="Take Skill Assessment"
        subtitle={`Target Role: ${currentRole} · Build evidence-backed competency`}
        icon={Brain}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Total" value={stats.total} sub="assessments" icon={ListChecks} tone="navy" />
        <SsStat label="Completed" value={stats.completed} sub="evidence ready" icon={CheckCircle2} tone="teal" />
        <SsStat label="In Progress" value={stats.inProgress} sub="continue now" icon={PlayCircle} tone="blue" />
        <SsStat label="Not Started" value={stats.notStarted} sub="pick one to begin" icon={Clock} tone="orange" />
      </div>

      {/* Assessment cards — every card has useful content (spec: NO empty placeholder cards) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {ASSESSMENTS.map((a) => {
          const status = assessmentProgress[a.id] ?? a.status;
          return (
            <AssessmentCardView
              key={a.id}
              assessment={a}
              status={status}
              currentRole={currentRole}
              onStart={() => handleStart(a.id)}
              onContinue={() => handleContinue(a.id)}
              onViewResult={() => setResultModal(a.id)}
            />
          );
        })}
      </div>

      {/* Useful contextual info card (replaces any placeholder) */}
      <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">How assessments work</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ss-muted)]">
              Each assessment generates evidence that flows into your Skill Passport and updates competency scores
              &amp; role-readiness. Aptitude, Technical and Coding assessments each evaluate different skill dimensions —
              start any of them to update your target-role configuration.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" onClick={() => navigate("/app/skills/technical")}>
                <BarChart3 className="h-3.5 w-3.5" /> View Skills
              </Button>
              <Button variant="ghost" size="sm" className="text-[var(--ss-blue-600)]" onClick={() => navigate("/app/passport/verified")}>
                <FileText className="h-3.5 w-3.5" /> Skill Passport
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Role-selection modal triggered by Start Assessment (spec §24) */}
      <StartAssessmentRoleModal
        open={roleModal.open}
        pendingId={roleModal.pendingId}
        currentRole={currentRole}
        onClose={() => setRoleModal({ open: false, pendingId: null })}
        onChoose={handleRoleChosen}
      />

      {/* Result modal for Completed assessments */}
      <ResultModal
        assessmentId={resultModal}
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        onViewSkills={() => {
          setResultModal(null);
          navigate("/app/skills/technical");
        }}
      />
    </div>
  );
}

/* ─── Assessment card ─────────────────────────────────────────── */
function AssessmentCardView({
  assessment,
  status,
  currentRole,
  onStart,
  onContinue,
  onViewResult,
}: {
  assessment: AssessmentCard;
  status: "Not started" | "In Progress" | "Completed";
  currentRole: string;
  onStart: () => void;
  onContinue: () => void;
  onViewResult: () => void;
}) {
  const iconMap: Record<AssessmentCard["type"], LucideIcon> = {
    "Aptitude": Brain,
    "Technical": Code2,
    "Coding / Practical": Terminal,
  };
  const toneMap: Record<AssessmentCard["type"], { bg: string; fg: string }> = {
    "Aptitude":          { bg: "var(--ss-blue-50)",   fg: "var(--ss-blue-600)" },
    "Technical":          { bg: "var(--ss-teal-50)",   fg: "var(--ss-teal-600)" },
    "Coding / Practical": { bg: "var(--ss-orange-50)", fg: "var(--ss-orange-600)" },
  };
  const Icon = iconMap[assessment.type];
  const c = toneMap[assessment.type];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SsCard tone="lift" className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: c.bg, color: c.fg }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--ss-ink)]">{assessment.type}</p>
              <p className="text-[10px] text-[var(--ss-muted)]">Assessment</p>
            </div>
          </div>
          <AssessmentStatusBadge status={status} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--ss-ink-soft)]">{assessment.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[var(--ss-border)] p-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Duration</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--ss-ink)]">
              <Clock className="mr-1 inline h-3 w-3 text-[var(--ss-muted)]" />{assessment.duration}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] p-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Questions</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--ss-ink)]">
              <ListChecks className="mr-1 inline h-3 w-3 text-[var(--ss-muted)]" />{assessment.questions}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px] text-[var(--ss-muted)]">
          <span>Role focus: <b className="text-[var(--ss-ink-soft)]">{currentRole}</b></span>
        </div>

        <div className="mt-auto pt-4">
          {status === "Not started" && (
            <Button variant="navy" size="sm" className="w-full gap-1.5" onClick={onStart}>
              <PlayCircle className="h-4 w-4" /> Start Assessment
            </Button>
          )}
          {status === "In Progress" && (
            <div className="space-y-2">
              <div className="rounded-lg bg-[var(--ss-blue-50)] px-3 py-2 text-[10px] font-medium text-[var(--ss-blue-600)]">
                In progress — pick up where you left off.
              </div>
              <Button variant="blue" size="sm" className="w-full gap-1.5" onClick={onContinue}>
                <CheckCircle2 className="h-4 w-4" /> Continue &amp; Complete
              </Button>
            </div>
          )}
          {status === "Completed" && (
            <Button variant="teal" size="sm" className="w-full gap-1.5" onClick={onViewResult}>
              <Trophy className="h-4 w-4" /> View Result
            </Button>
          )}
        </div>
      </SsCard>
    </motion.div>
  );
}

function AssessmentStatusBadge({ status }: { status: "Not started" | "In Progress" | "Completed" }) {
  const map: Record<string, [string, string]> = {
    "Not started": ["#F1F5F9", "#64748B"],
    "In Progress": ["#DBEAFE", "#2563EB"],
    "Completed":   ["#CCFBF1", "#0D9488"],
  };
  const [bg, fg] = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: bg, color: fg }}
    >
      {status === "Completed" && <Check className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}

/* ============================================================
   Start-Assessment Role Selection Modal — spec §24
   Lists all 12 ROLES as cards with description + key skills.
   Selection drives frontend config via useStudentState.setRole.
   ============================================================ */
function StartAssessmentRoleModal({
  open,
  pendingId,
  currentRole,
  onClose,
  onChoose,
}: {
  open: boolean;
  pendingId: string | null;
  currentRole: string;
  onClose: () => void;
  onChoose: (roleName: string) => void;
}) {
  const pendingAssessment = ASSESSMENTS.find((a) => a.id === pendingId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Target Role"
      subtitle={pendingAssessment ? `${pendingAssessment.type} Assessment · Role drives readiness config` : "Drives role readiness config"}
      size="lg"
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-3 text-xs text-[var(--ss-ink-soft)]">
          <p><b>Current target role:</b> {currentRole}</p>
          <p className="mt-0.5 text-[11px] text-[var(--ss-muted)]">
            Pick a role below to update your configuration, then we'll start the assessment. You can change it later.
          </p>
        </div>

        <div className="grid max-h-[50vh] gap-2.5 overflow-y-auto scroll-slim pr-1 sm:grid-cols-2">
          {ROLES.map((r) => {
            const active = r.name === currentRole;
            return (
              <button
                key={r.name}
                onClick={() => onChoose(r.name)}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)] ring-1 ring-[var(--ss-blue-600)]/30"
                    : "border-[var(--ss-border)] hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-600)] text-white"
                      : "border-[var(--ss-line)]",
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{r.name}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[var(--ss-muted)]">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.keySkills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-[var(--ss-muted)]">
          For this phase, changing the role updates the displayed configuration only. The full calculation backend arrives in a later phase.
        </p>

        <div className="flex flex-wrap justify-between gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="ghost"
            className="text-[var(--ss-blue-600)]"
            disabled={!pendingId}
            onClick={() => pendingId && onChoose(currentRole)}
          >
            Keep &ldquo;{currentRole}&rdquo; &amp; Start →
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   Result Modal — when "View Result" is clicked
   ============================================================ */
function ResultModal({
  assessmentId,
  open,
  onClose,
  onViewSkills,
}: {
  assessmentId: string | null;
  open: boolean;
  onClose: () => void;
  onViewSkills: () => void;
}) {
  const a = ASSESSMENTS.find((x) => x.id === assessmentId);
  if (!a) return null;

  // Demo result values per assessment type (clearly labelled DEMO)
  const scoreMap: Record<AssessmentCard["type"], number> = {
    "Aptitude": 73,
    "Technical": 64,
    "Coding / Practical": 71,
  };
  const percentileMap: Record<AssessmentCard["type"], number> = {
    "Aptitude": 68,
    "Technical": 58,
    "Coding / Practical": 62,
  };
  const score = scoreMap[a.type];
  const percentile = percentileMap[a.type];
  const evidenceLabel = `${a.type} Assessment · ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <Modal open={open} onClose={onClose} title="Assessment Result" subtitle={`${a.type} · Completed`} size="md">
      <div className="space-y-3">
        <DemoBadge />

        <div className="rounded-xl border border-[var(--ss-teal-600)]/30 bg-[var(--ss-teal-50)] p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-teal-600)]">Your Score</p>
          <p className="mt-1 text-5xl font-extrabold text-[var(--ss-navy-900)]">
            {score}
            <span className="text-lg text-[var(--ss-faint)]"> / 100</span>
          </p>
          <p className="mt-1 text-[11px] text-[var(--ss-muted)]">~{percentile}th percentile (demo)</p>
        </div>

        <Field label="Assessment" value={a.type} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration" value={a.duration} />
          <Field label="Questions" value={`${a.questions} items`} />
        </div>
        <Field label="Evidence generated" value={evidenceLabel} />

        <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
          <Info className="mr-1 inline h-3 w-3" />
          This score has been recorded as evidence in your Skill Passport and contributes to your role-readiness calculation.
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="navy" className="flex-1 gap-1.5" onClick={onViewSkills}>
            <BarChart3 className="h-4 w-4" /> View Skills
          </Button>
        </div>
      </div>
    </Modal>
  );
}
