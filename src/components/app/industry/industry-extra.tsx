"use client";

import { useState } from "react";
import {
  MessageSquare, BarChart3, Trophy, Boxes, BookOpen, Bell, User, Building2,
  CheckCircle2, AlertTriangle, TrendingUp, FileText, PlusCircle, Send, Star, Info,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useIndustry, useIndustryStore, IndustryService, DEMO_COMPANY, DEMO_INDUSTRY_USER, DEMO_CANDIDATES } from "@/lib/industry";
import { useCareerStore } from "@/lib/career";
import { ALL_ROLES, SKILL_NAMES } from "@/lib/intelligence/role-config";
import type { Candidate, FeedbackCategory } from "@/lib/industry/industry-model";
import {
  DashHeader, Modal, Drawer, DemoBadge, CalcBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsSkillBar } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IndustryExtra({ section }: { section: string }) {
  if (section === "feedback") return <FeedbackPage />;
  if (section === "analytics") return <AnalyticsPage />;
  if (section === "challenges") return <ChallengesPage />;
  if (section === "team-builder") return <TeamBuilderPage />;
  if (section === "learning") return <LearningHubPage />;
  if (section === "notifications") return <NotificationsPage />;
  if (section === "profile") return <ProfilePage />;
  return <FeedbackPage />;
}

