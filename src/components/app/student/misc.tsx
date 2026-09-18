"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, BellOff, AlertTriangle, Briefcase, Trophy, ClipboardList, Award,
  CalendarClock, Check, CheckCheck, Filter, User, Pencil, Target, GraduationCap,
  Building2, CheckCircle2, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  STUDENT, NOTIFICATIONS, ROLES, type NotificationRow,
} from "@/lib/student-data";
import {
  DashHeader, Modal, EmptyState, DemoBadge, Field, RoleSelector,
} from "@/components/app/student-parts";
import { Button } from "@/components/ui/button";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { cn } from "@/lib/utils";

// ─── Notification type metadata ───────────────────────────────
type NotifType = NotificationRow["type"];
type NotifTone = "blue" | "teal" | "orange";
type NotifGroup = "Skill Gaps" | "Opportunities" | "Hackathons" | "Applications";

const NOTIF_META: Record<NotifType, { icon: LucideIcon; tone: NotifTone; group: NotifGroup }> = {
  "Skill Gap Detected":        { icon: AlertTriangle,  tone: "orange", group: "Skill Gaps" },
  "New Opportunity Match":     { icon: Briefcase,      tone: "blue",   group: "Opportunities" },
  "Hackathon Recommendation":  { icon: Trophy,         tone: "teal",   group: "Hackathons" },
  "Application Update":         { icon: ClipboardList,  tone: "blue",   group: "Applications" },
  "Evidence Added":             { icon: Award,           tone: "teal",   group: "Applications" },
  "Mentor Session":             { icon: CalendarClock,  tone: "orange", group: "Opportunities" },
};

const TONE_COLOR: Record<NotifTone, { bg: string; fg: string }> = {
  blue:   { bg: "var(--ss-blue-50)",   fg: "var(--ss-blue-600)" },
  teal:   { bg: "var(--ss-teal-50)",   fg: "var(--ss-teal-600)" },
  orange: { bg: "var(--ss-orange-50)", fg: "var(--ss-orange-600)" },
};

const FILTERS = ["All", "Skill Gaps", "Opportunities", "Hackathons", "Applications"] as const;
type FilterId = typeof FILTERS[number];

