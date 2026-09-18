"use client";

import { useState } from "react";
import {
  Users, GraduationCap, Trophy, FileText, Briefcase, Bell, User,
  PlusCircle, CheckCircle2, ArrowRight, X,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useAcademia, AcademiaService, useAcademiaStore, DEMO_FACULTY, DEMO_INSTITUTION, DEMO_COLLABORATIONS, DEMO_COURSES, DEMO_CURRICULUM } from "@/lib/academia";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useCareerStore } from "@/lib/career";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Collaboration, CollaborationType } from "@/lib/academia/academia-model";

export function AcademiaExtra({ section }: { section: string }) {
  if (section === "collaboration") return <CollaborationPage />;
  if (section === "mentorship") return <MentorshipPage />;
  if (section === "workshops") return <WorkshopsPage />;
  if (section === "fdp") return <FdpPage />;
  if (section === "projects") return <LiveProjectsPage />;
  if (section === "notifications") return <NotificationsPage />;
  if (section === "profile") return <ProfilePage />;
  return <CollaborationPage />;
}

// ─── Collaboration (§45, §46, §53) ────────────────────────────
function CollaborationPage() {
  const collabs = useAcademiaStore((s) => s.collaborations);
  const { createCollaboration, updateCollaborationStatus } = useAcademiaStore();
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <DashHeader title="Collaboration Hub" subtitle="Industry-academia collaborations" icon={Users} accent="#2563EB" action={<Button variant="blue" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Request Collaboration</Button>} />
      <div className="space-y-2.5">{collabs.map((c) => (
        <SsCard key={c.id} tone="soft" className="p-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{c.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.participants} participants · {c.date}</p></div><SsBadge tone={c.status === "Completed" ? "teal" : c.status === "Active" || c.status === "Scheduled" ? "blue" : "orange"} className="text-[10px]">{c.status}</SsBadge></div>
          <div className="mt-2 flex flex-wrap gap-1">{c.skills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
          {c.status === "Proposed" && <div className="mt-2 flex gap-1.5"><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Approved")}>Approve</Button><Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Scheduled")}>Schedule</Button></div>}
        </SsCard>
      ))}</div>
      {showForm && <CollabForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function CollabForm({ onClose }: { onClose: () => void }) {
  const { createCollaboration } = useAcademiaStore();
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [type, setType] = useState<CollaborationType>("Workshop");
  const submit = () => { createCollaboration({ organization: org, type, title, skills: [], targetRoles: [], participants: 0, date: new Date().toISOString().slice(0, 10), requestedBy: "Academia" }); onClose(); };
  return (
    <Modal open onClose={onClose} title="Request Collaboration" size="md">
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Organization" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value as CollaborationType)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>Workshop</option><option>Guest Lecture</option><option>Live Project</option><option>Mentorship</option><option>Innovation Challenge</option><option>Research</option><option>Faculty Training</option></select>
        <Button variant="blue" className="w-full" onClick={submit} disabled={!title}>Submit Request</Button>
      </div>
    </Modal>
  );
}

// ─── Mentorship (§28-31) ──────────────────────────────────────
function MentorshipPage() {
  const sessions = useAcademiaStore((s) => s.mentorshipSessions);
  const { acceptMentorship, completeMentorship, cancelMentorship, submitFacultyFeedback } = useAcademiaStore();
  const [feedbackFor, setFeedbackFor] = useState<typeof sessions[0] | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Mentorship" subtitle="Faculty-student mentorship sessions + feedback → evidence" icon={GraduationCap} accent="#2563EB" action={<DemoBadge />} />
      {sessions.length === 0 ? <EmptyState icon={GraduationCap} title="No mentoring relationships" hint="No active mentoring relationships." /> : (
        <div className="space-y-2.5">{sessions.map((s) => (
          <SsCard key={s.id} tone="soft" className="p-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{s.studentName} → {s.skillName}</p><p className="text-[10px] text-[var(--ss-muted)]">{s.topic} · {s.date} {s.time}</p></div><SsBadge tone={s.status === "Completed" ? "teal" : s.status === "Scheduled" ? "blue" : "orange"} className="text-[10px]">{s.status}</SsBadge></div>
            <div className="mt-2 flex gap-1.5">
              {s.status === "Requested" && <Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => acceptMentorship(s.id)}>Accept</Button>}
              {s.status === "Accepted" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => completeMentorship(s.id)}>Mark Complete</Button>}
              {s.status === "Completed" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setFeedbackFor(s)}>Give Feedback</Button>}
              {s.status !== "Completed" && s.status !== "Cancelled" && <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[var(--ss-orange-600)]" onClick={() => cancelMentorship(s.id)}>Cancel</Button>}
            </div>
          </SsCard>
        ))}</div>
      )}
      <FeedbackModal session={feedbackFor} onClose={() => setFeedbackFor(null)} onSubmit={(score) => { if (feedbackFor) { submitFacultyFeedback(feedbackFor.studentId, feedbackFor.studentName, feedbackFor.skillId, feedbackFor.skillName, score, feedbackFor.topic); setFeedbackFor(null); } }} />
    </div>
  );
}