// ─── Feedback (§30, §31, §32, §33) ──────────────────────────────
function FeedbackPage() {
  const ind = useIndustry();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Feedback" subtitle="Feedback creates evidence → strengthens student skill intelligence" icon={MessageSquare} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Give Feedback</Button>} />
      {ind.feedback.length === 0 ? <EmptyState icon={MessageSquare} title="No feedback submitted yet" hint="Submit feedback to create evidence for students." /> : (
        <div className="space-y-2.5">{ind.feedback.map((f) => (
          <SsCard key={f.id} tone="soft" className="p-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{f.studentName}</p><p className="text-[10px] text-[var(--ss-muted)]">{f.experience} · {f.createdAt.slice(0, 10)}</p></div><SsBadge tone={f.status === "Submitted" ? "teal" : "neutral"} className="text-[10px]">{f.status}</SsBadge></div>
            {f.skillScores.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{f.skillScores.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s.skillName}: {s.score}</span>)}</div>}
          </SsCard>
        ))}</div>
      )}
      {showForm && <FeedbackForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const ind = useIndustry();
  const { submitFeedback } = useIndustryStore();
  const [studentId, setStudentId] = useState(DEMO_CANDIDATES[0].studentId);
  const [experience, setExperience] = useState("Internship");
  const [technical, setTechnical] = useState("");
  const [professional, setProfessional] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [skillScores, setSkillScores] = useState<{ skillId: string; skillName: string; score: number }[]>([]);
  const c = DEMO_CANDIDATES.find((c) => c.studentId === studentId)!;
  const roleSkills = ALL_ROLES.find((r) => r.roleId === c.roleId)?.skills ?? [];

  const addSkill = (skillId: string) => {
    if (skillScores.some((s) => s.skillId === skillId)) return;
    setSkillScores([...skillScores, { skillId, skillName: SKILL_NAMES[skillId] ?? skillId, score: 70 }]);
  };
  const submit = () => {
    submitFeedback({ studentId: c.studentId, studentName: c.name, experience, technicalFeedback: technical, professionalFeedback: professional, strengths, areasForImprovement: improvements, skillScores, categoryScores: [] });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Industry Feedback" subtitle="Feedback → Evidence (creates evidence records for S042)" size="lg">
      <div className="space-y-4">
        <DemoBadge />
        <div className="space-y-1"><label className="text-[11px] font-semibold">Student</label><select value={studentId} onChange={(e) => { setStudentId(e.target.value); setSkillScores([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{DEMO_CANDIDATES.map((c) => <option key={c.studentId} value={c.studentId}>{c.name} ({c.studentId})</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-semibold">Experience</label><select value={experience} onChange={(e) => setExperience(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>Internship</option><option>Project</option><option>Hackathon</option></select></div>
        <textarea value={technical} onChange={(e) => setTechnical(e.target.value)} rows={2} placeholder="Technical feedback…" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <textarea value={professional} onChange={(e) => setProfessional(e.target.value)} rows={2} placeholder="Professional feedback…" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <div className="grid grid-cols-2 gap-2"><input value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Strengths" className="h-9 rounded-md border border-[var(--ss-border)] px-2 text-sm" /><input value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="Areas for improvement" className="h-9 rounded-md border border-[var(--ss-border)] px-2 text-sm" /></div>
        <div><label className="text-[11px] font-semibold">Skill Scores (centralized skills)</label><div className="mt-2 flex flex-wrap gap-1.5">{roleSkills.map((s) => <button key={s.skillId} onClick={() => addSkill(s.skillId)} className="rounded-full border border-[var(--ss-border)] px-2.5 py-0.5 text-[11px] hover:bg-[var(--ss-surface-2)]">+ {s.skillName}</button>)}</div></div>
        {skillScores.length > 0 && <div className="space-y-2">{skillScores.map((s, i) => <div key={s.skillId} className="flex items-center gap-2 rounded-lg bg-[var(--ss-surface-2)] p-2.5"><span className="flex-1 text-sm font-medium">{s.skillName}</span><input type="number" min={0} max={100} value={s.score} onChange={(e) => setSkillScores(skillScores.map((x, j) => j === i ? { ...x, score: Number(e.target.value) } : x))} className="h-8 w-14 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs" /></div>)}</div>}
        <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]"><Info className="mr-1 inline h-3 w-3" />For S042, feedback creates real EvidenceRecords in the shared intelligence store — visible in the Student Portal's evidence timeline.</div>
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button variant="orange" className="flex-1 gap-1.5" onClick={submit}><Send className="h-3.5 w-3.5" /> Submit Feedback</Button></div>
      </div>
    </Modal>
  );
}

// ─── Analytics (§40, §41, §42, §43, §46) ─────────────────────────
function AnalyticsPage() {
  const ind = useIndustry();
  const apps = ind.applications;
  const funnel = { applied: apps.filter((a) => a.status === "APPLIED").length, review: apps.filter((a) => a.status === "UNDER_REVIEW").length, shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length, interview: apps.filter((a) => a.status === "INTERVIEW").length, selected: apps.filter((a) => a.status === "SELECTED").length };
  // demand vs talent (controlled demo, §43)
  const demandVsTalent = [
    { skill: "Python", demand: 92, supply: 78 },
    { skill: "SQL", demand: 88, supply: 51 },
    { skill: "Machine Learning", demand: 90, supply: 39 },
    { skill: "Cloud", demand: 82, supply: 27 },
  ];
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Analytics" subtitle="Talent pipeline, demand & funnel from actual records" icon={BarChart3} accent="#EA580C" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><SsStat label="Applicants" value={apps.length} icon={FileText} tone="orange" /><SsStat label="Shortlisted" value={ind.shortlistedIds.length} icon={CheckCircle2} tone="navy" /><SsStat label="Feedback" value={ind.feedback.length} icon={MessageSquare} tone="teal" /></div>
      <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Application Funnel</h3><div className="flex flex-wrap items-center gap-2 text-xs">
        {[["Applied", funnel.applied], ["Under Review", funnel.review], ["Shortlisted", funnel.shortlisted], ["Interview", funnel.interview], ["Selected", funnel.selected]].map(([label, count], i, arr) => (
          <span key={label as string} className="flex items-center gap-2"><span className="rounded-full bg-[var(--ss-orange-50)] px-2.5 py-1 font-semibold text-[var(--ss-orange-600)]">{label}: {count as number}</span>{i < arr.length - 1 && <span className="text-[var(--ss-faint)]">→</span>}</span>
        ))}
      </div></SsCard>
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[var(--ss-ink)]">Demand vs Available Talent</h3><DemoBadge /></div>
        <div className="space-y-3">{demandVsTalent.map((d) => <div key={d.skill}><div className="mb-1 flex justify-between text-[11px]"><span className="font-medium text-[var(--ss-ink-soft)]">{d.skill}</span><span className="text-[var(--ss-muted)]">Demand {d.demand} / Supply {d.supply}</span></div><div className="flex gap-1"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--ss-surface-3)]"><div className="h-full rounded-full bg-[var(--ss-orange-600)]" style={{ width: `${d.demand}%` }} /></div><div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--ss-surface-3)]"><div className="h-full rounded-full bg-[var(--ss-teal-600)]" style={{ width: `${d.supply}%` }} /></div></div></div>)}</div>
        <p className="mt-3 text-[10px] text-[var(--ss-muted)]">Demand values are controlled demonstration data. Supply reflects demo candidate competencies.</p>
      </SsCard>
      <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold">Skill Demand (from your opportunities)</h3><div className="space-y-1.5">{ind.opportunities.flatMap((o) => o.requiredSkills).reduce((acc, s) => { acc[s.skillName] = (acc[s.skillName] ?? 0) + 1; return acc; }, {} as Record<string, number>) && Object.entries(ind.opportunities.flatMap((o) => o.requiredSkills).reduce((acc, s) => { acc[s.skillName] = (acc[s.skillName] ?? 0) + 1; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).map(([skill, count]) => <div key={skill} className="flex justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{skill}</span><SsBadge tone="orange" className="text-[9px]">{count}×</SsBadge></div>)}</div></SsCard>
    </div>
  );
}

