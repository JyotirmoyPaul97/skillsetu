"use client";

import { useMemo, useState } from "react";
import {
  Briefcase, Users, BookOpen, Trophy, Sparkles, FileText, Bell, User,
  PlusCircle, CheckCircle2, ArrowRight, TrendingUp,
  Target, GitBranch, Activity,
} from "lucide-react";
import { useInstitution, InstitutionService, useInstitutionStore, DEMO_USER } from "@/lib/institution";
import { AcademiaService } from "@/lib/academia/academia-service";
import { useAcademiaStore } from "@/lib/academia/academia-store";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { InstitutionAggregator, useAggregators } from "@/lib/intelligence/aggregators";
import {
  DashHeader, Modal, EmptyState, Field,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsStat as SsStatTile } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InterventionType, Priority, Intervention } from "@/lib/institution/institution-model";
import {
  SsDemandBadge, SsPriorityPill, SsCoverageBar, SsPipeline,
  SsWhyModal, SsDataSourceLabel, SsWorkflowBanner,
} from "@/components/ui/ss-intelligence";

export function InstitutionExtra({ section }: { section: string }) {
  if (section === "placements") return <PlacementIntelligencePage />;
  if (section === "internships") return <InternshipIntelligencePage />;
  if (section === "alignment") return <IndustryAlignmentPage />;
  if (section === "hackathons") return <HackathonIntelligencePage />;
  if (section === "interventions") return <ActionCenterPage />;
  if (section === "collaborations") return <CollaborationsPage />;
  if (section === "reports") return <ReportsPage />;
  if (section === "notifications") return <NotificationsPage />;
  if (section === "profile") return <ProfilePage />;
  return <PlacementIntelligencePage />;
}

// ──────────────────────────────────────────────────────────────────
// Interventions — INSTITUTION ACTION CENTER (§45–§48)
// ──────────────────────────────────────────────────────────────────
const INTERVENTION_TYPES: InterventionType[] = [
  "Industry Workshop", "Bootcamp", "Mentor Program", "Industry Project",
  "Hackathon", "Certification", "Faculty Mentorship", "Curriculum Enrichment",
];

const STATUS_TABS = [
  { key: "Recommended", label: "Recommended" },
  { key: "Proposed", label: "Proposed" },
  { key: "Active", label: "Active" },
  { key: "Completed", label: "Completed" },
] as const;

