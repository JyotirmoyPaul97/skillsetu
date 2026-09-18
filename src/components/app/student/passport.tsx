"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Award, Briefcase, FileText, Code2, GraduationCap,
  ShieldCheck, Trophy, Target, TrendingUp, Info,
  ChevronRight, ExternalLink, GitBranch, Link as LinkIcon, Save,
  CheckCircle2, Calendar, Building2, User, MapPin, Clock, Sparkles,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import {
  STUDENT, READINESS, EVIDENCE, TECHNICAL_SKILLS, SOFT_SKILLS,
  PASSPORT_PROJECTS, CERTIFICATIONS, PASSPORT_INTERNSHIPS, COMPLETED_HACKATHONS,
  ROLES, type ProjectPassport, type CertificationRow, type InternshipPassport,
  type SkillRow, type Verification, type EvidenceRow,
} from "@/lib/student-data";
import {
  DashHeader, Modal, Drawer, EmptyState, DemoBadge, CalcBadge,
  ConfidenceBadge, EvidenceStatusBadge, VerificationBadge, Field,
} from "../student-parts";
import { SsCard, SsBadge, SsSkillBar } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Tab configuration ────────────────────────────────────────────
type PassportTab = "verified" | "projects" | "certifications" | "internships" | "hackathons" | "resume";

const TABS: { key: PassportTab; label: string; icon: typeof ShieldCheck }[] = [
  { key: "verified",      label: "Verified Skills", icon: ShieldCheck },
  { key: "projects",      label: "Projects",        icon: Code2 },
  { key: "certifications",label: "Certifications",   icon: Award },
  { key: "internships",   label: "Internships",      icon: Briefcase },
  { key: "hackathons",    label: "Hackathons",       icon: Trophy },
  { key: "resume",        label: "Resume",           icon: FileText },
];

// ─── Main exported component ───────────────────────────────────────
export function PassportPage({ tab }: { tab: PassportTab }) {
  const { navigate } = useRouter();

  return (
    <div className="space-y-6">
      <DashHeader
        title="Skill Passport"
        subtitle="Your evidence-backed skill profile"
        icon={BookOpen}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Tab switcher */}
      <nav aria-label="Passport tabs" className="flex flex-wrap gap-1.5 overflow-x-auto rounded-2xl border border-[var(--ss-border)] bg-white p-1.5 shadow-soft scroll-slim">
        {TABS.map((t) => {
          const active = t.key === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => navigate(`/app/passport/${t.key}`)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all whitespace-nowrap",
                active
                  ? "bg-[var(--ss-navy-900)] text-white shadow-soft"
                  : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Overview card (shown at top of every tab — spec §30) */}
      <PassportOverview />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {tab === "verified" && <VerifiedSkillsTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "certifications" && <CertificationsTab />}
          {tab === "internships" && <InternshipsTab />}
          {tab === "hackathons" && <HackathonsTab />}
          {tab === "resume" && <ResumeTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Overview card (spec §30) ─────────────────────────────────────
function PassportOverview() {
  const evidenceCount = EVIDENCE.length;
  const skillEvidenceSum = TECHNICAL_SKILLS.reduce((s, k) => s + k.evidenceCount, 0);

  return (
    <SsCard tone="soft" className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]">
            <User className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Passport Overview</h2>
          <DemoBadge />
        </div>
        <VerificationBadge v="Pending" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Student name + ID */}
        <div className="rounded-xl border border-[var(--ss-border)] bg-white p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">
            <User className="h-3 w-3" /> Student
          </div>
          <p className="mt-1.5 text-sm font-bold text-[var(--ss-ink)]">{STUDENT.name}</p>
          <p className="text-[11px] text-[var(--ss-muted)]">{STUDENT.id} · {STUDENT.branch}</p>
        </div>

        {/* Target Role */}
        <div className="rounded-xl border border-[var(--ss-border)] bg-white p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">
            <Target className="h-3 w-3" /> Target Role
          </div>
          <p className="mt-1.5 text-sm font-bold text-[var(--ss-ink)]">{STUDENT.targetRole}</p>
          <p className="text-[11px] text-[var(--ss-muted)]">Configured</p>
        </div>

        {/* Role Readiness */}
        <div className="rounded-xl border border-[var(--ss-border)] bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">
              <TrendingUp className="h-3 w-3" /> Readiness
            </span>
            <CalcBadge>Calc.</CalcBadge>
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-gradient-nbt">{READINESS.displayed}%</p>
          <p className="text-[11px] text-[var(--ss-muted)]">{READINESS.lastCalculated}</p>
        </div>

        {/* Evidence count */}
        <div className="rounded-xl border border-[var(--ss-border)] bg-white p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">
            <Award className="h-3 w-3" /> Evidence
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-[var(--ss-teal-600)]">{evidenceCount}</p>
          <p className="text-[11px] text-[var(--ss-muted)]">{skillEvidenceSum} skill rows</p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ss-muted)]">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-faint)]" />
        Passport data shown is controlled DEMO DATA for S042. Verification of evidence requires faculty/industry review — submitting evidence does not automatically verify it.
      </p>
    </SsCard>
  );
}