// ─── Challenges (§36, §37) ───────────────────────────────────────
function ChallengesPage() {
  const ind = useIndustry();
  const { createChallenge } = useIndustryStore();
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <DashHeader title="Challenges & Hackathons" subtitle="Industry-side entry point — full hackathon system in a later phase" icon={Trophy} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Create Challenge</Button>} />
      <div className="space-y-2.5">{ind.challenges.map((ch) => (
        <SsCard key={ch.id} tone="soft" className="p-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{ch.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{ch.domain} · Team {ch.teamSize} · {ch.startDate} → {ch.endDate}</p></div><SsBadge tone="orange" className="text-[10px]">{ch.status}</SsBadge></div>
          <p className="mt-2 text-xs text-[var(--ss-ink-soft)]">{ch.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">{ch.requiredSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
        </SsCard>
      ))}</div>
      <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] text-[var(--ss-muted)]">The detailed Hackathon execution system (submissions, evaluation, team matching) will be completed in the dedicated Hackathon phase. This is the Industry-side entry point only.</p>
    </div>
  );
}

// ─── Team Builder (§38, §39) — PROTOTYPE ─────────────────────────
function TeamBuilderPage() {
  const [teamSize, setTeamSize] = useState(4);
  const [roles, setRoles] = useState<string[]>(["ml-engineer", "full-stack-developer"]);
  return (
    <div className="space-y-6">
      <DashHeader title="AI Team Builder" subtitle="Define team requirements — full matching engine in a later phase" icon={Boxes} accent="#EA580C" action={<DemoBadge>PROTOTYPE / NEXT PHASE</DemoBadge>} />
      <SsCard tone="soft" className="p-5 space-y-4">
        <div className="space-y-1"><label className="text-[11px] font-semibold">Required Team Size</label><input type="number" min={1} max={10} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="h-9 w-20 rounded-md border border-[var(--ss-border)] px-2 text-sm" /></div>
        <div><label className="text-[11px] font-semibold">Required Roles</label><div className="mt-2 flex flex-wrap gap-1.5">{ALL_ROLES.map((r) => <button key={r.roleId} onClick={() => setRoles(roles.includes(r.roleId) ? roles.filter((x) => x !== r.roleId) : [...roles, r.roleId])} className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", roles.includes(r.roleId) ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>{r.roleName}</button>)}</div></div>
        <Button variant="orange" disabled>Generate Team</Button>
        <p className="text-[10px] text-[var(--ss-muted)]">Team generation will connect to the dedicated Hackathon/Team Intelligence phase. This is the configuration flow only.</p>
      </SsCard>
    </div>
  );
}

// ─── Learning Hub (§34) ──────────────────────────────────────────
function LearningHubPage() {
  const ind = useIndustry();
  const learningOpps = ind.opportunities.filter((o) => ["TRAINING", "WORKSHOP", "CERTIFICATION", "MENTORSHIP"].includes(o.type));
  return (
    <div className="space-y-6">
      <DashHeader title="Learning Hub" subtitle="Publish training, workshops, certifications & mentorship" icon={BookOpen} accent="#EA580C" />
      {learningOpps.length === 0 ? <EmptyState icon={BookOpen} title="No learning programs" hint="Publish learning opportunities from Post Opportunity." /> : (
        <div className="grid gap-3 sm:grid-cols-2">{learningOpps.map((o) => (
          <SsCard key={o.id} tone="soft" className="p-4"><p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{o.provider} · {o.type} · {o.duration}</p><div className="mt-2 flex flex-wrap gap-1">{o.requiredSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div></SsCard>
        ))}</div>
      )}
    </div>
  );
}

// ─── Notifications (§54) ──────────────────────────────────────────
function NotificationsPage() {
  const ind = useIndustry();
  const { markAllNotificationsRead, markNotificationRead } = useIndustryStore();
  return (
    <div className="space-y-6">
      <DashHeader title="Notifications" subtitle="Real prototype events from application/invitation/feedback" icon={Bell} accent="#EA580C" action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>} />
      {ind.notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">{ind.notifications.map((n) => (
          <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)]")}>
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p><span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span></div>
            <p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>
            {!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-orange-600)]">Mark read</button>}
          </div>
        ))}</div>
      )}
    </div>
  );
}

