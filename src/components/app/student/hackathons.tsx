"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Users, FileText, Calendar, Compass, Clock,
  CheckCircle2, UserPlus, ChevronRight, CalendarClock, Sparkles, Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  UPCOMING_HACKATHONS, COMPLETED_HACKATHONS, type Hackathon,
} from "@/lib/student-data";
import {
  DashHeader, Modal, EmptyState, DemoBadge, MatchBadge,
  EvidenceStatusBadge, Field,
} from "@/components/app/student-parts";
import { Button } from "@/components/ui/button";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { cn } from "@/lib/utils";

// ─── Section switcher config ───────────────────────────────────
type Section = "discover" | "mine" | "teams" | "submissions" | "mentorship";

const SECTIONS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "discover",    label: "Discover",     icon: Compass },
  { id: "mine",        label: "My Hackathons", icon: Trophy },
  { id: "teams",       label: "My Teams",     icon: Users },
  { id: "submissions", label: "Submissions",  icon: FileText },
  { id: "mentorship",  label: "Mentorship",   icon: Calendar },
];

// ─── Demo submissions (inline) ─────────────────────────────────
type SubmissionStatus = "Submitted" | "Evaluated";
const DEMO_SUBMISSIONS: {
  id: string;
  hackathon: string;
  project: string;
  status: SubmissionStatus;
  date: string;
  team: string;
}[] = [
  { id: "sub-1", hackathon: "Smart India Hackathon 2025", project: "Waste-Predict v2",      status: "Evaluated", date: "Mar 2026", team: "Team DataForge" },
  { id: "sub-2", hackathon: "HackForGov 2025",            project: "Civic Grievance Mapper", status: "Submitted", date: "Feb 2026", team: "Team Insightify" },
];

// ─── Demo mentorship sessions (inline) ─────────────────────────
type MentorStatus = "Scheduled" | "Completed" | "Pending";
const DEMO_MENTORSHIP: {
  id: string;
  mentor: string;
  role: string;
  schedule: string;
  status: MentorStatus;
  topic: string;
}[] = [
  { id: "ms-1", mentor: "Dr. Meena Krishnan", role: "Senior Data Scientist · Nova Analytics", schedule: "Fri, 19 Sept · 4:00 PM IST", status: "Scheduled", topic: "Career path in Data Science & ML portfolio review." },
  { id: "ms-2", mentor: "Ankit Verma",        role: "Lead Engineer · Insightify",              schedule: "Mon, 22 Sept · 6:30 PM IST", status: "Pending",   topic: "SQL for analytics — advanced joins & window functions." },
];

const MENTOR_TONE: Record<MentorStatus, "blue" | "teal" | "orange"> = {
  Scheduled: "blue",
  Completed: "teal",
  Pending:   "orange",
};