// ─── Verified Skills tab (spec §30) ───────────────────────────────
function VerifiedSkillsTab() {
  const [drawerSkill, setDrawerSkill] = useState<SkillRow | null>(null);

  // Derive verification status per skill from EVIDENCE (any evidence with verification="Verified" marks the skill verified)
  const verifiedSkillNames = useMemo(() => {
    const set = new Set<string>();
    for (const e of EVIDENCE) if (e.verification === "Verified") set.add(e.skill.toLowerCase());
    return set;
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--ss-teal-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Technical Skills</h2>
            <DemoBadge />
          </div>
          <p className="text-[11px] text-[var(--ss-muted)]">{TECHNICAL_SKILLS.length} skills</p>
        </div>

        <div className="space-y-2">
          {TECHNICAL_SKILLS.map((s) => {
            const verified = verifiedSkillNames.has(s.name.toLowerCase());
            return (
              <button
                key={s.name}
                onClick={() => setDrawerSkill(s)}
                className="flex w-full items-center gap-3 rounded-xl border border-[var(--ss-border)] p-3 text-left transition-all hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]"
              >
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  verified ? "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]" : "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]",
                )}>
                  {verified ? <ShieldCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[var(--ss-ink)]">{s.name}</p>
                    <span className="text-sm font-extrabold text-[var(--ss-ink)]">{s.score}<span className="text-[11px] font-medium text-[var(--ss-faint)]">/100</span></span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <ConfidenceBadge level={s.confidence} />
                    <VerificationBadge v={verified ? "Verified" : "Pending"} />
                    <span className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{s.evidenceCount} evidence</span>
                    <span className="text-[10px] text-[var(--ss-faint)]">Updated {s.lastUpdated}</span>
                  </div>
                </div>

                <div className="hidden w-32 shrink-0 sm:block">
                  <SsSkillBar label="" level={s.score} target={80} accent={verified ? "var(--ss-teal-600)" : "var(--ss-blue-600)"} />
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--ss-faint)]" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Soft skills summary */}
      <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--ss-blue-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Soft Skills</h2>
            <DemoBadge />
          </div>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SOFT_SKILLS.map((s) => (
            <div key={s.name} className="rounded-lg border border-[var(--ss-border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--ss-ink)]">{s.name}</p>
                <span className="text-xs font-bold text-[var(--ss-blue-600)]">{s.score}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <ConfidenceBadge level={s.confidence} />
                <span className="text-[10px] text-[var(--ss-faint)]">{s.evidenceCount} evidence</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SkillDetailDrawer skill={drawerSkill} open={!!drawerSkill} onClose={() => setDrawerSkill(null)} />
    </div>
  );
}

// ─── Skill detail drawer ──────────────────────────────────────────
function SkillDetailDrawer({ skill, open, onClose }: { skill: SkillRow | null; open: boolean; onClose: () => void }) {
  const relatedEvidence = useMemo(() => {
    if (!skill) return [];
    return EVIDENCE.filter((e) => e.skill.toLowerCase() === skill.name.toLowerCase());
  }, [skill]);

  return (
    <Drawer open={open} onClose={onClose} title="Skill Details" subtitle={skill?.name}>
      {skill && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DemoBadge />
            <VerificationBadge v={relatedEvidence.some((e) => e.verification === "Verified") ? "Verified" : "Pending"} />
          </div>

          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
            <div className="flex items-end justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Competency</p>
              <p className="text-3xl font-extrabold text-[var(--ss-blue-600)]">{skill.score}<span className="text-sm text-[var(--ss-faint)]">/100</span></p>
            </div>
            <div className="mt-2">
              <SsSkillBar label="" level={skill.score} target={80} accent="var(--ss-blue-600)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Evidence Count" value={`${skill.evidenceCount}`} />
            <Field label="Last Updated" value={skill.lastUpdated} />
            <Field label="Role Importance" value={`${skill.roleImportance}%`} />
            <Field label="Contribution" value={skill.contribution.toFixed(2)} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Evidence Confidence</p>
            <div className="mt-1"><ConfidenceBadge level={skill.confidence} /></div>
          </div>

          {/* Related evidence */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Related Evidence ({relatedEvidence.length})</p>
            {relatedEvidence.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--ss-muted)]">No direct evidence linked for this skill.</p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {relatedEvidence.map((e: EvidenceRow) => (
                  <li key={e.id} className="rounded-lg border border-[var(--ss-border)] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--ss-ink)]">{e.source}</p>
                      <EvidenceStatusBadge status={e.status} />
                    </div>
                    <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">{e.date} · {e.time}{e.score !== null ? ` · ${e.score}/100` : ""}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
            <Info className="mr-1 inline h-3 w-3" />
            Skill verification requires faculty/industry review of the linked evidence. Evidence submission alone does not verify a skill.
          </div>

          <Button variant="navy" className="w-full" onClick={onClose}>Close</Button>
        </div>
      )}
    </Drawer>
  );
}

// ─── Projects tab (spec §31) ──────────────────────────────────────
function ProjectsTab() {
  const [viewProject, setViewProject] = useState<ProjectPassport | null>(null);
  const [githubProject, setGithubProject] = useState<ProjectPassport | null>(null);

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Projects</h2>
          <DemoBadge />
          <span className="ml-auto text-[11px] text-[var(--ss-muted)]">{PASSPORT_PROJECTS.length} projects</span>
        </div>

        {PASSPORT_PROJECTS.length === 0 ? (
          <EmptyState icon={Code2} title="No projects yet" hint="Add a project to start building evidence." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {PASSPORT_PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} onView={() => setViewProject(p)} onAddGithub={() => setGithubProject(p)} />
            ))}
          </div>
        )}
      </section>

      <ProjectDetailModal project={viewProject} open={!!viewProject} onClose={() => setViewProject(null)} />
      <GithubLinkModal
        key={githubProject?.id ?? "none"}
        project={githubProject}
        open={!!githubProject}
        onClose={() => setGithubProject(null)}
      />
    </div>
  );
}

