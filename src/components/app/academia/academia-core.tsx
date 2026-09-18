"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, BookOpen, TrendingUp, AlertTriangle, Sparkles,
  ArrowRight, CheckCircle2, Info, ChevronRight, Search,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useAcademia, AcademiaService, useAcademiaStore, DEMO_FACULTY, DEMO_INSTITUTION } from "@/lib/academia";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurriculumAlignmentRow, IndustrySkillSignal, CohortSkillGap } from "@/lib/academia/academia-model";

export function AcademiaCore({ section }: { section: string }) {
  if (section === "dashboard") return <AcademiaDashboard />;
  if (section === "skills") return <SkillIntelligence />;
  if (section === "curriculum") return <CurriculumAlignment />;
  if (section === "opportunities") return <FacultyOpportunities />;
  return <AcademiaDashboard />;
}

// ─── Dashboard (§3, §4) ────────────────────────────────────────
function AcademiaDashboard() {
  const { navigate } = useRouter();
  const a = useAcademia();
  const emerging = a.emerging.slice(0, 3);
  const gaps = a.gaps.filter((g) => g.gap === "High").slice(0, 3);
  const alignmentGaps = a.alignment.filter((r) => r.alignment === "Gap" || r.alignment === "Needs Attention").slice(0, 3);
  const facultyOpps = AcademiaService.getFacultyOpportunities();

  return (
    <div className="space-y-6">
      <DashHeader title={`Good morning, ${DEMO_FACULTY.name.split(" ").slice(-1)[0]}`} subtitle={`${DEMO_FACULTY.department} · ${DEMO_INSTITUTION.name}`} icon={LayoutDashboard} accent="#2563EB" action={<DemoBadge />} />
      {/* Intelligence headings (§37) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SsStat label="Emerging Skills" value={a.emerging.length} icon={TrendingUp} tone="blue" />
        <SsStat label="Curriculum Gaps" value={alignmentGaps.length} icon={AlertTriangle} tone="orange" />
        <SsStat label="Industry Opps" value={a.opportunities.length} icon={Briefcase} tone="navy" />
        <SsStat label="Students Needing Intervention" value={a.gaps.filter((g) => g.gap === "High").length} icon={Sparkles} tone="teal" />
      </div>
      {/* Core loop (§38, §86) */}
      <SsCard tone="soft" className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-[var(--ss-ink)]">Academia Intelligence:</span>
          {["Industry Signals", "Emerging Skills", "Student Evidence", "Curriculum Alignment", "Gap", "Intervention", "Practical Exposure", "New Evidence"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2"><span className="text-[var(--ss-blue-600)]">{s}</span>{i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}</span>
          ))}
        </div>
      </SsCard>
      {/* Industry signals preview */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Industry Skill Signals</h2><button onClick={() => navigate("/academia/skills")} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View all →</button></div>
        <div className="space-y-2">{a.signals.slice(0, 4).map((sig) => <SignalRow key={sig.skillId} sig={sig} />)}</div>
      </SsCard>
      {/* Emerging skills */}
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Emerging Skills</h2>
        {emerging.length === 0 ? <p className="text-sm text-[var(--ss-muted)]">No emerging skills detected in current data.</p> : (
          <div className="space-y-2">{emerging.map((s) => (
            <div key={s.skillId} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{s.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{s.reason}</p></div><SsBadge tone="blue" className="text-[10px]">{s.demandLevel}</SsBadge></div>
          ))}</div>
        )}
      </SsCard>
      {/* Curriculum alerts */}
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Curriculum Alerts</h2>
        {alignmentGaps.length === 0 ? <p className="text-sm text-[var(--ss-teal-600)]">No current alignment alerts.</p> : (
          <div className="space-y-2">{alignmentGaps.map((r) => (
            <div key={r.skillId} className="flex items-center justify-between rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-2.5">
              <div><p className="text-sm font-semibold text-[var(--ss-ink)]">{r.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{r.skillName} demand {r.industryDemand}, coverage {r.curriculumCoverage}, practical {r.practicalEvidence}</p></div>
              <SsBadge tone="orange" className="text-[10px]">{r.alignment}</SsBadge>
            </div>
          ))}</div>
        )}
      </SsCard>
    </div>
  );
}

function SignalRow({ sig }: { sig: IndustrySkillSignal }) {
  return <div className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{sig.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{sig.opportunityCount} opportunities · roles: {sig.targetRoles.join(", ")}</p></div><SsBadge tone={sig.demandLevel === "High" ? "orange" : "blue"} className="text-[10px]">{sig.demandLevel}</SsBadge></div>;
}

// ─── Skill Intelligence (§5-10) ────────────────────────────────
function SkillIntelligence() {
  const a = useAcademia();
  const [whySig, setWhySig] = useState<IndustrySkillSignal | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Skill Intelligence" subtitle="Industry signals + emerging skills + student cohort gaps (derived from shared data)" icon={BarChart3} accent="#2563EB" action={<DemoBadge />} />
      {/* Industry signals */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Industry Skill Signals</h2><DemoBadge /></div>
        <p className="mb-3 text-[11px] text-[var(--ss-muted)]">Derived from actual Phase 4+5 opportunity/challenge records — not a separate demand dataset.</p>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]"><tr><th className="py-2 pr-3 text-left font-semibold">Skill</th><th className="py-2 pr-3 text-left font-semibold">Demand</th><th className="py-2 pr-3 text-left font-semibold">Opp Count</th><th className="py-2 pr-3 text-left font-semibold">Target Roles</th><th className="py-2 text-left font-semibold"></th></tr></thead><tbody>
          {a.signals.map((sig) => <tr key={sig.skillId} className="border-t border-[var(--ss-border)]"><td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{sig.skillName}</td><td className="py-2 pr-3"><SsBadge tone={sig.demandLevel === "High" ? "orange" : "blue"} className="text-[10px]">{sig.demandLevel}</SsBadge></td><td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{sig.opportunityCount}</td><td className="py-2 pr-3 text-[var(--ss-muted)]">{sig.targetRoles.join(", ")}</td><td className="py-2"><button onClick={() => setWhySig(sig)} className="text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Why?</button></td></tr>)}
        </tbody></table></div>
      </SsCard>
      {/* Student cohort gaps */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Student Skill Gaps (Aggregate)</h2><DemoBadge /></div>
        <p className="mb-3 text-[11px] text-[var(--ss-muted)]">Aggregate from shared student intelligence — no private individual data exposed.</p>
        <div className="space-y-2">{a.gaps.map((g) => <CohortGapRow key={g.skillId} gap={g} />)}</div>
      </SsCard>
      <Modal open={!!whySig} onClose={() => setWhySig(null)} title={`Why is ${whySig?.skillName} in demand?`} size="sm">
        {whySig && <div className="space-y-2"><DemoBadge /><p className="text-sm text-[var(--ss-ink-soft)]">{whySig.recentSignal}</p><p className="text-[11px] text-[var(--ss-muted)]">Based on current platform/demo data. This is not a claim about industry-wide demand beyond the platform dataset.</p></div>}
      </Modal>
    </div>
  );
}

function CohortGapRow({ gap: g }: { gap: CohortSkillGap }) {
  return <div className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{g.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">Avg {g.avgCompetency} · {g.affectedStudents} students · roles: {g.targetRoles.join(", ")}</p></div><SsBadge tone={g.gap === "High" ? "orange" : g.gap === "Medium" ? "blue" : "teal"} className="text-[10px]">{g.gap} gap</SsBadge></div>;
}

// ─── Curriculum Alignment (§11-17, §50) ────────────────────────
function CurriculumAlignment() {
  const a = useAcademia();
  const [detail, setDetail] = useState<CurriculumAlignmentRow | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Curriculum Alignment" subtitle="Industry demand vs curriculum coverage vs student competency" icon={BookOpen} accent="#2563EB" action={<DemoBadge />} />
      {/* Alignment matrix */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-bold text-[var(--ss-ink)]">Curriculum Alignment Matrix</h2></div>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]"><tr><th className="py-2 pr-3 text-left font-semibold">Skill</th><th className="py-2 pr-3 text-left font-semibold">Demand</th><th className="py-2 pr-3 text-left font-semibold">Coverage</th><th className="py-2 pr-3 text-left font-semibold">Student Avg</th><th className="py-2 pr-3 text-left font-semibold">Practical</th><th className="py-2 pr-3 text-left font-semibold">Alignment</th><th className="py-2 text-left font-semibold"></th></tr></thead><tbody>
          {a.alignment.map((r) => <tr key={r.skillId} className="border-t border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-2)]" onClick={() => setDetail(r)}>
            <td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{r.skillName}</td>
            <td className="py-2 pr-3"><SsBadge tone={r.industryDemand === "High" ? "orange" : "blue"} className="text-[10px]">{r.industryDemand}</SsBadge></td>
            <td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{r.curriculumCoverage}</td>
            <td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{r.studentAvgCompetency}</td>
            <td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{r.practicalEvidence}</td>
            <td className="py-2 pr-3"><SsBadge tone={r.alignment === "Aligned" ? "teal" : r.alignment === "Needs Attention" ? "blue" : "orange"} className="text-[10px]">{r.alignment}</SsBadge></td>
            <td className="py-2"><ChevronRight className="h-3.5 w-3.5 text-[var(--ss-faint)]" /></td>
          </tr>)}
        </tbody></table></div>
      </SsCard>
      {/* Enrichment recommendations (§35, §36) */}
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Recommended Curriculum Enrichment</h2>
        <div className="space-y-2">{a.alignment.filter((r) => r.suggestedEnrichment.length > 0 && r.suggestedEnrichment[0] !== "Monitor").map((r) => (
          <div key={r.skillId} className="rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-2.5">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ss-ink)]">{r.skillName}</p><span className="text-[10px] text-[var(--ss-blue-600)]">Recommended for faculty review</span></div>
            <div className="mt-1.5 flex flex-wrap gap-1">{r.suggestedEnrichment.map((e) => <span key={e} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--ss-blue-600)]">{e}</span>)}</div>
          </div>
        ))}</div>
      </SsCard>
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={`Curriculum Detail — ${detail?.skillName}`} subtitle={detail?.alignment}>
        {detail && <div className="space-y-3">
          <DemoBadge />
          <Field label="Industry Demand" value={`${detail.industryDemand} (${detail.demandCount} opportunities)`} />
          <Field label="Curriculum Coverage" value={detail.curriculumCoverage} />
          <Field label="Student Avg Competency" value={`${detail.studentAvgCompetency}/100`} />
          <Field label="Practical Evidence" value={detail.practicalEvidence} />
          <Field label="Practical Exposure Gap" value={detail.practicalExposureGap} />
          <Field label="Target Roles" value={detail.targetRoles.join(", ")} />
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Why?</p><p className="mt-1 text-xs text-[var(--ss-ink-soft)]">Alignment is "{detail.alignment}" because curriculum covers the skill at {detail.curriculumCoverage} level, student practical evidence is {detail.practicalEvidence}, and industry demand is {detail.industryDemand} within the current platform dataset.</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Suggested Enrichment</p><div className="mt-1 flex flex-wrap gap-1">{detail.suggestedEnrichment.map((e) => <SsBadge key={e} tone="blue" className="text-[10px]">{e}</SsBadge>)}</div></div>
        </div>}
      </Drawer>
    </div>
  );
}

// ─── Faculty Opportunities (§19-23) ───────────────────────────
function FacultyOpportunities() {
  const { navigate } = useRouter();
  const opps = AcademiaService.getFacultyOpportunities();
  const apps = useAcademiaStore((s) => s.facultyApplications);
  const { applyToFacultyOpp } = useAcademiaStore();
  const [detail, setDetail] = useState<typeof opps[0] | null>(null);
  const [type, setType] = useState("");
  const filtered = type ? opps.filter((o) => o.type === type) : opps;
  return (
    <div className="space-y-6">
      <DashHeader title="Faculty Opportunities" subtitle="Internships, FDPs, training, consultancy, research" icon={Briefcase} accent="#2563EB" action={<DemoBadge />} />
      <div className="flex flex-wrap gap-1.5"><button onClick={() => setType("")} className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", !type ? "bg-[var(--ss-blue-600)] text-white" : "bg-[var(--ss-surface-3)]")}>All</button>{["FACULTY_INTERNSHIP", "INDUSTRIAL_TRAINING", "FDP", "CONSULTANCY", "RESEARCH_COLLABORATION", "GUEST_LECTURE"].map((t) => <button key={t} onClick={() => setType(t)} className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", type === t ? "bg-[var(--ss-blue-600)] text-white" : "bg-[var(--ss-surface-3)]")}>{t.replace(/_/g, " ")}</button>)}</div>
      <div className="grid gap-3 md:grid-cols-2">{filtered.map((o) => {
        const applied = apps.some((a) => a.opportunityId === o.id);
        return <SsCard key={o.id} tone="lift" className="p-4">
          <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
          <p className="text-[10px] text-[var(--ss-muted)]">{o.organization} · {o.type.replace(/_/g, " ")} · {o.location} · {o.duration}</p>
          <div className="mt-2 flex flex-wrap gap-1">{o.skills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
          <div className="mt-3 flex gap-1.5"><Button variant="outline" size="sm" className="h-8 flex-1 text-[11px]" onClick={() => setDetail(o)}>View</Button><Button variant="blue" size="sm" className="h-8 flex-1 text-[11px]" disabled={applied} onClick={() => applyToFacultyOpp(o.id, DEMO_FACULTY.facultyId)}>{applied ? "Applied" : "Apply"}</Button></div>
        </SsCard>;
      })}</div>
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle={detail?.organization}>
        {detail && <div className="space-y-3"><DemoBadge /><Field label="About" value={detail.description} /><Field label="Type" value={detail.type.replace(/_/g, " ")} /><Field label="Duration" value={detail.duration} /><Field label="Location" value={`${detail.location} · ${detail.mode}`} /><Field label="Deadline" value={detail.deadline} /><Field label="Eligibility" value={detail.eligibility} />{detail.expectedOutcomes && <Field label="Expected Outcomes" value={detail.expectedOutcomes} />}<div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Relevant Skills</p><div className="mt-1 flex flex-wrap gap-1">{detail.skills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName}</SsBadge>)}</div></div></div>}
      </Drawer>
    </div>
  );
}

// need to import Briefcase for the header
import { Briefcase } from "lucide-react";
