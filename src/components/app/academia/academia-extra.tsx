"use client";

/**
 * SKILL SETU — Phase 9 Academia Portal · extra pages.
 *
 * Rebuilt for the Industry–Academic Alignment Workspace identity (Phase 9 §32, §33, §31).
 *
 * Pages in this file:
 *   - CollaborationPage (/academia/collaboration) — REBUILD §32/§33
 *       Industry ↔ Academia hub · SsPipeline lifecycle · full §33 detail per card
 *   - MentorshipPage (/academia/mentorship) — REBUILD §31
 *       FIND A MENTOR — uses AcademiaAggregator mentor matches + preserves existing
 *       session feedback loop (faculty feedback → student evidence)
 *   - WorkshopsPage (/academia/workshops) — light restyle + SsDataSourceLabel
 *   - FdpPage (/academia/fdp) — light restyle + SsDataSourceLabel
 *   - LiveProjectsPage (/academia/projects) — light restyle + SsDataSourceLabel
 *   - NotificationsPage (/academia/notifications) — preserved
 *   - ProfilePage (/academia/profile) — preserved
 *
 * All numbers come from shared Phase 3–8 stores. We do NOT invent values.
 */

import { useMemo, useState } from "react";
import {
  Users, GraduationCap, Trophy, FileText, Briefcase, Bell, User,
  PlusCircle, Building2, CalendarDays, Users2, Target, Wrench,
  Lightbulb, ArrowRight, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AcademiaService, useAcademiaStore,
  DEMO_FACULTY, DEMO_INSTITUTION,
  DEMO_COURSES,
} from "@/lib/academia";
import { useCareerStore } from "@/lib/career";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsEyebrow } from "@/components/ui/ss";
import {
  SsPipeline, SsDataSourceLabel, SsAlertPill, SsWorkflowBanner,
} from "@/components/ui/ss-intelligence";
import { useMentorMatches } from "./academia-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Collaboration, CollaborationType, CollaborationStatus,
} from "@/lib/academia/academia-model";

// ─────────────────────────────────────────────────────────────────
// Router — extra sections
// ─────────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════
// COLLABORATION PAGE (/academia/collaboration) — REBUILD §32/§33
// ═══════════════════════════════════════════════════════════════
const COLLAB_TYPES: CollaborationType[] = [
  "Workshop", "Guest Lecture", "Live Project", "Mentorship",
  "Innovation Challenge", "Research", "Faculty Training",
];

const COLLAB_PIPELINE_STAGES: { key: string; label: string; icon?: LucideIcon }[] = [
  { key: "Proposed", label: "Proposed", icon: Lightbulb },
  { key: "Approved", label: "Approved", icon: CheckCircle2 },
  { key: "Scheduled", label: "Scheduled", icon: CalendarDays },
  { key: "Active", label: "Active", icon: Wrench },
  { key: "Completed", label: "Completed", icon: Trophy },
];

function statusToPipelineIndex(s: CollaborationStatus): number {
  const map: Record<CollaborationStatus, number> = {
    Proposed: 0, Approved: 1, Scheduled: 2, Active: 3, Completed: 4, Feedback: 4,
  };
  return map[s] ?? 0;
}