function ProjectCard({ project, onView, onAddGithub }: { project: ProjectPassport; onView: () => void; onAddGithub: () => void }) {
  const { githubLinks } = useStudentState();
  const saved = githubLinks[project.id];

  // Prefer the saved link from state, fall back to the static demo value
  const github = saved?.github ?? project.github ?? "";
  const liveDemo = saved?.liveDemo ?? project.liveDemo ?? "";

  return (
    <SsCard tone="soft" className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--ss-ink)]">{project.name}</p>
          <p className="text-[10px] text-[var(--ss-muted)]">{project.date} · {project.role}</p>
        </div>
        <VerificationBadge v={project.verification} />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[var(--ss-ink-soft)]">{project.description}</p>

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Technology</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.technology.map((t) => (
              <SsBadge key={t} tone="blue" className="text-[10px]">{t}</SsBadge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Skills</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.skills.map((s) => (
              <SsBadge key={s} tone="teal" className="text-[10px]">{s}</SsBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--ss-muted)]">
        <span><b className="text-[var(--ss-ink-soft)]">Role:</b> {project.role}</span>
        <span><b className="text-[var(--ss-ink-soft)]">Contribution:</b> {project.contribution}</span>
      </div>

      {/* GitHub / Live Demo (if set) */}
      {(github || liveDemo) && (
        <div className="mt-3 space-y-1.5 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-2.5">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ss-blue-600)] hover:underline">
              <GitBranch className="h-3 w-3 shrink-0" />
              <span className="truncate">{github}</span>
              <ExternalLink className="ml-auto h-3 w-3 shrink-0" />
            </a>
          )}
          {liveDemo && (
            <a href={liveDemo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ss-teal-600)] hover:underline">
              <LinkIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{liveDemo}</span>
              <ExternalLink className="ml-auto h-3 w-3 shrink-0" />
            </a>
          )}
          <p className="text-[10px] text-[var(--ss-muted)]"><Info className="mr-0.5 inline h-2.5 w-2.5" />Links saved — verification still <b>Pending</b>.</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-[11px]" onClick={onView}>View Project</Button>
        <Button variant="navy" size="sm" className="flex-1 gap-1.5 text-[11px]" onClick={onAddGithub}>
          {github ? <Save className="h-3 w-3" /> : <GitBranch className="h-3 w-3" />}
          {github ? "Edit Links" : "Add GitHub Link"}
        </Button>
      </div>
    </SsCard>
  );
}

