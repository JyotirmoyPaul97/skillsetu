"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Target, PlusCircle, Briefcase, Users, Building2, MapPin,
  Clock, Award, TrendingUp, AlertTriangle, Sparkles, CheckCircle2, ChevronRight,
  ArrowRight, FileText, Bookmark, X, Search,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useIndustry, IndustryService, useIndustryStore } from "@/lib/industry";
import { useCareerStore } from "@/lib/career";
import { DEMO_COMPANY, DEMO_INDUSTRY_USER } from "@/lib/industry/candidates";
import { calculateOpportunityMatch, checkOpportunityEligibility } from "@/lib/career/matching";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES, skillName } from "@/lib/intelligence/demo-data";
import { SKILL_IDS } from "@/lib/intelligence/role-config";
import type { Candidate, DemandConfig, DemandSkill } from "@/lib/industry/industry-model";
import type { Opportunity, MatchResult, ApplicationStatus } from "@/lib/career/opportunity-model";
import type { SkillImportance } from "@/lib/industry/industry-model";
import {
  DashHeader, Modal, Drawer, DemoBadge, CalcBadge, MatchBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IndustryCore({ section }: { section: string }) {
  if (section === "dashboard") return <IndustryDashboard />;
  if (section === "demand") return <DemandIntelligence />;
  if (section === "post") return <PostOpportunity />;
  if (section === "management") return <OpportunityManagement />;
  if (section === "talent") return <TalentDiscovery />;
  return <IndustryDashboard />;
}

// ─── Industry Dashboard (§4, §5) ───────────────────────────────
function IndustryDashboard() {
  const { navigate } = useRouter();
  const ind = useIndustry();
  const opps = ind.opportunities.filter((o) => o.status === "Published");
  const apps = ind.applications;
  const shortlisted = ind.shortlistedIds.length;
  const pendingEval = ind.feedback.filter((f) => f.status === "Submitted").length;
  const talentMatches = ind.candidates.reduce((sum, c) => {
    const best = Object.values(ind.candidateMatches[c.studentId] ?? {}).sort((a, b) => b.matchScore - a.matchScore)[0];
    return sum + (best && best.matchScore >= 60 ? 1 : 0);
  }, 0);
  return (
    <div className="space-y-6">
      <DashHeader title={`Good morning, ${DEMO_INDUSTRY_USER.name.split(" ")[0]}`} subtitle={`${DEMO_COMPANY.companyName} · ${DEMO_INDUSTRY_USER.role}`} icon={LayoutDashboard} accent="#EA580C" action={<DemoBadge />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SsStat label="Active Opps" value={opps.length} icon={Briefcase} tone="orange" />
        <SsStat label="Applicants" value={apps.length} icon={Users} tone="blue" />
        <SsStat label="Shortlisted" value={shortlisted} icon={Bookmark} tone="navy" />
        <SsStat label="Challenges" value={ind.challenges.length} icon={Award} tone="teal" />
        <SsStat label="Pending Eval" value={pendingEval} icon={AlertTriangle} tone="orange" />
        <SsStat label="Talent Matches" value={talentMatches} icon={Sparkles} tone="blue" />
      </div>
      {/* Core message (§79) */}
      <SsCard tone="soft" className="p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold text-[var(--ss-ink)]">Industry Intelligence:</span>
          {["Define Demand", "Discover Evidence", "Match Talent", "Create Opportunity", "Evaluate", "Give Feedback"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="text-[var(--ss-orange-600)]">{s}</span>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}
            </span>
          ))}
        </div>
      </SsCard>
      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Target} label="Define Demand" desc="Set role requirements" onClick={() => navigate("/industry/demand")} />
        <QuickAction icon={PlusCircle} label="Post Opportunity" desc="Create job/internship/project" onClick={() => navigate("/industry/post")} />
        <QuickAction icon={Users} label="Discover Talent" desc="Search evidence-backed candidates" onClick={() => navigate("/industry/talent")} />
        <QuickAction icon={Briefcase} label="Manage Opportunities" desc="Review applicants" onClick={() => navigate("/industry/management")} />
      </div>
      {/* Recent applicants */}
      <SsCard tone="soft" className="p-5">
        <h2 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Recent Applicants</h2>
        {apps.length === 0 ? <p className="text-sm text-[var(--ss-muted)]">No applications yet.</p> : (
          <div className="space-y-2">{apps.slice(0, 5).map((a) => {
            const c = ind.candidates.find((c) => c.studentId === a.studentId);
            const o = ind.opportunities.find((o) => o.id === a.opportunityId);
            return <div key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] p-2.5"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{c?.name ?? a.studentId}</p><p className="text-[10px] text-[var(--ss-muted)]">{o?.title} · {a.appliedAt.slice(0, 10)}</p></div><SsBadge tone="blue" className="text-[10px]">{a.status.replace("_", " ")}</SsBadge></div>;
          })}</div>
        )}
      </SsCard>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-3 rounded-xl border border-[var(--ss-border)] bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]"><Icon className="h-5 w-5" /></span><div><p className="text-sm font-bold text-[var(--ss-ink)]">{label}</p><p className="text-[10px] text-[var(--ss-muted)]">{desc}</p></div></button>;
}

