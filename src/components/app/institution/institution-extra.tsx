"use client";

import { useState } from "react";
import {
  Briefcase, Users, BookOpen, Trophy, Sparkles, FileText, Bell, User,
  PlusCircle, CheckCircle2, ArrowRight, TrendingUp, AlertTriangle,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useInstitution, InstitutionService, useInstitutionStore, DEMO_USER } from "@/lib/institution";
import { AcademiaService } from "@/lib/academia/academia-service";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InterventionType, Priority } from "@/lib/institution/institution-model";

export function InstitutionExtra({ section }: { section: string }) {
  if (section === "placements") return <PlacementInsights />;
  if (section === "internships") return <InternshipInsights />;
  if (section === "alignment") return <IndustryAlignment />;
  if (section === "hackathons") return <HackathonAnalytics />;
  if (section === "interventions") return <InterventionsPage />;
  if (section === "collaborations") return <CollaborationsPage />;
  if (section === "reports") return <ReportsPage />;
  if (section === "notifications") return <NotificationsPage />;
  if (section === "profile") return <ProfilePage />;
  return <PlacementInsights />;
}

// ─── Placement Insights (§30, §31) ─────────────────────────────
function PlacementInsights() {
  const inst = useInstitution();
  const funnel = inst.appFunnel;
  return (
    <div className="space-y-6">
      <DashHeader title="Placement Insights" subtitle="Application funnel from actual application states" icon={Briefcase} accent="#6D28D9" action={<DemoBadge />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SsStat label="Applied" value={funnel.applied} icon={FileText} tone="navy" />
        <SsStat label="Under Review" value={funnel.underReview} icon={Users} tone="blue" />
        <SsStat label="Shortlisted" value={funnel.shortlisted} icon={CheckCircle2} tone="teal" />
        <SsStat label="Interview" value={funnel.interview} icon={Briefcase} tone="orange" />
        <SsStat label="Selected" value={funnel.selected} icon={Trophy} tone="navy" />
      </div>
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Application Funnel</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[["Applied", funnel.applied], ["Under Review", funnel.underReview], ["Shortlisted", funnel.shortlisted], ["Interview", funnel.interview], ["Selected", funnel.selected]].map(([label, count], i, arr) => (
            <span key={label as string} className="flex items-center gap-2"><span className="rounded-full bg-[var(--ss-navy-50, #DBE7F5)] px-2.5 py-1 font-semibold text-[var(--ss-navy-800)]">{label}: {count as number}</span>{i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}</span>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-[var(--ss-muted)]">Based on actual application records. No fabricated placement rates.</p>
      </SsCard>
    </div>
  );
}

// ─── Internship Insights (§29) ─────────────────────────────────
function InternshipInsights() {
  const inst = useInstitution();
  const opps = inst.opportunities.filter((o) => o.type === "INTERNSHIP");
  const apps = inst.applications.filter((a) => opps.some((o) => o.id === a.opportunityId));
  return (
    <div className="space-y-6">
      <DashHeader title="Internship Insights" subtitle="Internship participation + evidence pipeline" icon={Users} accent="#6D28D9" action={<DemoBadge />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Internships" value={opps.length} icon={Briefcase} tone="navy" />
        <SsStat label="Applications" value={apps.length} icon={FileText} tone="blue" />
        <SsStat label="Evidence Items" value={inst.evidencePipeline.total} icon={CheckCircle2} tone="teal" />
        <SsStat label="Evaluated" value={inst.evidencePipeline.byStatus["Evaluated"] ?? 0} icon={TrendingUp} tone="orange" />
      </div>
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Evidence Pipeline</h2>
        <p className="text-xs text-[var(--ss-ink-soft)]">Latest evidence: {inst.evidencePipeline.latestSkill} — {inst.evidencePipeline.latestDate.slice(0, 10)}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">{Object.entries(inst.evidencePipeline.byStatus).map(([status, count]) => <div key={status} className="rounded-lg border border-[var(--ss-border)] p-2"><p className="text-[10px] text-[var(--ss-muted)]">{status}</p><p className="text-lg font-bold text-[var(--ss-ink)]">{count}</p></div>)}</div>
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Based on student evidence records. Not all participation generates evidence automatically.</p>
      </SsCard>
    </div>
  );
}

// ─── Industry Alignment (§26, §27) ──────────────────────────────
function IndustryAlignment() {
  const inst = useInstitution();
  const alignment = AcademiaService.getCurriculumAlignment();
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Alignment" subtitle="Industry demand vs curriculum coverage vs student evidence (reused from Phase 6)" icon={BookOpen} accent="#6D28D9" action={<DemoBadge />} />
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Alignment Summary</h2>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase tracking-wide text-[var(--ss-muted)]"><tr><th className="py-2 pr-3 text-left font-semibold">Skill</th><th className="py-2 pr-3 text-left font-semibold">Demand</th><th className="py-2 pr-3 text-left font-semibold">Coverage</th><th className="py-2 pr-3 text-left font-semibold">Practical</th><th className="py-2 text-left font-semibold">Alignment</th></tr></thead><tbody>
          {alignment.map((r) => <tr key={r.skillId} className="border-t border-[var(--ss-border)]"><td className="py-2 pr-3 font-medium text-[var(--ss-ink)]">{r.skillName}</td><td className="py-2 pr-3"><SsBadge tone={r.industryDemand === "High" ? "orange" : "blue"} className="text-[10px]">{r.industryDemand}</SsBadge></td><td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{r.curriculumCoverage}</td><td className="py-2 pr-3 text-[var(--ss-ink-soft)]">{r.practicalEvidence}</td><td className="py-2"><SsBadge tone={r.alignment === "Aligned" ? "teal" : r.alignment === "Needs Attention" ? "blue" : "orange"} className="text-[10px]">{r.alignment}</SsBadge></td></tr>)}
        </tbody></table></div>
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Reused from Phase 6 curriculum alignment — no duplicate engine.</p>
      </SsCard>
    </div>
  );
}

// ─── Hackathon Analytics (§32, §33, §34) ───────────────────────
function HackathonAnalytics() {
  return (
    <div className="space-y-6">
      <DashHeader title="Hackathon Analytics" subtitle="Foundation — full hackathon engine in a later phase" icon={Trophy} accent="#6D28D9" action={<DemoBadge>PROTOTYPE</DemoBadge>} />
      <SsCard tone="soft" className="p-5">
        <div className="space-y-3">
          <p className="text-sm text-[var(--ss-ink-soft)]">Institution-facing hackathon analytics foundation. The complete hackathon execution system (participation, team matching, submission evaluation) will arrive in the dedicated Hackathon phase.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[var(--ss-border)] p-3"><p className="text-[10px] text-[var(--ss-muted)]">Participants</p><p className="text-lg font-bold text-[var(--ss-ink)]">—</p></div>
            <div className="rounded-lg border border-[var(--ss-border)] p-3"><p className="text-[10px] text-[var(--ss-muted)]">Teams</p><p className="text-lg font-bold text-[var(--ss-ink)]">—</p></div>
            <div className="rounded-lg border border-[var(--ss-border)] p-3"><p className="text-[10px] text-[var(--ss-muted)]">Projects</p><p className="text-lg font-bold text-[var(--ss-ink)]">—</p></div>
            <div className="rounded-lg border border-[var(--ss-border)] p-3"><p className="text-[10px] text-[var(--ss-muted)]">Skills Demonstrated</p><p className="text-lg font-bold text-[var(--ss-ink)]">—</p></div>
          </div>
          <p className="text-[10px] text-[var(--ss-muted)]">No fabricated hackathon data. Values will appear when the hackathon system is implemented and records exist.</p>
        </div>
      </SsCard>
    </div>
  );
}

// ─── Interventions (§20, §21, §22, §23, §24) ──────────────────
function InterventionsPage() {
  const inst = useInstitution();
  const { createIntervention, updateInterventionStatus } = useInstitutionStore();
  const [showCreate, setShowCreate] = useState(false);
  const [whyInt, setWhyInt] = useState<typeof inst.cohortInterventions[0] | null>(null);
  const [tab, setTab] = useState("recommended");

  const userInterventions = inst.interventions;
  const recommended = inst.cohortInterventions;

  return (
    <div className="space-y-6">
      <DashHeader title="Interventions" subtitle="Recommended + active + lifecycle" icon={Sparkles} accent="#6D28D9" action={<Button variant="navy" size="sm" className="h-8 gap-1.5" onClick={() => setShowCreate(true)}><PlusCircle className="h-3.5 w-3.5" /> Create</Button>} />
      <div className="flex gap-1.5">{["recommended", "active", "completed"].map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", tab === t ? "bg-[var(--ss-navy-900)] text-white" : "bg-[var(--ss-surface-3)]")}>{t}</button>)}</div>

      {tab === "recommended" && (
        recommended.length === 0 ? <EmptyState icon={Sparkles} title="No recommendations" hint="No intervention recommendations at this time." /> : (
          <div className="space-y-2.5">{recommended.map((r) => (
            <SsCard key={r.skillId} tone="lift" className="p-4">
              <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{r.suggestedAction}</p><p className="text-[10px] text-[var(--ss-muted)]">{r.skillName} · {r.gap} priority · {r.affectedStudents} students</p></div><SsBadge tone={r.gap === "Critical" ? "orange" : r.gap === "High" ? "blue" : "teal"} className="text-[10px]">{r.gap}</SsBadge></div>
              <p className="mt-2 text-[11px] text-[var(--ss-ink-soft)]">{r.reason}</p>
              <div className="mt-3 flex gap-1.5"><Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setWhyInt(r)}>Why?</Button><Button variant="navy" size="sm" className="h-7 text-[11px]" onClick={() => createIntervention({ skillId: r.skillId, skillName: r.skillName, department: "AI & Data Science", targetCohort: "AI & DS cohort", owner: DEMO_USER.name, type: r.suggestedAction, expectedOutcome: `Improved ${r.skillName} competency + practical evidence`, reason: r.reason, priority: r.gap as Priority, affectedStudents: r.affectedStudents })}>Create Intervention</Button></div>
            </SsCard>
          ))}</div>
        )
      )}

      {tab === "active" && (userInterventions.filter((i) => i.status === "Active" || i.status === "Scheduled" || i.status === "Proposed" || i.status === "Approved" || i.status === "Recommended").length === 0 ? <EmptyState icon={Sparkles} title="No active interventions" hint="Create interventions from the Recommended tab." /> : (
        <div className="space-y-2.5">{userInterventions.filter((i) => i.status !== "Completed" && i.status !== "Evaluated").map((i) => (
          <SsCard key={i.id} tone="soft" className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{i.type} — {i.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{i.department} · {i.priority} · {i.affectedStudents} students</p></div><SsBadge tone={i.status === "Active" ? "teal" : "blue"} className="text-[10px]">{i.status}</SsBadge></div><div className="mt-2 flex gap-1.5">{i.status === "Recommended" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateInterventionStatus(i.id, "Proposed")}>Propose</Button>}{i.status === "Proposed" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateInterventionStatus(i.id, "Approved")}>Approve</Button>}{i.status === "Approved" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateInterventionStatus(i.id, "Scheduled")}>Schedule</Button>}{i.status === "Scheduled" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateInterventionStatus(i.id, "Active")}>Activate</Button>}{i.status === "Active" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateInterventionStatus(i.id, "Completed")}>Complete</Button>}</div></SsCard>
        ))}</div>
      ))}

      {tab === "completed" && (userInterventions.filter((i) => i.status === "Completed" || i.status === "Evaluated").length === 0 ? <EmptyState icon={CheckCircle2} title="No completed interventions" /> : (
        <div className="space-y-2.5">{userInterventions.filter((i) => i.status === "Completed" || i.status === "Evaluated").map((i) => <SsCard key={i.id} tone="soft" className="p-4"><p className="text-sm font-semibold text-[var(--ss-ink)]">{i.type} — {i.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{i.status} · {i.expectedOutcome}</p></SsCard>)}</div>
      ))}

      <Modal open={!!whyInt} onClose={() => setWhyInt(null)} title={`Why ${whyInt?.suggestedAction}?`} size="sm">
        {whyInt && <div className="space-y-2"><DemoBadge /><p className="text-sm text-[var(--ss-ink-soft)]">{whyInt.reason}</p><Field label="Affected Students" value={String(whyInt.affectedStudents)} /><Field label="Avg Competency" value={String(whyInt.avgCompetency)} /><p className="text-[10px] text-[var(--ss-muted)]">Recommended for institutional consideration. Not a guarantee of improvement.</p></div>}
      </Modal>

      {showCreate && <CreateInterventionForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateInterventionForm({ onClose }: { onClose: () => void }) {
  const { createIntervention } = useInstitutionStore();
  const inst = useInstitution();
  const [skillId, setSkillId] = useState(inst.cohortInterventions[0]?.skillId ?? "");
  const [type, setType] = useState<InterventionType>("Industry Workshop");
  const [department, setDepartment] = useState("AI & Data Science");
  const submit = () => { const ci = inst.cohortInterventions.find((c) => c.skillId === skillId); createIntervention({ skillId, skillName: ci?.skillName ?? skillId, department, targetCohort: department, owner: DEMO_USER.name, type, expectedOutcome: `Improved ${ci?.skillName ?? skillId} competency`, reason: ci?.reason ?? "", priority: (ci?.gap ?? "Medium") as Priority, affectedStudents: ci?.affectedStudents ?? 0 }); onClose(); };
  return (
    <Modal open onClose={onClose} title="Create Intervention" size="md">
      <div className="space-y-3">
        <div><label className="text-[11px] font-semibold">Skill</label><select value={skillId} onChange={(e) => setSkillId(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{inst.cohortInterventions.map((c) => <option key={c.skillId} value={c.skillId}>{c.skillName}</option>)}</select></div>
        <div><label className="text-[11px] font-semibold">Type</label><select value={type} onChange={(e) => setType(e.target.value as InterventionType)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>Industry Workshop</option><option>Bootcamp</option><option>Faculty Mentorship</option><option>Project-Based Learning</option><option>Hackathon</option><option>Certification</option><option>Industry Project</option><option>Guest Lecture</option><option>Curriculum Enrichment</option><option>Mentor Program</option></select></div>
        <div><label className="text-[11px] font-semibold">Department</label><select value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{InstitutionService.getDepartments().map((d) => <option key={d}>{d}</option>)}</select></div>
        <Button variant="navy" className="w-full" onClick={submit}>Create</Button>
      </div>
    </Modal>
  );
}

// ─── Collaborations (§28) ──────────────────────────────────────
function CollaborationsPage() {
  const inst = useInstitution();
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Collaborations" subtitle="Active, upcoming, completed (from Academia store)" icon={Users} accent="#6D28D9" action={<DemoBadge />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SsStat label="Active" value={inst.collabInsights.active} icon={CheckCircle2} tone="teal" />
        <SsStat label="Scheduled" value={inst.collabInsights.scheduled} icon={ArrowRight} tone="blue" />
        <SsStat label="Proposed" value={inst.collabInsights.proposed} icon={PlusCircle} tone="orange" />
        <SsStat label="Completed" value={inst.collabInsights.completed} icon={Trophy} tone="navy" />
      </div>
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Collaboration Records</h2>
        {inst.collaborations.length === 0 ? <EmptyState icon={Users} title="No active collaborations" hint="No active industry-academia collaborations." /> : (
          <div className="space-y-2">{inst.collaborations.map((c) => <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-3"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{c.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.date}</p></div><SsBadge tone={c.status === "Completed" ? "teal" : c.status === "Active" ? "blue" : "orange"} className="text-[10px]">{c.status}</SsBadge></div>)}</div>
        )}
        <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Reused from Phase 6 Academia collaboration records — no duplicate data.</p>
      </SsCard>
    </div>
  );
}

// ─── Reports (§41, §74, §75) ──────────────────────────────────
function ReportsPage() {
  const inst = useInstitution();
  const [showReport, setShowReport] = useState(false);
  const sections = ["Executive Summary", "Skill Intelligence", "Demand vs Supply", "Department Gaps", "Curriculum Alignment", "Practical Exposure", "Internships", "Placement Pipeline", "Hackathon Participation", "Industry Collaboration", "Interventions", "Data Sources"];
  return (
    <div className="space-y-6">
      <DashHeader title="Reports" subtitle="Institution intelligence report builder" icon={FileText} accent="#6D28D9" action={<Button variant="navy" size="sm" className="h-8" onClick={() => setShowReport(true)}>Generate Report</Button>} />
      <SsCard tone="soft" className="p-5"><h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Report Sections</h2><div className="grid gap-2 sm:grid-cols-2">{sections.map((s) => <div key={s} className="flex items-center gap-2 rounded-lg border border-[var(--ss-border)] p-2.5 text-xs"><CheckCircle2 className="h-3 w-3 text-[var(--ss-teal-600)]" />{s}</div>)}</div></SsCard>
      <Modal open={showReport} onClose={() => setShowReport(false)} title="Institution Intelligence Report" size="lg">
        <div className="space-y-4">
          <DemoBadge />
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs"><p className="font-bold text-[var(--ss-ink)]">Executive Summary</p><p className="mt-1 text-[var(--ss-ink-soft)]"><b>Strong:</b> {inst.execSummary.strong.join("; ")}</p><p className="text-[var(--ss-ink-soft)]"><b>Needs Attention:</b> {inst.execSummary.needsAttention.join("; ")}</p><p className="text-[var(--ss-ink-soft)]"><b>Emerging:</b> {inst.execSummary.emerging.join("; ")}</p></div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs"><p className="font-bold text-[var(--ss-ink)]">Demand vs Supply</p>{inst.demandSupply.slice(0, 5).map((r) => <p key={r.skillId} className="text-[var(--ss-ink-soft)]">{r.skillName}: Demand {r.demand} / Supply {r.supply} / Gap {r.gap}</p>)}</div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs"><p className="font-bold text-[var(--ss-ink)]">Placement Funnel</p><p className="text-[var(--ss-ink-soft)]">Applied: {inst.appFunnel.applied} → Under Review: {inst.appFunnel.underReview} → Shortlisted: {inst.appFunnel.shortlisted} → Interview: {inst.appFunnel.interview} → Selected: {inst.appFunnel.selected}</p></div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-xs"><p className="font-bold text-[var(--ss-ink)]">Data Sources</p><p className="text-[var(--ss-ink-soft)]">Phase 3 Intelligence Engine · Phase 4 Career Engine · Phase 5 Industry Portal · Phase 6 Academia Portal · All shared data — no duplicates.</p></div>
          <p className="text-[10px] text-[var(--ss-muted)]">Generated at {new Date().toLocaleString()}. Based on current platform/demo data.</p>
          <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>Close</Button><Button variant="navy" className="flex-1" disabled>Export PDF <span className="ml-1 text-[9px]">(PROTOTYPE)</span></Button></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Notifications (§66) ───────────────────────────────────────
function NotificationsPage() {
  const notifications = useInstitutionStore((s) => s.notifications);
  const { markAllNotificationsRead, markNotificationRead } = useInstitutionStore();
  return (
    <div className="space-y-6">
      <DashHeader title="Notifications" subtitle="Institution intelligence events" icon={Bell} accent="#6D28D9" action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>} />
      {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">{notifications.map((n) => <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-navy-800)]/30 bg-[var(--ss-navy-50, #DBE7F5)]")}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p><span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span></div><p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>{!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-navy-800)]">Mark read</button>}</div>)}</div>
      )}
    </div>
  );
}

// ─── Profile (§60) ─────────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="space-y-6">
      <DashHeader title="Institution Profile" subtitle={`${DEMO_USER.role} · IIT Madras`} icon={User} accent="#6D28D9" />
      <SsCard tone="soft" className="p-5"><div className="grid grid-cols-2 gap-2 text-xs"><Field label="Name" value={DEMO_USER.name} /><Field label="Role" value={DEMO_USER.role} /><Field label="Institution" value="IIT Madras" /><Field label="Email" value={DEMO_USER.email} /></div></SsCard>
      <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">RBAC Roles</h3><div className="space-y-1">{["Institution Admin: institution-wide", "Academic Administrator: curriculum/academic", "Placement Coordinator: placement/internship", "Department Head: department-level"].map((r) => <p key={r} className="text-xs text-[var(--ss-ink-soft)]">• {r}</p>)}</div><p className="mt-2 text-[10px] text-[var(--ss-muted)]">Roles defined. Full permission enforcement is PROTOTYPE.</p></SsCard>
    </div>
  );
}