// ─── Project detail modal ─────────────────────────────────────────
function ProjectDetailModal({ project, open, onClose }: { project: ProjectPassport | null; open: boolean; onClose: () => void }) {
  const { githubLinks } = useStudentState();
  if (!project) return null;
  const saved = githubLinks[project.id];
  const github = saved?.github ?? project.github ?? "";
  const liveDemo = saved?.liveDemo ?? project.liveDemo ?? "";

  return (
    <Modal open={open} onClose={onClose} title={project.name} subtitle={project.role} size="md">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DemoBadge />
          <VerificationBadge v={project.verification} />
        </div>
        <Field label="Description" value={project.description} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" value={project.date} />
          <Field label="Role" value={project.role} />
          <Field label="Contribution" value={project.contribution} />
          <Field label="Verification" value={project.verification} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Technology</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.technology.map((t) => <SsBadge key={t} tone="blue" className="text-[10px]">{t}</SsBadge>)}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Skills demonstrated</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.skills.map((s) => <SsBadge key={s} tone="teal" className="text-[10px]">{s}</SsBadge>)}
          </div>
        </div>
        {(github || liveDemo) && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Links</p>
            <div className="mt-1 space-y-1">
              {github && <p className="text-xs text-[var(--ss-blue-600)] break-all">{github}</p>}
              {liveDemo && <p className="text-xs text-[var(--ss-teal-600)] break-all">{liveDemo}</p>}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
          <Info className="mr-1 inline h-3 w-3" />
          Adding a GitHub link does not verify the project. Verification requires faculty/industry review.
        </div>
        <Button variant="navy" className="w-full" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

// ─── GitHub link modal (stateful — spec §39) ─────────────────────
function GithubLinkModal({ project, open, onClose }: { project: ProjectPassport | null; open: boolean; onClose: () => void }) {
  const { githubLinks, saveGithub } = useStudentState();
  // Lazy initializers — component remounts via `key={project?.id}` when the
  // selected project changes, so these run fresh each time the modal opens.
  const [github, setGithub] = useState<string>(() => {
    if (!project) return "";
    const existing = githubLinks[project.id];
    return existing?.github ?? project.github ?? "";
  });
  const [liveDemo, setLiveDemo] = useState<string>(() => {
    if (!project) return "";
    const existing = githubLinks[project.id];
    return existing?.liveDemo ?? project.liveDemo ?? "";
  });
  const [saved, setSaved] = useState(false);

  if (!project) return null;

  const handleSave = () => {
    saveGithub(project.id, github.trim(), liveDemo.trim());
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={githubLinks[project.id] ? "Edit Project Links" : "Add GitHub Link"}
      subtitle={project.name}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="navy" onClick={handleSave} disabled={saved}>
            {saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save Links</>}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <DemoBadge />
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">GitHub Repository URL</label>
          <Input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/username/project"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Live Demo URL (optional)</label>
          <Input
            value={liveDemo}
            onChange={(e) => setLiveDemo(e.target.value)}
            placeholder="https://my-demo.example.com"
            className="mt-1"
          />
        </div>
        <div className="rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-3 text-[11px] leading-relaxed text-[var(--ss-ink-soft)]">
          <Info className="mr-1 inline h-3 w-3 text-[var(--ss-orange-600)]" />
          Adding a GitHub link <b>does not verify</b> the project. Verification requires faculty/industry review. After saving, the links will be shown on the project card while verification remains <b>Pending</b>.
        </div>
        {saved && (
          <p className="rounded-lg bg-[var(--ss-teal-50)] px-3 py-1.5 text-[11px] font-medium text-[var(--ss-teal-600)]">
            <CheckCircle2 className="mr-1 inline h-3 w-3" /> Links saved to this project (frontend prototype state).
          </p>
        )}
      </div>
    </Modal>
  );
}

// ─── Certifications tab (spec §32) ────────────────────────────────
function CertificationsTab() {
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--ss-blue-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Certifications</h2>
          <DemoBadge />
        </div>
        <p className="text-[11px] text-[var(--ss-muted)]">{CERTIFICATIONS.length} items</p>
      </div>

      {CERTIFICATIONS.length === 0 ? (
        <EmptyState icon={Award} title="No certifications yet" hint="Upload a certification to start building evidence." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--ss-border)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--ss-surface-2)] text-[10px] uppercase tracking-wide text-[var(--ss-muted)]">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Certification</th>
                <th className="px-3 py-2.5 font-semibold">Issuer</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Credential ID</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {CERTIFICATIONS.map((c: CertificationRow) => (
                <tr key={c.id} className="border-t border-[var(--ss-border)] align-top">
                  <td className="px-3 py-3 font-semibold text-[var(--ss-ink)]">{c.name}</td>
                  <td className="px-3 py-3 text-[var(--ss-ink-soft)]">{c.issuer}</td>
                  <td className="px-3 py-3 text-[var(--ss-muted)]">{c.date}</td>
                  <td className="px-3 py-3 font-mono text-[var(--ss-ink-soft)]">{c.credentialId}</td>
                  <td className="px-3 py-3"><CertStatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ss-muted)]">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-faint)]" />
        Statuses are distinct: <b>Uploaded</b> means the certificate file is attached; <b>Pending Verification</b> means it is awaiting faculty/industry review; <b>Verified</b> means it has been reviewed. Uploading is not the same as being verified.
      </p>
    </section>
  );
}