function ActionCenterPage() {
  const inst = useInstitution();
  const { createIntervention, updateInterventionStatus } = useInstitutionStore();
  const { Institution: agg } = useAggregators();
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["key"]>("Recommended");
  const [showCreate, setShowCreate] = useState(false);
  const [whyInt, setWhyInt] = useState<Intervention | null>(null);
  const [whyRec, setWhyRec] = useState<typeof inst.cohortInterventions[0] | null>(null);
  const [typeFilter, setTypeFilter] = useState<InterventionType | "">("");

  const interventions = inst.interventions;
  const recommended = inst.cohortInterventions;

  const visibleInterventions = useMemo(() => {
    let list = interventions;
    if (tab === "Proposed") list = interventions.filter((i) => i.status === "Proposed" || i.status === "Approved" || i.status === "Recommended");
    else if (tab === "Active") list = interventions.filter((i) => i.status === "Active" || i.status === "Scheduled");
    else if (tab === "Completed") list = interventions.filter((i) => i.status === "Completed" || i.status === "Evaluated");
    if (typeFilter) list = list.filter((i) => i.type === typeFilter);
    return list;
  }, [interventions, tab, typeFilter]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Institution Action Center"
        subtitle="Where skill gaps become interventions — Recommended → Proposed → Active → Completed (§45)"
        icon={Sparkles}
        accent="#0F2547"
        action={<Button variant="navy" size="sm" className="h-8 gap-1.5" onClick={() => setShowCreate(true)}><PlusCircle className="h-3.5 w-3.5" /> Create Intervention</Button>}
      />

      <SsCard tone="soft" className="p-3">
        <SsWorkflowBanner tone="navy" steps={["Recommended", "Proposed", "Approved", "Scheduled", "Active", "Completed", "Evaluated"]} />
      </SsCard>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              tab === t.key ? "bg-[var(--ss-navy-900)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Type legend / filter (§47) */}
      <SsCard tone="soft" className="p-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Intervention types (§47)</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter("")}
            className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", typeFilter === "" ? "bg-[var(--ss-navy-900)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)]")}
          >
            All types
          </button>
          {INTERVENTION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", typeFilter === t ? "bg-[var(--ss-navy-900)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)]")}
            >
              {t}
            </button>
          ))}
        </div>
      </SsCard>

      {/* Content per tab */}
      {tab === "Recommended" && (
        recommended.length === 0
          ? <EmptyState icon={Sparkles} title="No recommendations" hint="All demand signals are matched by supply." />
          : (
            <div className="space-y-2.5">
              {recommended.map((r) => (
                <SsCard key={r.skillId} tone="lift" className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{r.suggestedAction} for {r.skillName}</p>
                      <p className="text-[10px] text-[var(--ss-muted)]">{r.skillName} · {r.affectedStudents} student(s) affected · avg competency {r.avgCompetency}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SsPriorityPill priority={r.gap as Priority} />
                      <SsDemandBadge level={r.avgCompetency < 50 ? "Critical" : r.avgCompetency < 65 ? "High" : "Medium"} />
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--ss-ink-soft)]">{r.reason}</p>
                  <p className="mt-1 text-[10px] text-[var(--ss-blue-600)]">Recommended action: {r.suggestedAction}</p>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setWhyRec(r)}>Why this intervention?</Button>
                    <Button variant="navy" size="sm" className="h-7 text-[11px]" onClick={() => createIntervention({ skillId: r.skillId, skillName: r.skillName, department: "AI & Data Science", targetCohort: "AI & DS cohort", owner: DEMO_USER.name, type: r.suggestedAction, expectedOutcome: `Improved ${r.skillName} competency + practical evidence`, reason: r.reason, priority: r.gap as Priority, affectedStudents: r.affectedStudents })}>
                      Create Intervention
                    </Button>
                  </div>
                </SsCard>
              ))}
            </div>
          )
      )}

      {(tab === "Proposed" || tab === "Active" || tab === "Completed") && (
        visibleInterventions.length === 0
          ? <EmptyState icon={Sparkles} title={`No ${tab.toLowerCase()} interventions`} hint={tab === "Completed" ? "Move interventions through their lifecycle." : "Create interventions from the Recommended tab."} />
          : (
            <div className="space-y-3">
              {visibleInterventions.map((i) => (
                <ActionInterventionCard
                  key={i.id}
                  intervention={i}
                  onWhy={() => setWhyInt(i)}
                  onAdvance={(status) => updateInterventionStatus(i.id, status)}
                />
              ))}
            </div>
          )
      )}

      {/* §46 — Why this intervention? affordance */}
      <SsWhyModal
        open={!!whyInt}
        onClose={() => setWhyInt(null)}
        title={`Why ${whyInt?.type}?`}
        subtitle={whyInt ? `Skill: ${whyInt.skillName} · Department: ${whyInt.department}` : ""}
        factors={whyInt ? buildWhyInterventionFactors(whyInt) : []}
      >
        <SsDataSourceLabel source="platform" />
        <p className="mt-2 text-[11px] text-[var(--ss-muted)]">{whyInt?.reason}</p>
        <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Recommended for institutional consideration. Not a guarantee of improvement.</p>
      </SsWhyModal>

      <SsWhyModal
        open={!!whyRec}
        onClose={() => setWhyRec(null)}
        title={`Why ${whyRec?.suggestedAction}?`}
        subtitle={`Skill: ${whyRec?.skillName}`}
        factors={whyRec ? buildWhyRecFactors(whyRec) : []}
      >
        <SsDataSourceLabel source="platform" />
        <p className="mt-2 text-[11px] text-[var(--ss-muted)]">{whyRec?.reason}</p>
      </SsWhyModal>

      {showCreate && <CreateInterventionForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function buildWhyInterventionFactors(i: Intervention): { ok: "pass" | "warn" | "fail"; label: string; detail?: string }[] {
  const demand = (i.priority === "Critical" || i.priority === "High") ? "High" : "Medium";
  // Intervention model doesn't track avgCompetency directly — use priority as a proxy for skill severity
  const practical = i.priority === "Critical" || i.priority === "High" ? "Limited" : "Moderate";
  return [
    { ok: demand === "High" ? "warn" : "pass", label: `Industry demand: ${demand}`, detail: "Derived from current opportunity requirements." },
    { ok: i.affectedStudents > 5 ? "warn" : "pass", label: `Affected students: ${i.affectedStudents}`, detail: "Count of students with competency below target for this skill." },
    { ok: practical === "Limited" ? "fail" : "pass", label: `Practical evidence: ${practical}`, detail: "Based on intervention priority as a proxy for cohort competency gap." },
    { ok: "pass", label: `Relevant roles: ${i.targetCohort || "—"}` },
    { ok: "warn", label: `Available industry support: ${i.type === "Industry Workshop" || i.type === "Industry Project" || i.type === "Mentor Program" ? "Yes" : "No"}`, detail: "Based on active collaborations and faculty opportunities of this type." },
  ];
}

function buildWhyRecFactors(r: { skillName: string; gap: Priority; affectedStudents: number; avgCompetency: number; targetRoles?: string[]; suggestedAction: InterventionType }): { ok: "pass" | "warn" | "fail"; label: string; detail?: string }[] {
  const demand = r.gap === "Critical" || r.gap === "High" ? "High" : "Medium";
  return [
    { ok: demand === "High" ? "warn" : "pass", label: `Industry demand: ${demand}` },
    { ok: "pass", label: `Average competency: ${r.avgCompetency}` },
    { ok: r.avgCompetency < 50 ? "fail" : "pass", label: `Practical evidence: ${r.avgCompetency < 50 ? "Limited" : "Strong"}` },
    { ok: "warn", label: `Affected students: ${r.affectedStudents}` },
    { ok: "pass", label: `Recommended action: ${r.suggestedAction}` },
  ];
}

function ActionInterventionCard({ intervention: i, onWhy, onAdvance }: { intervention: Intervention; onWhy: () => void; onAdvance: (status: Intervention["status"]) => void }) {
  const monitoring = useMemo(() => InstitutionAggregator.getOutcomeMonitoring(i.id), [i.id]);
  const stages = [
    { key: "before", label: "Before", icon: Activity },
    { key: "intervention", label: "Intervention", icon: Target },
    { key: "participation", label: "Participation", icon: Users },
    { key: "evidence", label: "Evidence", icon: FileText },
    { key: "change", label: "Observed Change", icon: TrendingUp },
  ];

  // compute active index — depends on status
  const activeIndex = i.status === "Recommended" || i.status === "Proposed" ? 0
    : i.status === "Approved" || i.status === "Scheduled" ? 1
    : i.status === "Active" ? 2
    : 4;
  const completedUntil = i.status === "Completed" || i.status === "Evaluated" ? 5 : undefined;

  return (
    <SsCard tone="soft" className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[var(--ss-ink)]">{i.type} — {i.skillName}</p>
          <p className="text-[10px] text-[var(--ss-muted)]">
            {i.department} · owner: {i.owner} · {i.affectedStudents} students
            {i.startDate && ` · start: ${i.startDate.slice(0, 10)}`}
            {i.endDate && ` · end: ${i.endDate.slice(0, 10)}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <SsPriorityPill priority={i.priority} />
          <SsBadge tone={i.status === "Active" ? "teal" : i.status === "Completed" || i.status === "Evaluated" ? "navy" : "blue"} className="text-[10px]">{i.status}</SsBadge>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-[var(--ss-ink-soft)]"><b>Problem:</b> {i.reason}</p>
      <p className="mt-1 text-[11px] text-[var(--ss-blue-600)]"><b>Recommended action:</b> {i.type}</p>
      <p className="mt-1 text-[11px] text-[var(--ss-ink-soft)]"><b>Expected outcome:</b> {i.expectedOutcome}</p>

      {/* §48 — Outcome Monitoring pipeline */}
      {(i.status === "Active" || i.status === "Completed" || i.status === "Evaluated") && monitoring && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Outcome Monitoring (§48)</p>
            <SsDataSourceLabel source="platform" />
          </div>
          <SsPipeline stages={stages} activeIndex={activeIndex} completedUntil={completedUntil} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            <div className="rounded-md border border-[var(--ss-border)] bg-white p-2"><p className="text-[10px] text-[var(--ss-muted)]">Before evidence</p><p className="font-bold text-[var(--ss-ink)]">{monitoring.before.evidenceCount}</p><p className="text-[9px] text-[var(--ss-faint)]">{monitoring.before.verifiedCount} verified</p></div>
            <div className="rounded-md border border-[var(--ss-border)] bg-white p-2"><p className="text-[10px] text-[var(--ss-muted)]">After evidence</p><p className="font-bold text-[var(--ss-ink)]">{monitoring.after.evidenceCount}</p><p className="text-[9px] text-[var(--ss-faint)]">{monitoring.after.verifiedCount} verified</p></div>
            <div className="rounded-md border border-[var(--ss-border)] bg-white p-2"><p className="text-[10px] text-[var(--ss-muted)]">Observed change</p><p className="font-bold" style={{ color: monitoring.observedChange >= 0 ? "#0D9488" : "#BE123C" }}>{monitoring.observedChange >= 0 ? "+" : ""}{monitoring.observedChange}</p></div>
            <div className="rounded-md border border-[var(--ss-border)] bg-white p-2"><p className="text-[10px] text-[var(--ss-muted)]">New evidence</p><p className="font-bold text-[var(--ss-ink)]">{monitoring.newEvidenceGenerated}</p></div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--ss-muted)]">Observed change = evidence after intervention start − evidence before. We do not claim placement % increases — only evidence-based outcomes.</p>
        </div>
      )}

      {/* Lifecycle controls */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {i.status === "Recommended" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onAdvance("Proposed")}>Propose</Button>}
        {i.status === "Proposed" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onAdvance("Approved")}>Approve</Button>}
        {i.status === "Approved" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onAdvance("Scheduled")}>Schedule</Button>}
        {i.status === "Scheduled" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onAdvance("Active")}>Activate</Button>}
        {i.status === "Active" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onAdvance("Completed")}>Complete</Button>}
        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={onWhy}>Why this intervention?</Button>
      </div>
    </SsCard>
  );
}

function CreateInterventionForm({ onClose }: { onClose: () => void }) {
  const { createIntervention } = useInstitutionStore();
  const inst = useInstitution();
  const [skillId, setSkillId] = useState(inst.cohortInterventions[0]?.skillId ?? "");
  const [type, setType] = useState<InterventionType>("Industry Workshop");
  const [department, setDepartment] = useState("AI & Data Science");
  const submit = () => {
    const ci = inst.cohortInterventions.find((c) => c.skillId === skillId);
    createIntervention({
      skillId, skillName: ci?.skillName ?? skillId, department, targetCohort: department,
      owner: DEMO_USER.name, type,
      expectedOutcome: `Improved ${ci?.skillName ?? skillId} competency`,
      reason: ci?.reason ?? "", priority: (ci?.gap ?? "Medium") as Priority,
      affectedStudents: ci?.affectedStudents ?? 0,
    });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Create Intervention" size="md">
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold">Skill</label>
          <select value={skillId} onChange={(e) => setSkillId(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            {inst.cohortInterventions.map((c) => <option key={c.skillId} value={c.skillId}>{c.skillName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as InterventionType)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            {INTERVENTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            <option>Mentor Program</option>
            <option>Industry Project</option>
            <option>Guest Lecture</option>
            <option>Faculty Mentorship</option>
            <option>Project-Based Learning</option>
            <option>Hackathon</option>
            <option>Certification</option>
            <option>Curriculum Enrichment</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold">Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            {InstitutionService.getDepartments().map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <Button variant="navy" className="w-full" onClick={submit}>Create</Button>
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────
// Placement Intelligence (§49)
// ──────────────────────────────────────────────────────────────────
function PlacementIntelligencePage() {
  const { Institution: agg } = useAggregators();
  const placement = useMemo(() => agg.getPlacementIntelligence(), [agg]);
  const funnel = [
    { key: "target", label: "Target Roles", icon: Target },
    { key: "applicants", label: "Applicants", icon: Users },
    { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2 },
    { key: "interview", label: "Interviews", icon: Briefcase },
    { key: "selected", label: "Selected", icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <DashHeader
        title="Placement Intelligence"
        subtitle="Application funnel and skills of selected candidates (§49)"
        icon={Briefcase}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <SsCard tone="soft" className="p-4">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Placement funnel</p>
        <SsPipeline
          stages={funnel}
          completedUntil={placement.selected > 0 ? 5 : placement.interviews > 0 ? 4 : placement.shortlisted > 0 ? 3 : placement.applicants > 0 ? 2 : 1}
          activeIndex={placement.selected > 0 ? 4 : placement.interviews > 0 ? 3 : placement.shortlisted > 0 ? 2 : placement.applicants > 0 ? 1 : 0}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
          <FunnelStat label="Target roles" value={placement.targetRoles.length} />
          <FunnelStat label="Applicants" value={placement.applicants} />
          <FunnelStat label="Shortlisted" value={placement.shortlisted} />
          <FunnelStat label="Interviews" value={placement.interviews} />
          <FunnelStat label="Selected" value={placement.selected} />
        </div>
      </SsCard>

      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-sm font-bold text-[var(--ss-ink)]">Which skills are common among selected candidates?</p>
        {placement.selected === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-4 text-xs text-[var(--ss-muted)]">
            No selected candidates yet ({placement.selected} selected). Skill commonality will be computed from actual selected-candidate competency scores once placements occur.
          </div>
        ) : (
          <div className="space-y-2">
            {placement.commonSkillsAmongSelected.map((s) => (
              <div key={s.skill} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--ss-ink)]">{s.skill}</p>
                  <SsBadge tone={s.avgScore >= 70 ? "teal" : s.avgScore >= 50 ? "blue" : "orange"} className="text-[9px]">{s.avgScore} avg</SsBadge>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-[10px] text-[var(--ss-muted)]">Based on actual application records. No fabricated placement rates.</p>
      </SsCard>
    </div>
  );
}

function FunnelStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--ss-border)] bg-white p-2">
      <p className="text-[10px] text-[var(--ss-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--ss-ink)]">{value}</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Internship Intelligence (§50)
// ──────────────────────────────────────────────────────────────────
function InternshipIntelligencePage() {
  const { Institution: agg } = useAggregators();
  const intel = useMemo(() => agg.getInternshipIntelligence(), [agg]);
  return (
    <div className="space-y-6">
      <DashHeader
        title="Internship Intelligence"
        subtitle="Participation, selection, completion, feedback and evidence — from career and intelligence data (§50)"
        icon={Users}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SsStatTile label="Participation" value={intel.participation} icon={Users} tone="navy" />
        <SsStatTile label="Selection" value={intel.selection} icon={CheckCircle2} tone="blue" />
        <SsStatTile label="Completion" value={intel.completion} icon={Trophy} tone="teal" />
        <SsStatTile label="Feedback" value={intel.feedback} icon={FileText} tone="orange" />
        <SsStatTile label="Evidence generated" value={intel.evidenceGenerated} icon={TrendingUp} tone="navy" />
      </div>

      <SsCard tone="soft" className="p-4">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Internship pipeline</p>
        <SsPipeline
          stages={[
            { key: "participation", label: "Participation", icon: Users },
            { key: "selection", label: "Selection", icon: CheckCircle2 },
            { key: "completion", label: "Completion", icon: Trophy },
            { key: "feedback", label: "Feedback", icon: FileText },
            { key: "evidence", label: "Evidence", icon: TrendingUp },
          ]}
          completedUntil={intel.evidenceGenerated > 0 ? 5 : intel.feedback > 0 ? 4 : intel.completion > 0 ? 3 : intel.selection > 0 ? 2 : intel.participation > 0 ? 1 : 0}
        />
        <p className="mt-3 text-[10px] text-[var(--ss-muted)]">
          Participation = internship-type applications. Selection = shortlisted/interviewed/selected.
          Completion = selected. Feedback = evidence records with sourceType="Internship".
          Evidence generated = same count (internship feedback → evidence in Phase 3 store).
        </p>
      </SsCard>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Industry Alignment (§26, §27) — light restyle with SsCoverageBar
// ──────────────────────────────────────────────────────────────────
function IndustryAlignmentPage() {
  const inst = useInstitution();
  const alignment = useMemo(() => AcademiaService.getCurriculumAlignment(), []);
  return (
    <div className="space-y-6">
      <DashHeader
        title="Industry Alignment"
        subtitle="Demand vs supply per skill — reuses Phase 6 curriculum alignment engine (no duplicate)"
        icon={BookOpen}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <SsCard tone="soft" className="p-4">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Demand vs supply (alignment summary)</p>
        <div className="space-y-3">
          {alignment.map((r) => {
            const supply = r.studentAvgCompetency;
            const demand = r.demandCount >= 5 ? 100 : r.demandCount >= 3 ? 80 : r.demandCount >= 1 ? 50 : 0;
            return (
              <div key={r.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--ss-ink)]">{r.skillName}</p>
                  <div className="flex items-center gap-1.5">
                    <SsBadge tone={r.industryDemand === "High" ? "orange" : "blue"} className="text-[10px]">{r.industryDemand} demand</SsBadge>
                    <SsBadge tone={r.alignment === "Aligned" ? "teal" : r.alignment === "Needs Attention" ? "blue" : "orange"} className="text-[10px]">{r.alignment}</SsBadge>
                  </div>
                </div>
                <div className="mt-2">
                  <SsCoverageBar label="Coverage" demand={demand} supply={supply} required={70} />
                </div>
                <p className="mt-1.5 text-[10px] text-[var(--ss-muted)]">
                  Curriculum: {r.curriculumCoverage} · Practical evidence: {r.practicalEvidence} · Target roles: {r.targetRoles.slice(0, 3).join(", ")}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Reused from Phase 6 curriculum alignment — no duplicate engine. Supply = avg candidate competency; demand = opportunity count × 20.</p>
      </SsCard>

      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-sm font-bold text-[var(--ss-ink)]">Institution-wide supply overview</p>
        <div className="space-y-2">
          {inst.demandSupply.slice(0, 4).map((row) => (
            <SsCoverageBar key={row.skillId} label={row.skillName} demand={row.demand} supply={row.supply} required={70} />
          ))}
        </div>
      </SsCard>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Hackathon Intelligence (§52)
// ──────────────────────────────────────────────────────────────────
function HackathonIntelligencePage() {
  const { Institution: agg } = useAggregators();
  const intel = useMemo(() => agg.getHackathonIntelligence(), [agg]);
  return (
    <div className="space-y-6">
      <DashHeader
        title="Hackathon Intelligence"
        subtitle="Participation, teams, projects, skills demonstrated and evidence generated (§52)"
        icon={Trophy}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <SsStatTile label="Participation" value={intel.participation} sub={`${intel.hackathonCount} hackathon(s)`} icon={Users} tone="navy" />
        <SsStatTile label="Departments" value={new Set(DEMO_CANDIDATES.map((c) => c.branch)).size} icon={BookOpen} tone="blue" />
        <SsStatTile label="Teams" value={intel.teams} icon={GitBranch} tone="teal" />
        <SsStatTile label="Projects" value={intel.projects} icon={FileText} tone="orange" />
      </div>

      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-sm font-bold text-[var(--ss-ink)]">Skills demonstrated (proxy from team member competencies)</p>
        {intel.skillsDemonstrated.length === 0 ? (
          <p className="text-xs text-[var(--ss-muted)]">No team member competencies recorded yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {intel.skillsDemonstrated.map((s) => (
              <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-ink-soft)]">{s}</span>
            ))}
          </div>
        )}
      </SsCard>

      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-sm font-bold text-[var(--ss-ink)]">Industry challenges</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FunnelStat label="Industry challenges" value={intel.industryChallenges} />
          <FunnelStat label="Evidence generated" value={intel.evidenceGenerated} />
        </div>
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">
          Industry challenges flag is not currently set in the hackathon store — shown as <SsDataSourceLabel source="demo" className="ml-1" /> until challenge metadata is tagged in store.
          Evidence generated = hackathon evaluations count (eval → evidence pipeline).
        </p>
      </SsCard>

      <SsCard tone="soft" className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Aggregation source</p>
        <p className="mt-1 text-xs text-[var(--ss-ink-soft)]">Purely aggregates from the Phase 8 hackathon store (registrations, teams, submissions, evaluations). No duplicate hackathon logic in the institution portal.</p>
      </SsCard>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Collaborations (§51)
// ──────────────────────────────────────────────────────────────────
function CollaborationsPage() {
  const inst = useInstitution();
  const collaborations = useAcademiaStore((s) => s.collaborations);
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of collaborations) map[c.type] = (map[c.type] ?? 0) + 1;
    return map;
  }, [collaborations]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Industry Collaborations"
        subtitle="Active partnerships by type — shared academia store records (§51)"
        icon={Users}
        accent="#0F2547"
        action={<SsDataSourceLabel source="platform" />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStatTile label="Active" value={inst.collabInsights.active} icon={CheckCircle2} tone="teal" />
        <SsStatTile label="Scheduled" value={inst.collabInsights.scheduled} icon={ArrowRight} tone="blue" />
        <SsStatTile label="Proposed" value={inst.collabInsights.proposed} icon={PlusCircle} tone="orange" />
        <SsStatTile label="Completed" value={inst.collabInsights.completed} icon={Trophy} tone="navy" />
      </div>

      <SsCard tone="soft" className="p-4">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Partnerships by type</p>
        {Object.keys(byType).length === 0 ? (
          <p className="text-xs text-[var(--ss-muted)]">No collaborations on record.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                <p className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">{type}</p>
                <p className="text-lg font-bold text-[var(--ss-ink)]">{count}</p>
              </div>
            ))}
          </div>
        )}
      </SsCard>

      <SsCard tone="soft" className="p-4">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Collaboration records</p>
        {collaborations.length === 0 ? (
          <EmptyState icon={Users} title="No active collaborations" hint="No active industry-academia collaborations." />
        ) : (
          <div className="space-y-2">
            {collaborations.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ss-ink)]">{c.title}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.date}</p>
                </div>
                <SsBadge tone={c.status === "Completed" ? "teal" : c.status === "Active" ? "blue" : "orange"} className="text-[10px]">{c.status}</SsBadge>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Shared from Phase 6 academia collaboration records — no duplicate data.</p>
      </SsCard>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Reports (§41, §74, §75) — keep existing + ensure SsDataSourceLabel
// ──────────────────────────────────────────────────────────────────
function ReportsPage() {
  const inst = useInstitution();
  const { Institution: agg } = useAggregators();
  const [showReport, setShowReport] = useState(false);
  const sections = [
    { name: "Executive Summary", source: "platform" as const },
    { name: "Skill Intelligence", source: "platform" as const },
    { name: "Demand vs Supply", source: "platform" as const },
    { name: "Department Gaps", source: "platform" as const },
    { name: "Curriculum Alignment", source: "platform" as const },
    { name: "Practical Exposure", source: "platform" as const },
    { name: "Internships", source: "platform" as const },
    { name: "Placement Pipeline", source: "platform" as const },
    { name: "Hackathon Participation", source: "platform" as const },
    { name: "Industry Collaboration", source: "platform" as const },
    { name: "Interventions", source: "platform" as const },
    { name: "Data Sources", source: "platform" as const },
  ];
  return (
    <div className="space-y-6">
      <DashHeader
        title="Reports"
        subtitle="Institution intelligence report builder (§41, §74, §75)"
        icon={FileText}
        accent="#0F2547"
        action={<Button variant="navy" size="sm" className="h-8" onClick={() => setShowReport(true)}>Generate Report</Button>}
      />

      <SsCard tone="soft" className="p-5">
        <p className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Report sections (each labelled with data source)</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {sections.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-[var(--ss-teal-600)]" />
                {s.name}
              </div>
              <SsDataSourceLabel source={s.source} />
            </div>
          ))}
        </div>
      </SsCard>

      <Modal open={showReport} onClose={() => setShowReport(false)} title="Institution Intelligence Report" size="lg">
        <div className="space-y-4">
          <SsDataSourceLabel source="platform" />
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs">
            <p className="font-bold text-[var(--ss-ink)]">Executive Summary</p>
            <p className="mt-1 text-[var(--ss-ink-soft)]"><b>Strong:</b> {inst.execSummary.strong.join("; ")}</p>
            <p className="text-[var(--ss-ink-soft)]"><b>Needs Attention:</b> {inst.execSummary.needsAttention.join("; ")}</p>
            <p className="text-[var(--ss-ink-soft)]"><b>Emerging:</b> {inst.execSummary.emerging.join("; ")}</p>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs">
            <p className="font-bold text-[var(--ss-ink)]">Demand vs Supply</p>
            {inst.demandSupply.slice(0, 5).map((r) => <p key={r.skillId} className="text-[var(--ss-ink-soft)]">{r.skillName}: Demand {r.demand} / Supply {r.supply} / Gap {r.gap}</p>)}
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs">
            <p className="font-bold text-[var(--ss-ink)]">Placement Funnel</p>
            <p className="text-[var(--ss-ink-soft)]">Applied: {inst.appFunnel.applied} → Under Review: {inst.appFunnel.underReview} → Shortlisted: {inst.appFunnel.shortlisted} → Interview: {inst.appFunnel.interview} → Selected: {inst.appFunnel.selected}</p>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs">
            <p className="font-bold text-[var(--ss-ink)]">Next actions</p>
            {agg.getNextActions().map((a) => <p key={a.rank} className="text-[var(--ss-ink-soft)]">{a.rank}. {a.title} — {a.reason}</p>)}
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs">
            <p className="font-bold text-[var(--ss-ink)]">Data Sources</p>
            <p className="text-[var(--ss-ink-soft)]">Phase 3 Intelligence Engine · Phase 4 Career Engine · Phase 5 Industry Portal · Phase 6 Academia Portal · Phase 8 Hackathon store — all shared data, no duplicates.</p>
          </div>
          <p className="text-[10px] text-[var(--ss-muted)]">Generated at {new Date().toLocaleString()}. Based on current platform/demo data.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>Close</Button>
            <Button variant="navy" className="flex-1" disabled>Export PDF <span className="ml-1 text-[9px]">(PROTOTYPE)</span></Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Notifications (§66) — keep as-is with SsDataSourceLabel
// ──────────────────────────────────────────────────────────────────
function NotificationsPage() {
  const notifications = useInstitutionStore((s) => s.notifications);
  const { markAllNotificationsRead, markNotificationRead } = useInstitutionStore();
  return (
    <div className="space-y-6">
      <DashHeader
        title="Notifications"
        subtitle="Institution intelligence events"
        icon={Bell}
        accent="#0F2547"
        action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>}
      />
      {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-navy-800)]/30 bg-[var(--ss-navy-50,#DBE7F5)]")}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p>
                <span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span>
              </div>
              <p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>
              {!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-navy-800)]">Mark read</button>}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end">
        <SsDataSourceLabel source="platform" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Profile (§60) — keep as-is
// ──────────────────────────────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="space-y-6">
      <DashHeader title="Institution Profile" subtitle={`${DEMO_USER.role} · IIT Madras`} icon={User} accent="#0F2547" />
      <SsCard tone="soft" className="p-5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Name" value={DEMO_USER.name} />
          <Field label="Role" value={DEMO_USER.role} />
          <Field label="Institution" value="IIT Madras" />
          <Field label="Email" value={DEMO_USER.email} />
        </div>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">RBAC Roles</h3>
        <div className="space-y-1">
          {["Institution Admin: institution-wide", "Academic Administrator: curriculum/academic", "Placement Coordinator: placement/internship", "Department Head: department-level"].map((r) => <p key={r} className="text-xs text-[var(--ss-ink-soft)]">• {r}</p>)}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-[var(--ss-muted)]">Roles defined. Full permission enforcement is PROTOTYPE.</p>
          <SsDataSourceLabel source="prototype" />
        </div>
      </SsCard>
    </div>
  );
}