function CollaborationPage() {
  const collabs = useAcademiaStore((s) => s.collaborations);
  const { createCollaboration, updateCollaborationStatus } = useAcademiaStore();
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<CollaborationType | "">("");
  const [detail, setDetail] = useState<Collaboration | null>(null);

  const filtered = useMemo(
    () => (typeFilter ? collabs.filter((c) => c.type === typeFilter) : collabs),
    [collabs, typeFilter],
  );

  return (
    <div className="space-y-6">
      <DashHeader
        title="Industry ↔ Academia"
        subtitle="Active collaborations across the lifecycle — Proposed → Approved → Scheduled → Active → Completed"
        icon={Building2}
        accent="#2563EB"
        action={
          <Button variant="blue" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}>
            <PlusCircle className="h-3.5 w-3.5" /> Request Collaboration
          </Button>
        }
      />

      <SsWorkflowBanner tone="blue" steps={["Industry signal", "Propose", "Approve", "Schedule", "Run", "Evidence"]} />

      {/* Type filter chips (§32) */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setTypeFilter("")}
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
            typeFilter === "" ? "bg-[var(--ss-blue-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
          )}
        >
          All
        </button>
        {COLLAB_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
              typeFilter === t ? "bg-[var(--ss-blue-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Collaborations — §33 full detail per card + SsPipeline lifecycle */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No collaborations in this category"
          hint="Try another filter or propose a new collaboration."
          action={<Button variant="blue" size="sm" className="h-8" onClick={() => setShowForm(true)}>Request collaboration</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const idx = statusToPipelineIndex(c.status);
            return (
              <SsCard key={c.id} tone="soft" className="p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{c.title}</p>
                      <SsBadge tone="academia" className="text-[10px]">{c.type}</SsBadge>
                      <SsAlertPill
                        tone={c.status === "Completed" ? "info" : c.status === "Active" || c.status === "Scheduled" ? "info" : "warning"}
                        label={c.status}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--ss-muted)]">
                      <span className="font-semibold text-[var(--ss-ink-soft)]">Industry:</span> {c.organization}
                      {" · "}
                      <span className="font-semibold text-[var(--ss-ink-soft)]">Requested by:</span> {c.requestedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SsDataSourceLabel source="demo" />
                    <button onClick={() => setDetail(c)} className="text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline">View detail →</button>
                  </div>
                </div>

                {/* Lifecycle pipeline (§32) */}
                <div className="mt-3">
                  <SsPipeline
                    stages={COLLAB_PIPELINE_STAGES}
                    activeIndex={idx}
                    completedUntil={idx}
                  />
                </div>

                {/* Topic + skills + roles quick view (§33) */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailKv icon={Target} label="Topic" value={c.title} />
                  <DetailKv icon={Users2} label="Participants" value={`${c.participants}`} />
                  <DetailKv icon={CalendarDays} label="Date" value={c.date} />
                  <DetailKv icon={GraduationCap} label="Faculty" value={DEMO_FACULTY.name} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Skills</span>
                  {c.skills.length === 0 ? (
                    <span className="text-[10px] text-[var(--ss-muted)]">—</span>
                  ) : (
                    c.skills.map((s) => (
                      <span key={s.skillId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)]">{s.skillName}</span>
                    ))
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Target roles</span>
                  {c.targetRoles.length === 0 ? (
                    <span className="text-[10px] text-[var(--ss-muted)]">—</span>
                  ) : (
                    c.targetRoles.map((r) => (
                      <span key={r} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-ink-soft)]">
                        {ALL_ROLES.find((role) => role.roleId === r)?.roleName ?? r}
                      </span>
                    ))
                  )}
                </div>

                {/* Lifecycle actions */}
                {c.status === "Proposed" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Approved")}>Approve</Button>
                    <Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Scheduled")}>Schedule</Button>
                  </div>
                )}
                {c.status === "Approved" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Scheduled")}>Move to Scheduled</Button>
                  </div>
                )}
                {c.status === "Scheduled" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Active")}>Mark Active</Button>
                  </div>
                )}
                {c.status === "Active" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button variant="teal" size="sm" className="h-7 text-[10px]" onClick={() => updateCollaborationStatus(c.id, "Completed")}>Mark Completed</Button>
                  </div>
                )}
              </SsCard>
            );
          })}
        </div>
      )}

      {/* CollabForm — preserved from prior phase */}
      {showForm && <CollabForm onClose={() => setShowForm(false)} />}

      {/* §33 detail drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle={detail?.organization}>
        {detail && (
          <div className="space-y-3">
            <DemoBadge />
            <div className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
              <SsPipeline
                stages={COLLAB_PIPELINE_STAGES}
                activeIndex={statusToPipelineIndex(detail.status)}
                completedUntil={statusToPipelineIndex(detail.status)}
              />
            </div>
            <Field label="Industry partner" value={detail.organization} />
            <Field label="Type" value={detail.type} />
            <Field label="Topic" value={detail.title} />
            <Field label="Date" value={detail.date} />
            <Field label="Participants" value={`${detail.participants}`} />
            <Field label="Faculty" value={DEMO_FACULTY.name} />
            <Field label="Status" value={detail.status} />
            <Field label="Requested by" value={detail.requestedBy} />
            {detail.outcome && <Field label="Expected outcome" value={detail.outcome} />}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Skills</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {detail.skills.length === 0 ? (
                  <span className="text-[10px] text-[var(--ss-muted)]">Not specified</span>
                ) : (
                  detail.skills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName}</SsBadge>)
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Target roles</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {detail.targetRoles.length === 0 ? (
                  <span className="text-[10px] text-[var(--ss-muted)]">Not specified</span>
                ) : (
                  detail.targetRoles.map((r) => (
                    <span key={r} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ss-ink-soft)]">
                      {ALL_ROLES.find((role) => role.roleId === r)?.roleName ?? r}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DetailKv({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--ss-border)] bg-white px-2.5 py-1.5">
      <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-[var(--ss-ink)]" title={value}>{value}</p>
    </div>
  );
}

function CollabForm({ onClose }: { onClose: () => void }) {
  const { createCollaboration } = useAcademiaStore();
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [type, setType] = useState<CollaborationType>("Workshop");
  const submit = () => {
    createCollaboration({
      organization: org || "Industry partner (TBD)",
      type,
      title: title || "New collaboration request",
      skills: [],
      targetRoles: [],
      participants: 0,
      date: new Date().toISOString().slice(0, 10),
      requestedBy: "Academia",
    });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Request Collaboration" size="md">
      <div className="space-y-3">
        <DemoBadge />
        <p className="text-[11px] text-[var(--ss-muted)]">
          Submit a new industry-academia collaboration request. The collaboration enters the lifecycle at the Proposed stage.
        </p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title / topic" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Industry partner" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value as CollaborationType)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
          {COLLAB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Button variant="blue" className="w-full" onClick={submit}>Submit Request</Button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// MENTORSHIP PAGE (/academia/mentorship) — REBUILD §31
// "FIND A MENTOR" — uses AcademiaAggregator mentor matches.
// Preserves existing session feedback loop (faculty feedback → evidence).
// ═══════════════════════════════════════════════════════════════
function MentorshipPage() {
  const sessions = useAcademiaStore((s) => s.mentorshipSessions);
  const { acceptMentorship, completeMentorship, cancelMentorship, submitFacultyFeedback } = useAcademiaStore();
  const [feedbackFor, setFeedbackFor] = useState<typeof sessions[number] | null>(null);
  const matches = useMentorMatches();

  return (
    <div className="space-y-6">
      <DashHeader
        title="Find a Mentor"
        subtitle="Student skill gap × faculty expertise — derived from shared platform data"
        icon={GraduationCap}
        accent="#2563EB"
        action={<DemoBadge />}
      />

      <SsWorkflowBanner tone="teal" steps={["Identify gap", "Match faculty", "Schedule session", "Faculty feedback", "Evidence record"]} />

      {/* §31 — Suggested mentor matches */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="teal" icon={Lightbulb}>§31 · Suggested mentor matches</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Matched students</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
              Each card pairs a student with a gap, the recommended faculty mentor, target role and availability.
            </p>
          </div>
          <SsDataSourceLabel source="platform" />
        </div>

        {matches.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No matches" hint="No students currently need mentorship mapped to your expertise." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map((m) => (
              <div key={m.student.studentId} className="rounded-xl border border-[var(--ss-border)] bg-white p-4">
                {/* Triangular relationship: Student → Faculty → Mentor */}
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: m.student.avatarColor }}>
                    {m.student.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--ss-ink)]">{m.student.name}</p>
                    <p className="truncate text-[10px] text-[var(--ss-muted)]">{m.student.college} · Year {m.student.year}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--ss-faint)]" />
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ss-blue-50)] text-[11px] font-bold text-[var(--ss-blue-600)]">
                    {m.faculty?.name.slice(0, 1) ?? "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ss-blue-600)]">{m.faculty?.name ?? "No match"}</p>
                    <p className="truncate text-[10px] text-[var(--ss-muted)]">{m.faculty?.department ?? "—"}</p>
                  </div>
                </div>

                {/* Match details (§31) */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Student gap</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.gapSkills.map((g) => (
                        <span key={g} className="rounded-full bg-[var(--ss-orange-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-orange-600)]">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Faculty expertise</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.faculty?.skills.map((fs) => (
                        <span key={fs.skillId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)]">{fs.skillName}</span>
                      )) ?? <span className="text-[10px] text-[var(--ss-muted)]">No mapped expertise</span>}
                    </div>
                  </div>
                  <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Target role</p>
                    <p className="mt-0.5 text-[var(--ss-ink)]">
                      {ALL_ROLES.find((r) => r.roleId === m.student.roleId)?.roleName ?? m.student.targetRole}
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--ss-faint)]">Availability</p>
                    <p className="mt-0.5 text-[var(--ss-ink)]">{m.faculty?.availability ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-2 rounded-md border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] px-2 py-1.5 text-[10px] text-[var(--ss-muted)]">
                  <span className="font-semibold text-[var(--ss-ink-soft)]">Reason:</span> {m.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </SsCard>

      {/* Existing mentorship sessions + feedback flow — preserved */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <SsEyebrow tone="blue" icon={Users}>Active mentorship sessions</SsEyebrow>
            <h2 className="mt-1.5 text-base font-bold text-[var(--ss-ink)]">Session lifecycle</h2>
            <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
              Accept → Complete → Faculty feedback (creates an evidence record for the student).
            </p>
          </div>
          <SsDataSourceLabel source="demo" />
        </div>
        {sessions.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No mentoring relationships" hint="No active mentoring relationships." />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => (
              <SsCard key={s.id} tone="lift" className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ss-ink)]">{s.studentName} → {s.skillName}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{s.topic} · {s.date} {s.time}</p>
                  </div>
                  <SsAlertPill
                    tone={s.status === "Completed" ? "info" : s.status === "Scheduled" || s.status === "Accepted" ? "info" : "warning"}
                    label={s.status}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.status === "Requested" && <Button variant="blue" size="sm" className="h-7 text-[10px]" onClick={() => acceptMentorship(s.id)}>Accept</Button>}
                  {s.status === "Accepted" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => completeMentorship(s.id)}>Mark Complete</Button>}
                  {s.status === "Completed" && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setFeedbackFor(s)}>Give Feedback</Button>}
                  {s.status !== "Completed" && s.status !== "Cancelled" && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[var(--ss-orange-600)]" onClick={() => cancelMentorship(s.id)}>Cancel</Button>
                  )}
                </div>
              </SsCard>
            ))}
          </div>
        )}
      </SsCard>

      <FeedbackModal
        session={feedbackFor}
        onClose={() => setFeedbackFor(null)}
        onSubmit={(score) => {
          if (feedbackFor) {
            submitFacultyFeedback(
              feedbackFor.studentId,
              feedbackFor.studentName,
              feedbackFor.skillId,
              feedbackFor.skillName,
              score,
              feedbackFor.topic,
            );
            setFeedbackFor(null);
          }
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKSHOPS PAGE — light restyle + SsDataSourceLabel (preserved)
// ═══════════════════════════════════════════════════════════════
function WorkshopsPage() {
  const allCollabs = useAcademiaStore((s) => s.collaborations);
  const collabs = useMemo(
    () => allCollabs.filter((c) => c.type === "Workshop" || c.type === "Guest Lecture"),
    [allCollabs],
  );
  return (
    <div className="space-y-6">
      <DashHeader title="Workshops & Guest Lectures" subtitle="Industry workshops, guest lectures, bootcamps" icon={Trophy} accent="#2563EB" action={<DemoBadge />} />
      <SsWorkflowBanner tone="blue" steps={["Schedule", "Run", "Student evidence", "Curriculum feedback"]} />
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-end justify-between gap-2">
          <SsEyebrow tone="blue" icon={Trophy}>Workshops & guest lectures</SsEyebrow>
          <SsDataSourceLabel source="demo" />
        </div>
        {collabs.length === 0 ? (
          <EmptyState icon={Trophy} title="No workshops" hint="No active workshops or guest lectures." />
        ) : (
          <div className="space-y-2.5">
            {collabs.map((c) => (
              <SsCard key={c.id} tone="lift" className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{c.title}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{c.organization} · {c.type} · {c.date} · {c.participants} participants</p>
                  </div>
                  <SsAlertPill tone={c.status === "Completed" ? "info" : c.status === "Active" || c.status === "Scheduled" ? "info" : "warning"} label={c.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.skills.map((s) => (
                    <span key={s.skillId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)]">{s.skillName}</span>
                  ))}
                </div>
              </SsCard>
            ))}
          </div>
        )}
      </SsCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FDP PAGE — light restyle + SsDataSourceLabel (preserved)
// ═══════════════════════════════════════════════════════════════
function FdpPage() {
  const opps = AcademiaService.getFacultyOpportunities().filter((o) => o.type === "FDP" || o.type === "INDUSTRIAL_TRAINING");
  return (
    <div className="space-y-6">
      <DashHeader title="FDP & Industrial Training" subtitle="Faculty Development Programs and industrial training opportunities" icon={FileText} accent="#2563EB" action={<DemoBadge />} />
      <SsWorkflowBanner tone="blue" steps={["Enroll", "Attend", "Curriculum enrichment", "Student benefit"]} />
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-end justify-between gap-2">
          <SsEyebrow tone="blue" icon={FileText}>FDP & industrial training</SsEyebrow>
          <SsDataSourceLabel source="demo" />
        </div>
        {opps.length === 0 ? (
          <EmptyState icon={FileText} title="No FDPs available" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {opps.map((o) => (
              <SsCard key={o.id} tone="lift" className="p-4">
                <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{o.organization} · {o.duration} · {o.mode} · deadline {o.deadline}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {o.skills.map((s) => (
                    <span key={s.skillId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)]">{s.skillName}</span>
                  ))}
                </div>
              </SsCard>
            ))}
          </div>
        )}
      </SsCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE PROJECTS PAGE — light restyle + SsDataSourceLabel (preserved)
// ═══════════════════════════════════════════════════════════════
function LiveProjectsPage() {
  const opps = useCareerStore.getState().opportunities.filter((o) => o.type === "PROJECT" && o.status === "Published");
  return (
    <div className="space-y-6">
      <DashHeader title="Live Projects" subtitle="Industry projects visible to academia (shared Phase 4 opportunity data)" icon={Briefcase} accent="#2563EB" action={<DemoBadge />} />
      <SsWorkflowBanner tone="blue" steps={["Industry posts", "Faculty assigns", "Student works", "Evidence record", "Industry feedback"]} />
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-end justify-between gap-2">
          <SsEyebrow tone="blue" icon={Briefcase}>Live industry projects</SsEyebrow>
          <SsDataSourceLabel source="platform" />
        </div>
        {opps.length === 0 ? (
          <EmptyState icon={Briefcase} title="No live projects" hint="No industry projects are currently published on the platform." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {opps.map((o) => (
              <SsCard key={o.id} tone="lift" className="p-4">
                <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{o.company} · {o.problem ?? o.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {o.requiredSkills.map((s) => (
                    <span key={s.skillId} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--ss-blue-600)]">{s.skillName}</span>
                  ))}
                </div>
              </SsCard>
            ))}
          </div>
        )}
      </SsCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE — preserved
// ═══════════════════════════════════════════════════════════════
function NotificationsPage() {
  const notifications = useAcademiaStore((s) => s.notifications);
  const { markAllNotificationsRead, markNotificationRead } = useAcademiaStore();
  return (
    <div className="space-y-6">
      <DashHeader
        title="Notifications"
        subtitle="Real academia events"
        icon={Bell}
        accent="#2563EB"
        action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>}
      />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)]")}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p>
                <span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span>
              </div>
              <p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>
              {!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-blue-600)]">Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE — preserved
// ═══════════════════════════════════════════════════════════════
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
function FeedbackModal({ session, onClose, onSubmit }: {
  session: { studentName: string; skillName: string; studentId: string; skillId: string; topic: string } | null;
  onClose: () => void;
  onSubmit: (score: number) => void;
}) {
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