// ─── Profile (§51, §52) ──────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Profile" subtitle={`${DEMO_COMPANY.companyName} · ${DEMO_INDUSTRY_USER.role}`} icon={User} accent="#EA580C" />
      <SsCard tone="soft" className="p-5">
        <div className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]"><Building2 className="h-7 w-7" /></span><div><p className="text-lg font-bold text-[var(--ss-ink)]">{DEMO_COMPANY.companyName}</p><p className="text-xs text-[var(--ss-muted)]">{DEMO_COMPANY.industry} · {DEMO_COMPANY.location}</p></div></div>
        <p className="mt-4 text-sm text-[var(--ss-ink-soft)]">{DEMO_COMPANY.about}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.activeOpportunities}</p><p className="text-[10px] text-[var(--ss-muted)]">Active Opps</p></div><div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.challenges}</p><p className="text-[10px] text-[var(--ss-muted)]">Challenges</p></div><div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.mentors}</p><p className="text-[10px] text-[var(--ss-muted)]">Mentors</p></div></div>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">User Profile</h3>
        <div className="grid grid-cols-2 gap-2 text-xs"><Field label="Name" value={DEMO_INDUSTRY_USER.name} /><Field label="Role" value={DEMO_INDUSTRY_USER.role} /><Field label="Organization" value={DEMO_INDUSTRY_USER.organization} /><Field label="Email" value={DEMO_INDUSTRY_USER.email} /></div>
      </SsCard>
      <SsCard tone="soft" className="p-5"><h3 className="mb-3 text-sm font-bold">Audit Log</h3><div className="space-y-1">{useIndustryStore.getState().auditLog.slice(0, 8).map((a) => <div key={a.id} className="flex justify-between text-[11px]"><span className="text-[var(--ss-ink-soft)]"><b>{a.actor}</b> — {a.action} ({a.entity})</span><span className="text-[var(--ss-faint)]">{a.timestamp.slice(0, 10)}</span></div>)}</div></SsCard>
    </div>
  );
}