// ─── Page shell ────────────────────────────────────────────────
export function HackathonsPage({ section }: { section: Section }) {
  const { navigate } = useRouter();
  const { joinedTeams, joinTeam } = useStudentState();
  const [viewHack, setViewHack] = useState<Hackathon | null>(null);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Hackathons & Teams"
        subtitle="Discover hackathons matched to your skills, build teams and track submissions"
        icon={Trophy}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Section switcher */}
      <div className="flex gap-1 overflow-x-auto scroll-slim rounded-xl border border-[var(--ss-border)] bg-white p-1 shadow-soft">
        {SECTIONS.map((s) => {
          const active = s.id === section;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/app/hackathons/${s.id}`)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "text-[var(--ss-muted)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      {section === "discover" && (
        <DiscoverSection joinedTeams={joinedTeams} onJoin={joinTeam} onView={setViewHack} />
      )}
      {section === "mine" && <MineSection joinedTeams={joinedTeams} />}
      {section === "teams" && <TeamsSection joinedTeams={joinedTeams} />}
      {section === "submissions" && <SubmissionsSection />}
      {section === "mentorship" && <MentorshipSection />}

      {/* Hackathon detail modal */}
      <HackathonDetailModal
        hackathon={viewHack}
        open={!!viewHack}
        onClose={() => setViewHack(null)}
        onJoin={(id) => { joinTeam(id); setViewHack(null); }}
        joined={viewHack ? joinedTeams.has(viewHack.id) : false}
      />
    </div>
  );
}

// ─── Discover ──────────────────────────────────────────────────
function DiscoverSection({
  joinedTeams, onJoin, onView,
}: {
  joinedTeams: Set<string>;
  onJoin: (id: string) => void;
  onView: (h: Hackathon) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Upcoming Hackathons</h2>
          <DemoBadge />
        </div>
        <span className="text-[11px] text-[var(--ss-muted)]">
          {UPCOMING_HACKATHONS.length} matched to your skills
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {UPCOMING_HACKATHONS.map((h) => {
          const joined = joinedTeams.has(h.id);
          return (
            <SsCard key={h.id} tone="lift" className="p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]">
                  <Trophy className="h-4 w-4" />
                </span>
                <MatchBadge score={h.match} />
              </div>
              <p className="mt-3 text-sm font-bold text-[var(--ss-ink)]">{h.name}</p>
              <p className="mt-0.5 text-[11px] text-[var(--ss-muted)]">{h.domain}</p>

              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-[var(--ss-muted)]">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Team {h.teamSize}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {h.deadline}</span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Required skills</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {h.requiredSkills.map((s) => (
                    <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 text-[11px]" onClick={() => onView(h)}>
                  View
                </Button>
                <Button
                  variant={joined ? "teal" : "navy"}
                  size="sm"
                  className="flex-1 gap-1.5 text-[11px]"
                  disabled={joined}
                  onClick={() => onJoin(h.id)}
                >
                  {joined ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                  {joined ? "Joined" : "Find Team"}
                </Button>
              </div>
            </SsCard>
          );
        })}
      </div>
    </motion.section>
  );
}

// ─── My Hackathons ────────────────────────────────────────────
function MineSection({ joinedTeams }: { joinedTeams: Set<string> }) {
  const { navigate } = useRouter();
  const joinedUpcoming = UPCOMING_HACKATHONS.filter((h) => joinedTeams.has(h.id));
  const all = [...joinedUpcoming, ...COMPLETED_HACKATHONS];

  if (all.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No hackathons yet"
        hint="Discover upcoming hackathons matched to your skills and join a team."
        action={<Button variant="navy" size="sm" onClick={() => navigate("/app/hackathons/discover")}>Discover Hackathons</Button>}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">My Hackathons</h2>
          <DemoBadge />
        </div>
        <span className="text-[11px] text-[var(--ss-muted)]">{all.length} total</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {all.map((h) => {
          const completed = h.status === "Completed";
          return (
            <SsCard key={h.id} tone="soft" className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    completed ? "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]" : "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]",
                  )}>
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{h.name}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{h.domain} · Team {h.teamSize}</p>
                  </div>
                </div>
                {completed ? (
                  <SsBadge tone="teal" className="text-[10px]"><CheckCircle2 className="h-2.5 w-2.5" /> Completed</SsBadge>
                ) : (
                  <SsBadge tone="blue" className="text-[10px]">Joined</SsBadge>
                )}
              </div>

              {completed ? (
                <div className="mt-3 space-y-1.5 text-[11px] text-[var(--ss-muted)]">
                  <p><b className="text-[var(--ss-ink-soft)]">Team:</b> {h.team}</p>
                  <p><b className="text-[var(--ss-ink-soft)]">Role:</b> {h.role}</p>
                  <p><b className="text-[var(--ss-ink-soft)]">Project:</b> {h.project}</p>
                  <p><b className="text-[var(--ss-ink-soft)]">Outcome:</b> {h.evaluation}</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-[11px] text-[var(--ss-muted)]">
                  <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> Deadline: {h.deadline}</p>
                  <div className="flex flex-wrap gap-1">
                    {h.requiredSkills.map((s) => (
                      <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </SsCard>
          );
        })}
      </div>
    </motion.section>
  );
}

// ─── My Teams ─────────────────────────────────────────────────
function TeamsSection({ joinedTeams }: { joinedTeams: Set<string> }) {
  const { navigate } = useRouter();
  const teams = UPCOMING_HACKATHONS.filter((h) => joinedTeams.has(h.id));

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Team Yet"
        hint="Find a team matched to your skills and start collaborating."
        action={<Button variant="navy" size="sm" onClick={() => navigate("/app/hackathons/discover")}>Find a Team</Button>}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">My Teams</h2>
          <DemoBadge />
        </div>
        <span className="text-[11px] text-[var(--ss-muted)]">{teams.length} active</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((h) => (
          <SsCard key={h.id} tone="soft" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[var(--ss-ink)]">{h.name}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{h.domain} · Team {h.teamSize}</p>
              </div>
              <SsBadge tone="blue" className="text-[10px]">Team Forming</SsBadge>
            </div>

            <div className="mt-3 flex items-center">
              <div className="flex -space-x-2">
                {["S042", "S051", "S067"].map((id, i) => (
                  <span
                    key={id}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--ss-surface-3)] text-[9px] font-bold text-[var(--ss-ink-soft)]"
                    style={{ zIndex: 10 - i }}
                  >
                    {id}
                  </span>
                ))}
              </div>
              <span className="ml-2 text-[10px] text-[var(--ss-muted)]">3 members · 2 spots open</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-[var(--ss-muted)]">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {h.deadline}</span>
              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {h.match}% match</span>
            </div>

            <div className="mt-3 flex gap-1.5">
              <Button variant="outline" size="sm" className="flex-1 text-[11px]">Open Team Chat</Button>
              <Button variant="navy" size="sm" className="flex-1 text-[11px]">View Brief</Button>
            </div>
          </SsCard>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Submissions ──────────────────────────────────────────────
function SubmissionsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Submissions</h2>
          <DemoBadge />
        </div>
        <span className="text-[11px] text-[var(--ss-muted)]">{DEMO_SUBMISSIONS.length} entries</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-soft">
        {DEMO_SUBMISSIONS.map((s, i) => (
          <div
            key={s.id}
            className={cn("flex items-center gap-3 p-4", i < DEMO_SUBMISSIONS.length - 1 && "border-b border-[var(--ss-border)]")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--ss-ink)]">{s.project}</p>
              <p className="text-[11px] text-[var(--ss-muted)]">{s.hackathon} · {s.team} · {s.date}</p>
            </div>
            <EvidenceStatusBadge status={s.status} />
            <ChevronRight className="h-4 w-4 text-[var(--ss-faint)]" />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Mentorship ────────────────────────────────────────────────
function MentorshipSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Mentor Sessions</h2>
          <DemoBadge />
        </div>
        <span className="text-[11px] text-[var(--ss-muted)]">{DEMO_MENTORSHIP.length} sessions</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_MENTORSHIP.map((m) => (
          <SsCard key={m.id} tone="soft" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]">
                  <Calendar className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{m.mentor}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{m.role}</p>
                </div>
              </div>
              <SsBadge tone={MENTOR_TONE[m.status]} className="text-[10px]">{m.status}</SsBadge>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--ss-ink-soft)]">{m.topic}</p>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--ss-muted)]">
              <CalendarClock className="h-3 w-3" /> {m.schedule}
            </div>

            <div className="mt-3 flex gap-1.5">
              {m.status === "Scheduled" && (
                <Button variant="navy" size="sm" className="flex-1 text-[11px]">Join Session</Button>
              )}
              {m.status === "Pending" && (
                <Button variant="outline" size="sm" className="flex-1 text-[11px]">Confirm Slot</Button>
              )}
              {m.status === "Completed" && (
                <Button variant="outline" size="sm" className="flex-1 text-[11px]">View Notes</Button>
              )}
            </div>
          </SsCard>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Hackathon detail modal ────────────────────────────────────
function HackathonDetailModal({
  hackathon, open, onClose, onJoin, joined,
}: {
  hackathon: Hackathon | null;
  open: boolean;
  onClose: () => void;
  onJoin: (id: string) => void;
  joined: boolean;
}) {
  if (!hackathon) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hackathon.name}
      subtitle={`${hackathon.domain} · ${hackathon.match}% skills match`}
      size="md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button
            variant={joined ? "teal" : "navy"}
            className="flex-1 gap-1.5"
            disabled={joined}
            onClick={() => onJoin(hackathon.id)}
          >
            {joined ? <CheckCircle2 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {joined ? "Team Joined" : "Find Team"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <DemoBadge />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Domain" value={hackathon.domain} />
          <Field label="Team size" value={hackathon.teamSize} />
          <Field label="Deadline" value={hackathon.deadline} />
          <Field label="Match" value={`${hackathon.match}%`} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Required skills</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {hackathon.requiredSkills.map((s) => (
              <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
          <Sparkles className="mr-1 inline h-3 w-3 text-[var(--ss-blue-600)]" />
          SKILL SETU will match you with team members whose evidence complements your skill profile. Once matched, your team can collaborate on the brief, build your submission and request mentor review.
        </div>
        {joined && (
          <p className="rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
            <CheckCircle2 className="mr-1 inline h-3 w-3" /> You have joined this hackathon. View it under My Hackathons.
          </p>
        )}
      </div>
    </Modal>
  );
}
