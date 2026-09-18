"use client";

/**
 * SKILL SETU — Phase 2 · Student Portal · Career Pages
 * Master spec §25–29 (Jobs, Internships, Projects, Industry Learning)
 * + §12–13 (Why This Opportunity?) + §26 (Job Details modal).
 *
 * Single source of truth: src/lib/student-data.ts (JOBS/INTERNSHIPS/PROJECTS/
 * INDUSTRY_LEARNING/BEST_MATCH, type Opportunity, findOpp).
 * Stateful overlay: src/lib/student-state.ts (apply, toggleSave, applied, saved).
 * Router: src/lib/router.ts (useRouter().navigate("/app/career/<section>")).
 * Pattern reference: src/components/app/student/dashboard.tsx.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, GraduationCap, FolderKanban, BookOpen, MapPin, Clock, Building2,
  Users, User, Bookmark, CheckCircle2, ListChecks, ArrowRight, Wallet,
  Calendar, Target, Search, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  JOBS, INTERNSHIPS, PROJECTS, INDUSTRY_LEARNING, type Opportunity,
} from "@/lib/student-data";
import {
  DashHeader, Modal, EmptyState, DemoBadge, MatchBadge, Field,
} from "@/components/app/student-parts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Section config ─────────────────────────────────────────────
type Section = "jobs" | "internships" | "projects" | "learning";

const SECTIONS: { key: Section; label: string; icon: LucideIcon; accent: string }[] = [
  { key: "jobs",         label: "Jobs",              icon: Briefcase,     accent: "#0D9488" },
  { key: "internships",  label: "Internships",        icon: GraduationCap, accent: "#2563EB" },
  { key: "projects",     label: "Projects",           icon: FolderKanban,  accent: "#EA580C" },
  { key: "learning",     label: "Industry Learning",  icon: BookOpen,      accent: "#0F2547" },
];

const HEADERS: Record<Section, { title: string; subtitle: string }> = {
  jobs:        { title: "Jobs",             subtitle: "Full-time roles matched to your skill profile" },
  internships: { title: "Internships",       subtitle: "Hands-on internships aligned with your target role" },
  projects:    { title: "Industry Projects", subtitle: "Real-world industry projects with mentorship" },
  learning:    { title: "Industry Learning", subtitle: "Upskill through training, workshops, certifications & mentorship" },
};

// ─── Public export (AppShell imports this) ─────────────────────
export function CareerPage({ section }: { section: Section }) {
  const { navigate } = useRouter();
  const current = SECTIONS.find((s) => s.key === section)!;
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      <DashHeader
        title={HEADERS[section].title}
        subtitle={HEADERS[section].subtitle}
        icon={Icon}
        accent={current.accent}
        action={<DemoBadge />}
      />

      {/* Section switcher (spec §25–29) */}
      <nav
        aria-label="Career section switcher"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-[var(--ss-border)] bg-white p-1.5 shadow-soft sm:grid-cols-4"
      >
        {SECTIONS.map((s) => {
          const active = s.key === section;
          const TabIcon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => navigate(`/app/career/${s.key}`)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "text-[var(--ss-muted)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              <TabIcon className="h-4 w-4" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {section === "jobs" && <JobsGrid />}
      {section === "internships" && <InternshipsGrid />}
      {section === "projects" && <ProjectsGrid />}
      {section === "learning" && <LearningGrid />}
    </div>
  );
}

// ─── Jobs (spec §25) ───────────────────────────────────────────
function JobsGrid() {
  const { applied, apply, saved, toggleSave } = useStudentState();
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [why, setWhy] = useState<Opportunity | null>(null);

  if (JOBS.length === 0) {
    return <EmptyState icon={Search} title="No jobs available" hint="New roles matched to your profile will appear here." />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {JOBS.map((job, i) => {
          const isApplied = applied.has(job.id);
          const isSaved = saved.has(job.id);
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex flex-col rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{job.title}</p>
                    <p className="text-[11px] text-[var(--ss-muted)]">{job.company} · {job.mode} · {job.type}</p>
                  </div>
                </div>
                <MatchBadge score={job.match} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-[var(--ss-muted)]">
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-[var(--ss-faint)]" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Wallet className="h-3 w-3 text-[var(--ss-faint)]" /> {job.compensation}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-[var(--ss-faint)]" /> Apply by {job.deadline}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetail(job)}>
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => toggleSave(job.id)}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                  aria-pressed={isSaved}
                >
                  <Bookmark className={cn("h-4 w-4", isSaved ? "fill-[var(--ss-blue-600)] text-[var(--ss-blue-600)]" : "text-[var(--ss-faint)]")} />
                </Button>
                <Button
                  variant="navy"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={isApplied}
                  onClick={() => apply(job.id)}
                >
                  {isApplied && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isApplied ? "Applied" : "Apply Now"}
                </Button>
              </div>

              <button
                onClick={() => setWhy(job)}
                className="mt-2 self-start text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline"
              >
                Why Match? →
              </button>

              {isApplied && (
                <p className="mt-2 rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
                  <CheckCircle2 className="mr-1 inline h-3 w-3" /> Successfully applied (prototype workflow — no external application created).
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <OppDetailModal opp={detail} onClose={() => setDetail(null)} kind="job" />
      <WhyMatchModal opp={why} onClose={() => setWhy(null)} />
    </>
  );
}

// ─── Internships (spec §27) ────────────────────────────────────
function InternshipsGrid() {
  const { applied, apply, saved, toggleSave } = useStudentState();
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [why, setWhy] = useState<Opportunity | null>(null);

  if (INTERNSHIPS.length === 0) {
    return <EmptyState icon={Search} title="No internships available" hint="Internships matched to your profile will appear here." />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTERNSHIPS.map((int, i) => {
          const isApplied = applied.has(int.id);
          const isSaved = saved.has(int.id);
          return (
            <motion.div
              key={int.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex flex-col rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{int.title}</p>
                    <p className="text-[11px] text-[var(--ss-muted)]">{int.company} · {int.mode} · {int.type}</p>
                  </div>
                </div>
                <MatchBadge score={int.match} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-[var(--ss-muted)]">
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-[var(--ss-faint)]" /> {int.location}</span>
                {int.duration && <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-[var(--ss-faint)]" /> {int.duration}</span>}
                <span className="flex items-center gap-1.5"><Wallet className="h-3 w-3 text-[var(--ss-faint)]" /> Stipend: {int.compensation}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-[var(--ss-faint)]" /> Apply by {int.deadline}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {int.requiredSkills.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetail(int)}>
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => toggleSave(int.id)}
                  aria-label={isSaved ? "Unsave internship" : "Save internship"}
                  aria-pressed={isSaved}
                >
                  <Bookmark className={cn("h-4 w-4", isSaved ? "fill-[var(--ss-blue-600)] text-[var(--ss-blue-600)]" : "text-[var(--ss-faint)]")} />
                </Button>
                <Button
                  variant="navy"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={isApplied}
                  onClick={() => apply(int.id)}
                >
                  {isApplied && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isApplied ? "Applied" : "Apply"}
                </Button>
              </div>

              <button
                onClick={() => setWhy(int)}
                className="mt-2 self-start text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline"
              >
                Why Match? →
              </button>

              {isApplied && (
                <p className="mt-2 rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
                  <CheckCircle2 className="mr-1 inline h-3 w-3" /> Successfully applied (prototype workflow — no external application created).
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <OppDetailModal opp={detail} onClose={() => setDetail(null)} kind="internship" />
      <WhyMatchModal opp={why} onClose={() => setWhy(null)} />
    </>
  );
}

// ─── Projects (spec §28) ───────────────────────────────────────
function ProjectsGrid() {
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [why, setWhy] = useState<Opportunity | null>(null);

  if (PROJECTS.length === 0) {
    return <EmptyState icon={Search} title="No projects available" hint="Industry projects matched to your skills will appear here." />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((prj, i) => (
          <motion.div
            key={prj.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="flex flex-col rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]">
                  <FolderKanban className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{prj.title}</p>
                  <p className="text-[11px] text-[var(--ss-muted)]"><Building2 className="mr-1 inline h-3 w-3" />{prj.company}</p>
                </div>
              </div>
              <MatchBadge score={prj.match} />
            </div>

            {prj.problem && (
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--ss-muted)]">
                <span className="font-semibold text-[var(--ss-ink-soft)]">Problem: </span>{prj.problem}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {prj.requiredSkills.map((s) => (
                <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-[var(--ss-muted)]">
              {prj.duration && <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-[var(--ss-faint)]" /> {prj.duration}</span>}
              {prj.teamSize && <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-[var(--ss-faint)]" /> Team of {prj.teamSize}</span>}
              {prj.mentor && <span className="flex items-center gap-1.5"><User className="h-3 w-3 text-[var(--ss-faint)]" /> {prj.mentor}</span>}
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-[var(--ss-faint)]" /> Apply by {prj.deadline}</span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button variant="navy" size="sm" className="flex-1 gap-1.5" onClick={() => setDetail(prj)}>
                View Project <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[var(--ss-blue-600)]" onClick={() => setWhy(prj)}>
                Why Match?
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <ProjectDetailModal opp={detail} onClose={() => setDetail(null)} />
      <WhyMatchModal opp={why} onClose={() => setWhy(null)} />
    </>
  );
}

// ─── Industry Learning (spec §29) ──────────────────────────────
type LearningFilter = "All" | "Training" | "Workshop" | "Certification" | "Mentorship";
const LEARNING_FILTERS: LearningFilter[] = ["All", "Training", "Workshop", "Certification", "Mentorship"];

function LearningGrid() {
  const [filter, setFilter] = useState<LearningFilter>("All");
  const [enrolled, setEnrolled] = useState<Set<string>>(
    () => new Set(INDUSTRY_LEARNING.filter((l) => l.status === "Enrolled").map((l) => l.id)),
  );
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [why, setWhy] = useState<Opportunity | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? INDUSTRY_LEARNING : INDUSTRY_LEARNING.filter((l) => l.type === filter)),
    [filter],
  );

  const toggleEnroll = (id: string) => {
    setEnrolled((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {LEARNING_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "border border-[var(--ss-border)] bg-white text-[var(--ss-muted)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title={`No ${filter.toLowerCase()}s available`} hint="Try another category or check back later." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => {
            const isEnrolled = enrolled.has(l.id);
            const status = isEnrolled ? "Enrolled" : (l.status ?? "Not started");
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex flex-col rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ss-portal-institution-tint)] text-[var(--ss-navy-900)]">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{l.title}</p>
                      <p className="text-[11px] text-[var(--ss-muted)]">{l.provider ?? l.company} · {l.type}</p>
                    </div>
                  </div>
                  <MatchBadge score={l.match} />
                </div>

                {l.about && (
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[var(--ss-muted)]">{l.about}</p>
                )}

                <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-[var(--ss-muted)]">
                  <span className="flex items-center gap-1.5"><Target className="h-3 w-3 text-[var(--ss-faint)]" /> Skill: {l.requiredSkills.join(", ")}</span>
                  {l.duration && <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-[var(--ss-faint)]" /> {l.duration}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-[var(--ss-faint)]" /> {l.deadline}</span>
                </div>

                <div className="mt-3">
                  <LearningStatusBadge status={status} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetail(l)}>
                    View
                  </Button>
                  {isEnrolled ? (
                    <Button variant="teal" size="sm" className="flex-1 gap-1.5" disabled>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                    </Button>
                  ) : (
                    <Button variant="navy" size="sm" className="flex-1 gap-1.5" onClick={() => toggleEnroll(l.id)}>
                      Enroll
                    </Button>
                  )}
                </div>

                <button
                  onClick={() => setWhy(l)}
                  className="mt-2 self-start text-[11px] font-semibold text-[var(--ss-blue-600)] hover:underline"
                >
                  Why Match? →
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <LearningDetailModal opp={detail} onClose={() => setDetail(null)} enrolled={enrolled} onEnroll={toggleEnroll} />
      <WhyMatchModal opp={why} onClose={() => setWhy(null)} />
    </>
  );
}

// ─── Job / Internship Detail modal (spec §26) ──────────────────
function OppDetailModal({
  opp, onClose, kind,
}: {
  opp: Opportunity | null;
  onClose: () => void;
  kind: "job" | "internship";
}) {
  const { applied, apply, saved, toggleSave } = useStudentState();
  const isApplied = opp ? applied.has(opp.id) : false;
  const isSaved = opp ? saved.has(opp.id) : false;

  return (
    <Modal
      open={!!opp}
      onClose={onClose}
      title={opp?.title}
      subtitle={opp ? `${opp.company} · ${opp.type}` : undefined}
      size="lg"
    >
      {opp && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <MatchBadge score={opp.match} />
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ss-blue-50)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-blue-600)]">
                <Bookmark className="h-2.5 w-2.5 fill-current" /> Saved
              </span>
            )}
          </div>

          {opp.about && (
            <div>
              <SectionLabel icon={Briefcase}>About the role</SectionLabel>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ss-ink-soft)]">{opp.about}</p>
            </div>
          )}

          {opp.responsibilities && opp.responsibilities.length > 0 && (
            <div>
              <SectionLabel icon={ListChecks}>Responsibilities</SectionLabel>
              <ul className="mt-1 space-y-1">
                {opp.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-blue-600)]" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <SectionLabel>Required skills</SectionLabel>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {opp.requiredSkills.map((s) => (
                <span key={s} className="rounded-full bg-[var(--ss-blue-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-blue-600)]">{s}</span>
              ))}
            </div>
          </div>

          {opp.preferredSkills && opp.preferredSkills.length > 0 && (
            <div>
              <SectionLabel>Preferred skills</SectionLabel>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {opp.preferredSkills.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {opp.eligibility && <Field label="Eligibility" value={opp.eligibility} />}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" value={opp.location} />
            <Field label="Mode" value={opp.mode} />
            {opp.duration && <Field label="Duration" value={opp.duration} />}
            <Field label="Compensation" value={opp.compensation} />
            <Field label="Deadline" value={opp.deadline} />
            <Field label="Type" value={opp.type} />
          </div>

          {/* Your Match (spec §26) */}
          <div className="rounded-xl border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon={Sparkles}>Your match</SectionLabel>
              <MatchBadge score={opp.match} />
            </div>
            <ul className="mt-2 space-y-1">
              {opp.whyMatch.map((w) => (
                <li key={w} className="flex items-center gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}
                </li>
              ))}
            </ul>
            {opp.potentialGap && (
              <p className="mt-2 text-[11px] text-[var(--ss-orange-600)]">
                <span className="font-semibold">Skill gap:</span> {opp.potentialGap}
              </p>
            )}
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence considered</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {opp.evidenceConsidered.map((e) => (
                  <span key={e} className="rounded-full border border-[var(--ss-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 p-0"
              onClick={() => toggleSave(opp.id)}
              aria-label={isSaved ? "Unsave" : "Save"}
              aria-pressed={isSaved}
            >
              <Bookmark className={cn("h-4 w-4", isSaved ? "fill-[var(--ss-blue-600)] text-[var(--ss-blue-600)]" : "text-[var(--ss-faint)]")} />
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Close</Button>
            <Button
              variant="navy"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={isApplied}
              onClick={() => apply(opp.id)}
            >
              {isApplied && <CheckCircle2 className="h-3.5 w-3.5" />}
              {isApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>

          {isApplied && (
            <p className="rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
              <CheckCircle2 className="mr-1 inline h-3 w-3" /> Successfully applied (prototype workflow — no external application created).
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Project Detail modal (spec §28) ──────────────────────────
function ProjectDetailModal({ opp, onClose }: { opp: Opportunity | null; onClose: () => void }) {
  return (
    <Modal
      open={!!opp}
      onClose={onClose}
      title={opp?.title}
      subtitle={opp ? `Industry Project · ${opp.company}` : undefined}
      size="lg"
    >
      {opp && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <MatchBadge score={opp.match} />
          </div>

          {opp.about && (
            <div>
              <SectionLabel icon={FolderKanban}>About the project</SectionLabel>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ss-ink-soft)]">{opp.about}</p>
            </div>
          )}

          {opp.problem && (
            <div className="rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-3">
              <SectionLabel icon={Target}>Problem statement</SectionLabel>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ss-ink-soft)]">{opp.problem}</p>
            </div>
          )}

          <div>
            <SectionLabel>Required skills</SectionLabel>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {opp.requiredSkills.map((s) => (
                <span key={s} className="rounded-full bg-[var(--ss-orange-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-orange-600)]">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {opp.duration && <Field label="Duration" value={opp.duration} />}
            {opp.teamSize && <Field label="Team size" value={`Team of ${opp.teamSize}`} />}
            {opp.mentor && <Field label="Mentor" value={opp.mentor} />}
            <Field label="Mode" value={opp.mode} />
            <Field label="Compensation" value={opp.compensation} />
            <Field label="Deadline" value={opp.deadline} />
          </div>

          {/* Your match */}
          <div className="rounded-xl border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon={Sparkles}>Your match</SectionLabel>
              <MatchBadge score={opp.match} />
            </div>
            <ul className="mt-2 space-y-1">
              {opp.whyMatch.map((w) => (
                <li key={w} className="flex items-center gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}
                </li>
              ))}
            </ul>
            {opp.potentialGap && (
              <p className="mt-2 text-[11px] text-[var(--ss-orange-600)]">
                <span className="font-semibold">Skill gap:</span> {opp.potentialGap}
              </p>
            )}
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence considered</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {opp.evidenceConsidered.map((e) => (
                  <span key={e} className="rounded-full border border-[var(--ss-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{e}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            <Button variant="navy" size="sm" className="gap-1.5" onClick={onClose}>
              Express Interest <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Learning Detail modal (spec §29) ──────────────────────────
function LearningDetailModal({
  opp, onClose, enrolled, onEnroll,
}: {
  opp: Opportunity | null;
  onClose: () => void;
  enrolled: Set<string>;
  onEnroll: (id: string) => void;
}) {
  const isEnrolled = opp ? enrolled.has(opp.id) : false;
  return (
    <Modal
      open={!!opp}
      onClose={onClose}
      title={opp?.title}
      subtitle={opp ? `${opp.provider ?? opp.company} · ${opp.type}` : undefined}
      size="md"
    >
      {opp && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <MatchBadge score={opp.match} />
            <LearningStatusBadge status={isEnrolled ? "Enrolled" : (opp.status ?? "Not started")} />
          </div>

          {opp.about && (
            <div>
              <SectionLabel icon={BookOpen}>About</SectionLabel>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ss-ink-soft)]">{opp.about}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Provider" value={opp.provider ?? opp.company} />
            <Field label="Type" value={opp.type} />
            {opp.duration && <Field label="Duration" value={opp.duration} />}
            <Field label="Mode" value={opp.mode} />
            <Field label="Skill" value={opp.requiredSkills.join(", ")} />
            <Field label="Target Role" value="Data Scientist" />
            <Field label="Compensation" value={opp.compensation} />
            <Field label="Deadline" value={opp.deadline} />
          </div>

          {/* Your match */}
          <div className="rounded-xl border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon={Sparkles}>Your match</SectionLabel>
              <MatchBadge score={opp.match} />
            </div>
            <ul className="mt-2 space-y-1">
              {opp.whyMatch.map((w) => (
                <li key={w} className="flex items-center gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence considered</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {opp.evidenceConsidered.map((e) => (
                  <span key={e} className="rounded-full border border-[var(--ss-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{e}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            {isEnrolled ? (
              <Button variant="teal" size="sm" className="gap-1.5" disabled>
                <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
              </Button>
            ) : (
              <Button variant="navy" size="sm" className="gap-1.5" onClick={() => onEnroll(opp.id)}>
                Enroll Now <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Why Match modal (spec §12–13) ─────────────────────────────
function WhyMatchModal({ opp, onClose }: { opp: Opportunity | null; onClose: () => void }) {
  return (
    <Modal
      open={!!opp}
      onClose={onClose}
      title="Why this opportunity?"
      subtitle={opp ? `${opp.title} · ${opp.match}% match` : undefined}
      size="sm"
    >
      {opp && (
        <div className="space-y-3">
          <DemoBadge />

          <div>
            <SectionLabel icon={CheckCircle2}>Alignment</SectionLabel>
            <ul className="mt-1 space-y-1">
              {opp.whyMatch.map((w) => (
                <li key={w} className="flex items-center gap-1.5 text-xs text-[var(--ss-ink-soft)]">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" /> {w}
                </li>
              ))}
            </ul>
          </div>

          {opp.potentialGap && (
            <div className="rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-3">
              <SectionLabel icon={Target}>Potential gap</SectionLabel>
              <p className="mt-0.5 text-sm font-bold text-[var(--ss-ink)]">{opp.potentialGap}</p>
            </div>
          )}

          <div>
            <SectionLabel>Evidence considered</SectionLabel>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {opp.evidenceConsidered.map((e) => (
                <span key={e} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{e}</span>
              ))}
            </div>
          </div>

          <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2.5 text-[11px] leading-relaxed text-[var(--ss-muted)]">
            Match score is calculated from your skill competencies, evidence and role requirements. Use it as directional guidance — not a guarantee of selection.
          </p>
        </div>
      )}
    </Modal>
  );
}

// ─── Helpers ───────────────────────────────────────────────────
function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </p>
  );
}

function LearningStatusBadge({ status }: { status: string }) {
  // Palette only: slate (neutral), teal (enrolled/completed), blue (open), orange (in-progress).
  const map: Record<string, [string, string]> = {
    "Not started":      ["#F1F5F9", "#475569"],
    "Enrolled":         ["#CCFBF1", "#0D9488"],
    "Application open": ["#DBEAFE", "#2563EB"],
    "In Progress":      ["#FED7AA", "#EA580C"],
    "Completed":         ["#CCFBF1", "#0D9488"],
  };
  const [bg, fg] = map[status] ?? ["#F1F5F9", "#475569"];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: bg, color: fg }}
    >
      {status === "Enrolled" && <CheckCircle2 className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}