// Distinct certification status badge (Uploaded ≠ Verified)
function CertStatusBadge({ status }: { status: CertificationRow["status"] }) {
  const map: Record<CertificationRow["status"], [string, string]> = {
    "Uploaded":            ["#F1F5F9", "#475569"],
    "Pending Verification":["#FEF3C7", "#B45309"],
    "Verified":            ["#CCFBF1", "#0D9488"],
  };
  const [bg, fg] = map[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: bg, color: fg }}>
      {status === "Verified" && <CheckCircle2 className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}

// ─── Internships tab (spec §33) ───────────────────────────────────
function InternshipsTab() {
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[var(--ss-teal-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Internships</h2>
          <DemoBadge />
        </div>
        <p className="text-[11px] text-[var(--ss-muted)]">{PASSPORT_INTERNSHIPS.length} items</p>
      </div>

      {PASSPORT_INTERNSHIPS.length === 0 ? (
        <EmptyState icon={Briefcase} title="No internships yet" hint="Internships you complete will appear here." />
      ) : (
        <div className="space-y-3">
          {PASSPORT_INTERNSHIPS.map((i: InternshipPassport) => (
            <SsCard key={i.id} tone="soft" className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{i.role}</p>
                  <p className="text-[11px] text-[var(--ss-muted)]">
                    <Building2 className="mr-1 inline h-3 w-3" />{i.company}
                    <span className="mx-1">·</span>
                    <Clock className="inline h-3 w-3" /> {i.duration}
                  </p>
                </div>
                <VerificationBadge v={i.verification} />
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Skills demonstrated</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {i.skills.map((s) => <SsBadge key={s} tone="teal" className="text-[10px]">{s}</SsBadge>)}
                </div>
              </div>

              <div className="mt-3 rounded-lg border-l-2 border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-blue-600)]">Supervisor Feedback</p>
                <p className="mt-1 text-xs italic leading-relaxed text-[var(--ss-ink-soft)]">&ldquo;{i.feedback}&rdquo;</p>
              </div>
            </SsCard>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Hackathons tab (spec §34) ───────────────────────────────────
function HackathonsTab() {
  return (
    <section className="rounded-2xl border border-[var(--ss-border)] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--ss-orange-600)]" />
          <h2 className="text-sm font-bold text-[var(--ss-ink)]">Completed Hackathons</h2>
          <DemoBadge />
        </div>
        <p className="text-[11px] text-[var(--ss-muted)]">{COMPLETED_HACKATHONS.length} items</p>
      </div>

      {COMPLETED_HACKATHONS.length === 0 ? (
        <EmptyState icon={Trophy} title="No completed hackathons" hint="Your completed hackathons will appear here." />
      ) : (
        <div className="space-y-3">
          {COMPLETED_HACKATHONS.map((h) => (
            <SsCard key={h.id} tone="soft" className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{h.name}</p>
                  <p className="text-[11px] text-[var(--ss-muted)]">
                    <Trophy className="mr-1 inline h-3 w-3" />{h.domain}
                    <span className="mx-1">·</span>
                    <Calendar className="inline h-3 w-3" /> {h.deadline}
                    <span className="mx-1">·</span>
                    Team {h.teamSize}
                  </p>
                </div>
                {h.evidenceStatus && <EvidenceStatusBadge status={h.evidenceStatus} />}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Problem</p>
                  <p className="mt-1 text-xs text-[var(--ss-ink-soft)]">{h.problem}</p>
                </div>
                <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Project</p>
                  <p className="mt-1 text-xs text-[var(--ss-ink-soft)]">{h.project}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--ss-muted)] sm:grid-cols-4">
                <span><b className="text-[var(--ss-ink-soft)]">Team:</b> {h.team}</span>
                <span><b className="text-[var(--ss-ink-soft)]">Role:</b> {h.role}</span>
                <span className="sm:col-span-2"><b className="text-[var(--ss-ink-soft)]">Evaluation:</b> {h.evaluation}</span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {h.requiredSkills.map((s) => <SsBadge key={s} tone="blue" className="text-[10px]">{s}</SsBadge>)}
                </div>
              </div>
            </SsCard>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ss-muted)]">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-faint)]" />
        This page will later consume the real Hackathon system. For now, completed hackathon records are shown as controlled DEMO DATA.
      </p>
    </section>
  );
}

// ─── Resume tab (spec §35) — Resume Builder ──────────────────────
function ResumeTab() {
  const { currentRole, setRole } = useStudentState();

  // Demo alignment score (not an ATS score)
  const alignmentScore = 72;

  // Derive achievements only from real data (hackathon evaluations + verified certs)
  const achievements = useMemo(() => {
    const list: string[] = [];
    for (const h of COMPLETED_HACKATHONS) if (h.evaluation) list.push(`${h.evaluation} — ${h.name}`);
    for (const c of CERTIFICATIONS) if (c.status === "Verified") list.push(`${c.name} — ${c.issuer} (Verified)`);
    return list;
  }, []);

  return (
    <div className="space-y-4">
      {/* Top control row */}
      <SsCard tone="soft" className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--ss-blue-600)]" />
            <h2 className="text-sm font-bold text-[var(--ss-ink)]">Resume Builder</h2>
            <DemoBadge />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="resume-role" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">Target Role</label>
            <select
              id="resume-role"
              value={currentRole}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-[var(--ss-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ss-ink)] shadow-xs focus:border-[var(--ss-blue-600)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-blue-600)]/30"
            >
              {ROLES.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>
        </div>
      </SsCard>

      {/* Alignment score card */}
      <SsCard tone="soft" className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Resume Alignment Score</p>
              <CalcBadge>Demo</CalcBadge>
            </div>
            <p className="mt-1 text-4xl font-extrabold text-gradient-nbt">{alignmentScore}%</p>
            <p className="mt-1 text-[11px] text-[var(--ss-muted)]">For target role: <b className="text-[var(--ss-ink-soft)]">{currentRole}</b></p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
              <Info className="mr-1 inline h-3 w-3 text-[var(--ss-blue-600)]" />
              <b>Not an ATS score.</b> This is a demo alignment indicator that reflects how closely the resume content matches the selected target role, based on the available evidence in your Skill Passport. It does not guarantee recruiter or ATS outcomes.
            </div>
          </div>
        </div>
      </SsCard>

      {/* Resume preview */}
      <SsCard tone="flat" className="overflow-hidden p-0">
        <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Resume Preview</p>
            <DemoBadge />
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* Header */}
          <ResumeHeader />

          {/* Summary */}
          <ResumeSection title="Summary" icon={FileText}>
            <p className="text-xs leading-relaxed text-[var(--ss-ink-soft)]">
              Third-year B.Tech {STUDENT.branch} student at {STUDENT.college}, targeting a <b>{currentRole}</b> role. Demonstrated strengths in Python, SQL and Problem Solving with growing evidence in Machine Learning and Statistics. Built end-to-end ML pipelines and analytics dashboards as portfolio evidence.
            </p>
          </ResumeSection>

          {/* Education */}
          <ResumeSection title="Education" icon={GraduationCap}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[var(--ss-ink)]">{STUDENT.college}</p>
                <p className="text-[11px] text-[var(--ss-muted)]">B.Tech · {STUDENT.branch} · Year {STUDENT.year}</p>
              </div>
              <p className="text-[11px] text-[var(--ss-faint)]"><MapPin className="mr-1 inline h-3 w-3" />{STUDENT.location}</p>
            </div>
          </ResumeSection>

          {/* Skills */}
          <ResumeSection title="Skills" icon={ShieldCheck}>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {TECHNICAL_SKILLS.map((s) => (
                <div key={s.name}>
                  <SsSkillBar label={s.name} level={s.score} target={80} accent="var(--ss-blue-600)" right={<span className="text-[10px] text-[var(--ss-faint)]">{s.evidenceCount} ev.</span>} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {SOFT_SKILLS.map((s) => (
                <SsBadge key={s.name} tone="neutral" className="text-[10px]">{s.name} · {s.score}</SsBadge>
              ))}
            </div>
          </ResumeSection>

          {/* Projects */}
          <ResumeSection title="Projects" icon={Code2}>
            <div className="space-y-2.5">
              {PASSPORT_PROJECTS.map((p) => (
                <div key={p.id} className="rounded-lg border border-[var(--ss-border)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--ss-ink)]">{p.name}</p>
                    <span className="text-[10px] text-[var(--ss-faint)]">{p.date} · {p.role}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--ss-ink-soft)]">{p.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {projectTechList(p).map((t) => <SsBadge key={t} tone="blue" className="text-[9px]">{t}</SsBadge>)}
                  </div>
                </div>
              ))}
            </div>
          </ResumeSection>

          {/* Internships */}
          <ResumeSection title="Internships" icon={Briefcase}>
            <div className="space-y-2.5">
              {PASSPORT_INTERNSHIPS.map((i) => (
                <div key={i.id} className="rounded-lg border border-[var(--ss-border)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--ss-ink)]">{i.role} — {i.company}</p>
                    <span className="text-[10px] text-[var(--ss-faint)]">{i.duration}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {i.skills.map((s) => <SsBadge key={s} tone="teal" className="text-[9px]">{s}</SsBadge>)}
                  </div>
                </div>
              ))}
            </div>
          </ResumeSection>

          {/* Hackathons */}
          <ResumeSection title="Hackathons" icon={Trophy}>
            <div className="space-y-2.5">
              {COMPLETED_HACKATHONS.map((h) => (
                <div key={h.id} className="rounded-lg border border-[var(--ss-border)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--ss-ink)]">{h.name}</p>
                    <span className="text-[10px] text-[var(--ss-faint)]">{h.deadline}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--ss-muted)]">{h.project} · {h.role} · {h.evaluation}</p>
                </div>
              ))}
            </div>
          </ResumeSection>

          {/* Certifications */}
          <ResumeSection title="Certifications" icon={Award}>
            <ul className="space-y-1">
              {CERTIFICATIONS.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-2 text-[11px]">
                  <span className="text-[var(--ss-ink-soft)]"><b className="text-[var(--ss-ink)]">{c.name}</b> — {c.issuer}</span>
                  <span className="shrink-0 text-[var(--ss-faint)]">{c.date}</span>
                </li>
              ))}
            </ul>
          </ResumeSection>

          {/* Achievements (derived only from real data) */}
          <ResumeSection title="Achievements" icon={TrendingUp}>
            {achievements.length === 0 ? (
              <p className="text-[11px] italic text-[var(--ss-muted)]">No verified achievements yet.</p>
            ) : (
              <ul className="space-y-1">
                {achievements.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--ss-ink-soft)]">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </ResumeSection>
        </div>
      </SsCard>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ss-muted)]">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-faint)]" />
        This resume builder only shows data that exists in your Skill Passport — it does not invent experience. All values are controlled DEMO DATA for S042.
      </p>
    </div>
  );
}

function ResumeHeader() {
  return (
    <div className="border-b border-[var(--ss-border)] pb-4">
      <p className="text-xl font-extrabold text-[var(--ss-ink)]">{STUDENT.name}</p>
      <p className="mt-0.5 text-xs text-[var(--ss-muted)]">
        {STUDENT.branch} · {STUDENT.college}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[var(--ss-muted)]">
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{STUDENT.id}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{STUDENT.location}</span>
        <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" />Target: {useStudentState.getState().currentRole}</span>
      </div>
    </div>
  );
}

function ResumeSection({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 border-b border-[var(--ss-border)] pb-1">
        <Icon className="h-3.5 w-3.5 text-[var(--ss-blue-600)]" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ss-ink)]">{title}</h3>
      </div>
      <div className="pt-1">{children}</div>
    </section>
  );
}

// helper to safely concat tech + skills for resume project pills
function projectTechList(p: ProjectPassport): string[] {
  return [...p.technology, ...p.skills.filter((s) => !p.technology.includes(s))];
}