// ─── Workshops (§32, §33) ─────────────────────────────────────
function WorkshopsPage() {
  const collabs = useAcademiaStore((s) => s.collaborations.filter((c) => c.type === "Workshop" || c.type === "Guest Lecture"));
  return (
    <div className="space-y-6">
      <DashHeader title="Workshops & Guest Lectures" subtitle="Industry workshops, guest lectures, bootcamps" icon={Trophy} accent="#2563EB" action={<DemoBadge />} />
      {collabs.length === 0 ? <EmptyState icon={Trophy} title="No workshops" hint="No active workshops or guest lectures." /> : (
        <div className="space-y-2.5">{collabs.map((c) => <SsCard key={c.id} tone="soft" className="p-4"><p className="text-sm font-bold text-[var(--ss-ink)]">{c.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.date} · {c.participants} participants</p><div className="mt-2 flex flex-wrap gap-1">{c.skills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div></SsCard>)}</div>
      )}
    </div>
  );
}

// ─── FDP (§25) ────────────────────────────────────────────────
function FdpPage() {
  const opps = AcademiaService.getFacultyOpportunities().filter((o) => o.type === "FDP" || o.type === "INDUSTRIAL_TRAINING");
  return (
    <div className="space-y-6">
      <DashHeader title="Faculty Development Programs" subtitle="FDPs + industrial training" icon={FileText} accent="#2563EB" action={<DemoBadge />} />
      <div className="grid gap-3 md:grid-cols-2">{opps.map((o) => <SsCard key={o.id} tone="soft" className="p-4"><p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{o.organization} · {o.duration} · {o.mode}</p><div className="mt-2 flex flex-wrap gap-1">{o.skills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div></SsCard>)}</div>
    </div>
  );
}

// ─── Live Projects (§34) ──────────────────────────────────────
function LiveProjectsPage() {
  const opps = useCareerStore.getState().opportunities.filter((o) => o.type === "PROJECT" && o.status === "Published");
  return (
    <div className="space-y-6">
      <DashHeader title="Live Projects" subtitle="Industry projects visible to academia (shared Phase 4 data)" icon={Briefcase} accent="#2563EB" action={<DemoBadge />} />
      {opps.length === 0 ? <EmptyState icon={Briefcase} title="No live projects" /> : (
        <div className="grid gap-3 md:grid-cols-2">{opps.map((o) => <SsCard key={o.id} tone="soft" className="p-4"><p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{o.company} · {o.problem ?? o.description}</p><div className="mt-2 flex flex-wrap gap-1">{o.requiredSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div></SsCard>)}</div>
      )}
    </div>
  );
}

// ─── Notifications (§70) ──────────────────────────────────────
function NotificationsPage() {
  const notifications = useAcademiaStore((s) => s.notifications);
  const { markAllNotificationsRead, markNotificationRead } = useAcademiaStore();
  return (
    <div className="space-y-6">
      <DashHeader title="Notifications" subtitle="Real academia events" icon={Bell} accent="#2563EB" action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>} />
      {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">{notifications.map((n) => <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)]")}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p><span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span></div><p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>{!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-blue-600)]">Mark read</button>}</div>)}</div>
      )}
    </div>
  );
}

// ─── Profile (§65, §66) ───────────────────────────────────────
function ProfilePage() {
  return (
    <div className="space-y-6">
      <DashHeader title="Academia Profile" subtitle={`${DEMO_FACULTY.department} · ${DEMO_INSTITUTION.name}`} icon={User} accent="#2563EB" />
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Faculty Profile</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Name" value={DEMO_FACULTY.name} />
          <Field label="Department" value={DEMO_FACULTY.department} />
          <Field label="Institution" value={DEMO_FACULTY.institution} />
          <Field label="Availability" value={DEMO_FACULTY.availability} />
        </div>
        <p className="mt-3 text-sm text-[var(--ss-ink-soft)]">{DEMO_FACULTY.bio}</p>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Expertise & Skills</h3>
        <div className="flex flex-wrap gap-1.5">{DEMO_FACULTY.skills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName}</SsBadge>)}</div>
        <p className="mt-3 text-[11px] text-[var(--ss-muted)]">Research domains: {DEMO_FACULTY.researchDomains.join(", ")}</p>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Courses</h3>
        <div className="space-y-1">{DEMO_COURSES.map((c) => <div key={c.id} className="flex justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{c.name}</span><span className="text-[var(--ss-muted)]">Sem {c.semester} · {c.department}</span></div>)}</div>
      </SsCard>
    </div>
  );
}

// ─── Feedback modal (extracted to fix hooks rule) ──────────────
function FeedbackModal({ session, onClose, onSubmit }: { session: { studentName: string; skillName: string; studentId: string; skillId: string; topic: string } | null; onClose: () => void; onSubmit: (score: number) => void }) {
  const [score, setScore] = useState(70);
  return (
    <Modal open={!!session} onClose={onClose} title="Faculty Feedback → Evidence" subtitle={session ? `${session.studentName} · ${session.skillName}` : ""} size="sm">
      {session && (
        <div className="space-y-3">
          <DemoBadge />
          <p className="text-[11px] text-[var(--ss-muted)]">Feedback creates an evidence record for {session.studentName} ({session.skillName}).</p>
          <div>
            <label className="text-[11px] font-semibold">Score: {score}</label>
            <input type="range" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full accent-[var(--ss-blue-600)]" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="blue" className="flex-1" onClick={() => onSubmit(score)}>Submit Feedback</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