// ─── NotificationsPage (spec §36) ─────────────────────────────
export function NotificationsPage() {
  const { readNotifications, markRead, markAllRead } = useStudentState();
  const [filter, setFilter] = useState<FilterId>("All");

  const filtered = NOTIFICATIONS.filter((n) => {
    if (filter === "All") return true;
    return NOTIF_META[n.type].group === filter;
  });

  const unreadCount = NOTIFICATIONS.filter((n) => !readNotifications.has(n.id)).length;

  return (
    <div className="space-y-6">
      <DashHeader
        title="Notifications"
        subtitle={`${unreadCount} unread of ${NOTIFICATIONS.length} total`}
        icon={Bell}
        accent="#0D9488"
        action={
          <div className="flex items-center gap-2">
            <DemoBadge />
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 text-[11px]" onClick={markAllRead}>
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto scroll-slim rounded-xl border border-[var(--ss-border)] bg-white p-1 shadow-soft">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "text-[var(--ss-muted)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              <Filter className="h-3 w-3" />
              {f}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" hint="Nothing matches the selected filter." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const read = readNotifications.has(n.id);
            const meta = NOTIF_META[n.type];
            const Icon = meta.icon;
            const c = TONE_COLOR[meta.tone];
            return (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => markRead(n.id)}
                className={cn(
                  "relative flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-soft transition-all hover:shadow-lift",
                  read ? "border-[var(--ss-border)] opacity-70" : "border-[var(--ss-blue-600)]/30",
                )}
              >
                {!read && (
                  <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[var(--ss-blue-600)]" />
                )}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ss-faint)]">{n.type}</p>
                    <span className="text-[10px] text-[var(--ss-muted)]">{n.time}</span>
                  </div>
                  <p className={cn("mt-0.5 text-sm font-semibold", read ? "text-[var(--ss-ink-soft)]" : "text-[var(--ss-ink)]")}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--ss-muted)]">{n.detail}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {!read && <span className="h-2 w-2 rounded-full bg-[var(--ss-blue-600)]" />}
                  {read && <Check className="h-3.5 w-3.5 text-[var(--ss-faint)]" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ProfilePage (spec §18) ───────────────────────────────────
export function ProfilePage() {
  const { currentRole } = useStudentState();
  const [roleOpen, setRoleOpen] = useState(false);

  const initials = STUDENT.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  const roleSkills = ROLES.find((r) => r.name === currentRole)?.keySkills ?? [];

  return (
    <div className="space-y-6">
      <DashHeader
        title="My Profile"
        subtitle="View and manage your SKILL SETU profile"
        icon={User}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Profile background header strip (navy gradient + avatar accent) */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-navy-gradient p-6 text-white shadow-soft"
      >
        <div className="bg-dot-grid-dark absolute inset-0 opacity-25" />
        {/* avatar color accent */}
        <div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-40"
          style={{ background: `radial-gradient(circle, ${STUDENT.avatarColor} 0%, transparent 70%)` }}
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lift"
            style={{ backgroundColor: STUDENT.avatarColor, border: "2px solid rgba(255,255,255,0.18)" }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold">{STUDENT.name}</h2>
            <p className="mt-0.5 text-xs text-slate-300">
              <GraduationCap className="mr-1 inline h-3 w-3" /> {STUDENT.id} · {STUDENT.branch} · Year {STUDENT.year}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              <Building2 className="mr-1 inline h-3 w-3" /> {STUDENT.college}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProfileRing value={STUDENT.profileCompletion} color={STUDENT.avatarColor} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Profile Complete</span>
          </div>
        </div>
      </motion.section>

      {/* Personal information */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--ss-blue-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Personal Information</h2>
            <DemoBadge />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" value={STUDENT.name} />
          <Field label="Student ID" value={STUDENT.id} />
          <Field label="Branch" value={STUDENT.branch} />
          <Field label="Year" value={`Year ${STUDENT.year}`} />
          <Field label="College" value={STUDENT.college} />
          <Field label="Location" value={STUDENT.location} />
        </div>
      </SsCard>

      {/* Target role card */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--ss-teal-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Target Role</h2>
            <DemoBadge />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-[11px]" onClick={() => setRoleOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit Role
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]">
            <Target className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-[var(--ss-ink)]">{currentRole}</p>
            <p className="text-[11px] text-[var(--ss-muted)]">Drives your role readiness, gap analysis and opportunity matching.</p>
          </div>
          <SsBadge tone="teal" className="text-[10px]">Configured</SsBadge>
        </div>

        {/* Key skills for the role */}
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Key skills for this role</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {roleSkills.map((s) => (
            <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
          ))}
        </div>
      </SsCard>

      {/* Profile completion meter */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--ss-orange-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Profile Completion</h2>
            <DemoBadge />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--ss-surface-3)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${STUDENT.profileCompletion}%`,
                background: "linear-gradient(90deg, var(--ss-teal-600), var(--ss-blue-600))",
              }}
            />
          </div>
          <span className="text-sm font-bold text-[var(--ss-ink)]">{STUDENT.profileCompletion}%</span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            { label: "Personal Info",           done: true },
            { label: "Skills & Aptitude",      done: true },
            { label: "Evidence & Passport",    done: false },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white p-2.5">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--ss-teal-600)]" />
              ) : (
                <span className="h-4 w-4 rounded-full border-2 border-[var(--ss-line)]" />
              )}
              <span className="text-[11px] font-medium text-[var(--ss-ink-soft)]">{step.label}</span>
            </div>
          ))}
        </div>
      </SsCard>

      {/* Role selector modal (reused from student-parts) */}
      <RoleSelector open={roleOpen} onClose={() => setRoleOpen(false)} />
    </div>
  );
}

// ─── Profile completion ring ────────────────────────────────────
function ProfileRing({ value, color }: { value: number; color: string }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const off = circ - (value / 100) * circ;
  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}