// ─── Demand Intelligence (§6, §7, §8, §9) ───────────────────────
function DemandIntelligence() {
  const { demandConfigs, createDemand, updateDemand } = useIndustryStore();
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <DashHeader title="Demand Intelligence" subtitle="Define role requirements using centralized skills" icon={Target} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Define Role Demand</Button>} />
      {demandConfigs.length === 0 ? <EmptyState icon={Target} title="No demand configs" hint="Create a role demand to define required skills." /> : (
        <div className="grid gap-3 sm:grid-cols-2">{demandConfigs.map((d) => <DemandCard key={d.id} config={d} />)}</div>
      )}
      {showForm && <DemandForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function DemandCard({ config }: { config: DemandConfig }) {
  return (
    <SsCard tone="soft" className="p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[var(--ss-ink)]">{config.roleName}</h3><SsBadge tone="orange" className="text-[10px]">{config.opportunityType}</SsBadge></div>
      <div className="mt-3 space-y-1.5">{config.skills.map((s) => (
        <div key={s.skillId} className="flex items-center justify-between text-xs">
          <span className="text-[var(--ss-ink-soft)]">{s.skillName}</span>
          <span className="flex items-center gap-1.5"><SsBadge tone={s.importance === "Critical" || s.importance === "High" ? "orange" : "blue"} className="text-[9px]">{s.importance}</SsBadge><span className="text-[var(--ss-muted)]">≥ {s.requiredLevel}</span></span>
        </div>
      ))}</div>
    </SsCard>
  );
}

function DemandForm({ onClose }: { onClose: () => void }) {
  const { createDemand } = useIndustryStore();
  const [roleId, setRoleId] = useState("data-scientist");
  const [skills, setSkills] = useState<DemandSkill[]>([]);
  const [oppType, setOppType] = useState("INTERNSHIP" as any);
  const role = ALL_ROLES.find((r) => r.roleId === roleId)!;

  const addSkill = (skillId: string) => {
    if (skills.some((s) => s.skillId === skillId)) return;
    setSkills([...skills, { skillId, skillName: SKILL_NAMES[skillId] ?? skillId, importance: "High", requiredLevel: 70 }]);
  };
  const updateSkill = (i: number, updates: Partial<DemandSkill>) => setSkills(skills.map((s, j) => j === i ? { ...s, ...updates } : s));

  const submit = () => {
    createDemand({ roleId, roleName: role.roleName, skills, opportunityType: oppType, eligibility: { yearMin: 2 } });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Define Role Demand" subtitle="Skills use centralized SKILL SETU records" size="lg">
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">Role</label><select value={roleId} onChange={(e) => { setRoleId(e.target.value); setSkills([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select></div>
        <div><label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">Opportunity Type</label><select value={oppType} onChange={(e) => setOppType(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option value="JOB">Job</option><option value="INTERNSHIP">Internship</option><option value="PROJECT">Project</option><option value="APPRENTICESHIP">Apprenticeship</option></select></div>
        <div><label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">Required Skills (from centralized skill records)</label><div className="mt-2 flex flex-wrap gap-1.5">{role.skills.map((s) => <button key={s.skillId} onClick={() => addSkill(s.skillId)} className="rounded-full border border-[var(--ss-border)] px-2.5 py-0.5 text-[11px] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]">+ {s.skillName}</button>)}</div></div>
        {skills.length > 0 && <div className="space-y-2">{skills.map((s, i) => (
          <div key={s.skillId} className="flex items-center gap-2 rounded-lg bg-[var(--ss-surface-2)] p-2.5">
            <span className="flex-1 text-sm font-medium text-[var(--ss-ink)]">{s.skillName}</span>
            <select value={s.importance} onChange={(e) => updateSkill(i, { importance: e.target.value as SkillImportance })} className="h-8 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
            <input type="number" min={0} max={100} value={s.requiredLevel} onChange={(e) => updateSkill(i, { requiredLevel: Number(e.target.value) })} className="h-8 w-14 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs" />
            <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="rounded-md p-1 text-[var(--ss-faint)]"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}</div>}
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button variant="orange" className="flex-1" onClick={submit} disabled={skills.length === 0}>Save Demand Config</Button></div>
      </div>
    </Modal>
  );
}

// ─── Post Opportunity (§10, §11, §12) ───────────────────────────
function PostOpportunity() {
  const { navigate } = useRouter();
  const { addOpportunity } = useCareerStore();
  const [form, setForm] = useState({ title: "", type: "INTERNSHIP" as any, company: DEMO_COMPANY.companyName, location: DEMO_COMPANY.location, mode: "Hybrid", description: "", duration: "", compensationType: "Stipend", compensationAmount: "", deadline: "2026-12-31", roleId: "data-scientist" });
  const [reqSkills, setReqSkills] = useState<string[]>([]);
  const role = ALL_ROLES.find((r) => r.roleId === form.roleId)!;

  const submit = () => {
    const now = new Date().toISOString();
    addOpportunity({
      id: "opp-" + Math.random().toString(36).slice(2, 9),
      title: form.title || "Untitled Opportunity",
      company: form.company, organizationType: "Industry", description: form.description,
      type: form.type, location: form.location, mode: form.mode as any, duration: form.duration,
      compensationType: form.compensationType as any, compensationAmount: form.compensationAmount,
      applicationDeadline: form.deadline, requiredSkills: reqSkills.map((sid) => ({ skillId: sid, skillName: SKILL_NAMES[sid] ?? sid, importance: 1, requiredLevel: 60 })),
      targetRoles: [form.roleId], eligibilityRules: { yearMin: 2 }, responsibilities: [], qualifications: [],
      benefits: [], status: "Published", createdAt: now, updatedAt: now,
    });
    navigate("/industry/management");
  };

  return (
    <div className="space-y-6">
      <DashHeader title="Post Opportunity" subtitle="Uses the Phase 4 Opportunity model — shared with Student Portal" icon={PlusCircle} accent="#EA580C" />
      <SsCard tone="soft" className="p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field2 label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option value="JOB">Job</option><option value="INTERNSHIP">Internship</option><option value="PROJECT">Project</option><option value="APPRENTICESHIP">Apprenticeship</option></select></div>
          <Field2 label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <Field2 label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Mode</label><select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></div>
          <Field2 label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <Field2 label="Compensation" value={form.compensationAmount} onChange={(v) => setForm({ ...form, compensationAmount: v })} />
          <Field2 label="Deadline (YYYY-MM-DD)" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Target Role</label><select value={form.roleId} onChange={(e) => { setForm({ ...form, roleId: e.target.value }); setReqSkills([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select></div>
        </div>
        <div className="space-y-1"><label className="text-[11px] font-semibold">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" /></div>
        <div><label className="text-[11px] font-semibold">Required Skills (centralized)</label><div className="mt-2 flex flex-wrap gap-1.5">{role.skills.map((s) => <button key={s.skillId} onClick={() => setReqSkills(reqSkills.includes(s.skillId) ? reqSkills.filter((x) => x !== s.skillId) : [...reqSkills, s.skillId])} className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", reqSkills.includes(s.skillId) ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>{s.skillName}</button>)}</div></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => navigate("/industry/management")}>Cancel</Button><Button variant="orange" onClick={submit} disabled={!form.title}>Publish Opportunity</Button></div>
      </SsCard>
    </div>
  );
}

function Field2({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div className="space-y-1"><label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>;
}

// ─── Opportunity Management (§13, §14) ──────────────────────────
function OpportunityManagement() {
  const ind = useIndustry();
  const [tab, setTab] = useState("active");
  const opps = ind.opportunities.filter((o) => tab === "active" ? o.status === "Published" : tab === "drafts" ? o.status === "Draft" : o.status === "Closed");
  const [manageOpp, setManageOpp] = useState<Opportunity | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Opportunity Management" subtitle="Manage your opportunities & applicants" icon={Briefcase} accent="#EA580C" />
      <div className="flex gap-1.5">{["active", "drafts", "closed"].map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", tab === t ? "bg-[var(--ss-orange-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)]")}>{t}</button>)}</div>
      {opps.length === 0 ? <EmptyState icon={Briefcase} title="No opportunities" hint="Create an opportunity to start building your talent pipeline." /> : (
        <div className="space-y-2.5">{opps.map((o) => {
          const apps = ind.applications.filter((a) => a.opportunityId === o.id);
          return <SsCard key={o.id} tone="soft" className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{o.company} · {o.type} · Deadline: {o.applicationDeadline}</p></div><div className="flex items-center gap-2"><SsBadge tone="blue" className="text-[10px]">{apps.length} applicants</SsBadge><Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setManageOpp(o)}>Manage Applicants</Button></div></div></SsCard>;
        })}</div>
      )}
      <ManageApplicants opp={manageOpp} open={!!manageOpp} onClose={() => setManageOpp(null)} />
    </div>
  );
}

function ManageApplicants({ opp, open, onClose }: { opp: Opportunity | null; open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  const ind = useIndustry();
  const { updateApplicationStatus } = useCareerStore();
  if (!opp) return null;
  const apps = ind.applications.filter((a) => a.opportunityId === opp.id);
  return (
    <Drawer open={open} onClose={onClose} title={`Applicants — ${opp.title}`} subtitle={`${apps.length} applications`}>
      <div className="space-y-3">
        {apps.length === 0 ? <p className="text-sm text-[var(--ss-muted)]">No applications yet.</p> : apps.map((a) => {
          const c = ind.candidates.find((c) => c.studentId === a.studentId);
          const match = ind.candidateMatches[a.studentId]?.[opp.id];
          return (
            <div key={a.id} className="rounded-lg border border-[var(--ss-border)] p-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-[var(--ss-ink)]">{c?.name ?? a.studentId}</p><p className="text-[10px] text-[var(--ss-muted)]">{c?.targetRole} · Readiness {c?.roleReadiness}%</p></div>
                {match && <MatchBadge score={match.matchScore} />}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <select value={a.status} onChange={(e) => updateApplicationStatus(a.id, e.target.value as ApplicationStatus)} className="h-8 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs">
                  <option value="APPLIED">Applied</option><option value="UNDER_REVIEW">Under Review</option><option value="SHORTLISTED">Shortlisted</option><option value="INTERVIEW">Interview</option><option value="SELECTED">Selected</option><option value="REJECTED">Rejected</option>
                </select>
                <button onClick={() => navigate(`/industry/talent`)} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View Candidate</button>
              </div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}

// ─── Talent Discovery (§15, §16, §17, §18, §19, §20, §21) ───────
function TalentDiscovery() {
  const ind = useIndustry();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [whyMatch, setWhyMatch] = useState<{ candidate: Candidate; match: MatchResult } | null>(null);

  const filtered = ind.candidates.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.targetRole.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && c.roleId !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DashHeader title="Talent Discovery" subtitle="Evidence-backed candidates — same data as Student Portal" icon={Users} accent="#EA580C" action={<DemoBadge />} />
      <SsCard tone="flat" className="flex flex-wrap items-center gap-2 p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white px-3 py-1.5"><Search className="h-4 w-4 text-[var(--ss-faint)]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, role…" className="flex-1 bg-transparent text-sm outline-none" /></div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 rounded-lg border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option value="">All roles</option>{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select>
      </SsCard>
      {filtered.length === 0 ? <EmptyState icon={Users} title="No candidates match these filters" /> : (
        <div className="grid gap-3 md:grid-cols-2">{filtered.map((c) => {
          const bestOpp = ind.publishedOpps.map((o) => ({ o, m: ind.candidateMatches[c.studentId]?.[o.id] })).sort((a, b) => (b.m?.matchScore ?? 0) - (a.m?.matchScore ?? 0))[0];
          return <CandidateCard key={c.studentId} candidate={c} match={bestOpp?.m} onView={() => setSelected(c)} onWhy={() => bestOpp && setWhyMatch({ candidate: c, match: bestOpp.m })} />;
        })}</div>
      )}
      <CandidateProfileDrawer candidate={selected} open={!!selected} onClose={() => setSelected(null)} onWhy={(c, m) => { setSelected(null); setWhyMatch({ candidate: c, match: m }); }} />
      <WhyMatchModal data={whyMatch} open={!!whyMatch} onClose={() => setWhyMatch(null)} />
    </div>
  );
}

function CandidateCard({ candidate: c, match, onView, onWhy }: { candidate: Candidate; match?: MatchResult; onView: () => void; onWhy: () => void }) {
  const topSkills = Object.values(c.competencies).sort((a, b) => b.competencyScore - a.competencyScore).slice(0, 3);
  return (
    <SsCard tone="lift" className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: c.avatarColor }}>{c.name.slice(0, 1)}</span>
          <div><p className="text-sm font-bold text-[var(--ss-ink)]">{c.name}</p><p className="text-[10px] text-[var(--ss-muted)]">{c.branch} · Y{c.year} · {c.college}</p></div>
        </div>
        {match && <MatchBadge score={match.matchScore} />}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--ss-muted)]"><span>Target: <b className="text-[var(--ss-ink-soft)]">{c.targetRole}</b></span><span>Readiness: <b className="text-[var(--ss-ink-soft)]">{c.roleReadiness}%</b></span><span>Evidence: <b className="text-[var(--ss-ink-soft)]">{c.evidence.length}</b></span></div>
      <div className="mt-2 flex flex-wrap gap-1">{topSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]">{s.skillName} {s.competencyScore}</span>)}</div>
      <div className="mt-3 flex gap-1.5"><Button variant="outline" size="sm" className="h-8 flex-1 text-[11px]" onClick={onView}>View Candidate</Button>{match && <button onClick={onWhy} className="text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Why?</button>}</div>
    </SsCard>
  );
}

function CandidateProfileDrawer({ candidate: c, open, onClose, onWhy }: { candidate: Candidate | null; open: boolean; onClose: () => void; onWhy: (c: Candidate, m: MatchResult) => void }) {
  const ind = useIndustry();
  const { shortlist, invite } = useIndustryStore();
  if (!c) return null;
  const bestOpp = ind.publishedOpps.map((o) => ({ o, m: ind.candidateMatches[c.studentId]?.[o.id] })).sort((a, b) => (b.m?.matchScore ?? 0) - (a.m?.matchScore ?? 0))[0];
  const comps = Object.values(c.competencies).sort((a, b) => b.competencyScore - a.competencyScore);
  return (
    <Drawer open={open} onClose={onClose} title={`${c.name} — Candidate Intelligence`} subtitle={`${c.targetRole} · Readiness ${c.roleReadiness}%`}>
      <div className="space-y-4">
        <DemoBadge />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Branch" value={c.branch} /><Field label="Year" value={`Year ${c.year}`} />
          <Field label="College" value={c.college} /><Field label="CGPA" value={String(c.cgpa)} />
          <Field label="Target Role" value={c.targetRole} /><Field label="Location" value={c.location} />
        </div>
        {bestOpp?.m && <div className="rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--ss-blue-600)]">Best match: {bestOpp.o.title}</span><MatchBadge score={bestOpp.m.matchScore} /></div></div>}
        <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Relevant Skills</p><div className="mt-1 space-y-1">{comps.map((s) => <div key={s.skillId} className="flex items-center justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{s.skillName}</span><span className="flex items-center gap-1.5"><span className="font-bold text-[var(--ss-ink)]">{s.competencyScore}</span><SsBadge tone="neutral" className="text-[9px]">{s.evidenceConfidence}</SsBadge></span></div>)}</div></div>
        <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evidence ({c.evidence.length})</p><div className="mt-1 space-y-1">{c.evidence.slice(0, 4).map((e) => <div key={e.evidenceId} className="flex items-center justify-between text-[11px]"><span className="text-[var(--ss-ink-soft)]">{e.sourceTitle} · {e.skillName}</span><SsBadge tone={e.status === "Evaluated" ? "teal" : "neutral"} className="text-[9px]">{e.status}</SsBadge></div>)}</div></div>
        {bestOpp?.m && <button onClick={() => onWhy(c, bestOpp.m)} className="w-full rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] py-2 text-xs font-semibold text-[var(--ss-blue-600)] hover:bg-[var(--ss-blue-100)]">Why this candidate? →</button>}
        <div className="flex flex-wrap gap-2">
          <Button variant="orange" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => shortlist(c.studentId, c.name, bestOpp?.o.id)}><Bookmark className="h-3 w-3" /> Shortlist</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, opportunityId: bestOpp?.o.id, opportunityTitle: bestOpp?.o.title, type: "Interview", message: "You are invited to interview." })}>Invite to Interview</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, type: "Internship", message: "Internship invitation." })}>Invite to Internship</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, type: "Project", message: "Project offer." })}>Offer Project</Button>
        </div>
      </div>
    </Drawer>
  );
}

function WhyMatchModal({ data, open, onClose }: { data: { candidate: Candidate; match: MatchResult } | null; open: boolean; onClose: () => void }) {
  if (!data) return null;
  const { candidate: c, match: m } = data;
  return (
    <Modal open={open} onClose={onClose} title={`Why this candidate? — ${c.name}`} subtitle={`${m.matchScore}% match`} size="md">
      <div className="space-y-3">
        <DemoBadge />
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 space-y-2 text-xs">
          <div className="flex justify-between"><span>Skill Alignment (40%)</span><b>{m.skillAlignment}</b></div>
          <div className="flex justify-between"><span>Role Alignment (20%)</span><b>{m.roleAlignment}</b></div>
          <div className="flex justify-between"><span>Evidence Strength (15%)</span><b>{m.evidenceStrength}</b></div>
          <div className="flex justify-between"><span>Eligibility (10%)</span><b>{m.eligibility}</b></div>
          <div className="flex justify-between"><span>Experience (10%)</span><b>{m.experienceAlignment}</b></div>
          <div className="flex justify-between"><span>Availability (5%)</span><b>{m.availability}</b></div>
          <div className="border-t border-[var(--ss-line)] pt-2 flex justify-between"><b>Final Match</b><span className="text-lg font-extrabold text-[var(--ss-blue-600)]">{m.matchScore}%</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><p className="text-[10px] font-semibold uppercase text-[var(--ss-teal-600)]">Strong</p>{m.matchedSkills.map((s) => <p key={s} className="text-xs">✓ {s}</p>)}</div>
          <div><p className="text-[10px] font-semibold uppercase text-[var(--ss-orange-600)]">Gaps</p>{m.missingSkills.map((s) => <p key={s} className="text-xs">• {s}</p>)}</div>
        </div>
        <p className="text-[10px] text-[var(--ss-muted)]">Same Phase 4 matching engine — no second formula. Score is identical to what the student sees.</p>
      </div>
    </Modal>
  );
}
