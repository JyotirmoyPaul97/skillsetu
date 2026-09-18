"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Users, Send, BookOpen, Sparkles, Target, AlertTriangle, CheckCircle2,
  ArrowRight, ChevronRight, PlusCircle, Bookmark, BookmarkCheck, Clock, MapPin,
  Layers, TrendingUp, Bot, Star, Info,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import {
  useHackathonStore, HackathonService, DEMO_HACKATHONS, DEMO_PROBLEM_STATEMENTS,
  DEMO_MENTORS, DEMO_TEAM, getRecommendedHackathons, calculateStudentFit,
  calculateOverallFit, calculateTeamCoverage, checkHackathonEligibility,
  getHackathonStatus, getDeadlineStatus,
} from "@/lib/hackathon";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { DEMO_STUDENT } from "@/lib/intelligence/demo-data";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, MatchBadge, SsStat,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsSkillBar } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Hackathon, ProblemStatement, TeamCoverage } from "@/lib/hackathon";

const S042 = "S042";

export function HackathonPage({ section }: { section: string }) {
  if (section === "discover") return <DiscoverPage />;
  if (section === "recommended") return <RecommendedPage />;
  if (section === "mine") return <MyHackathonsPage />;
  if (section === "teams") return <MyTeamsPage />;
  if (section === "submissions") return <SubmissionsPage />;
  if (section === "mentorship") return <MentorshipPage />;
  return <DiscoverPage />;
}

// ─── Discover (§6, §68, §69) ──────────────────────────────────
function DiscoverPage() {
  const { navigate } = useRouter();
  const { register, toggleSave, savedHackathonIds, registrations } = useHackathonStore();
  const [detail, setDetail] = useState<Hackathon | null>(null);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  const filtered = DEMO_HACKATHONS.filter((h) => {
    if (search && !h.title.toLowerCase().includes(search.toLowerCase()) && !h.organizer.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter && h.domain !== domainFilter) return false;
    return true;
  });
  const domains = [...new Set(DEMO_HACKATHONS.map((h) => h.domain))];

  return (
    <div className="space-y-6">
      <DashHeader title="Hackathons & Teams" subtitle="Turn real challenges into real skill evidence." icon={Trophy} accent="#0D9488" action={<DemoBadge />} />
      {/* Differentiator strip (§117) */}
      <SsCard tone="soft" className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-[var(--ss-ink)]">SKILL SETU Hackathon:</span>
          {["Challenge", "Skills", "Student Fit", "Team Intelligence", "Build", "Evaluate", "Evidence", "Passport", "Readiness", "Opportunity"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2"><span className="text-[var(--ss-teal-600)]">{s}</span>{i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}</span>
          ))}
        </div>
      </SsCard>
      {/* Filters */}
      <SsCard tone="flat" className="flex flex-wrap items-center gap-2 p-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, organizer…" className="flex-1 rounded-lg border border-[var(--ss-border)] bg-white px-3 py-1.5 text-sm" />
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="h-9 rounded-lg border border-[var(--ss-border)] bg-white px-2.5 text-sm">
          <option value="">All domains</option>
          {domains.map((d) => <option key={d}>{d}</option>)}
        </select>
      </SsCard>
      {/* Cards */}
      {filtered.length === 0 ? <EmptyState icon={Trophy} title="No challenges match your filters" hint="Try adjusting your search or filters." /> : (
        <div className="grid gap-3 md:grid-cols-2">{filtered.map((h) => {
          const saved = savedHackathonIds.includes(h.id);
          const registered = registrations.some((r) => r.hackathonId === h.id && r.studentId === S042);
          const recs = getRecommendedHackathons(S042);
          const rec = recs.find((r) => r.hackathon.id === h.id);
          const dl = getDeadlineStatus(h);
          const dlColor = dl === "Open" ? "#0D9488" : dl === "Closing Soon" ? "#EA580C" : "#BE123C";
          return (
            <SsCard key={h.id} tone="lift" className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-sm font-bold text-[var(--ss-ink)]">{h.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{h.organizer} · {h.domain} · {h.mode}</p></div>
                {rec && <MatchBadge score={rec.matchScore} />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">{h.requiredSkills.slice(0, 4).map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold" style={{ backgroundColor: dlColor + "1a", color: dlColor }}><Clock className="h-2.5 w-2.5" /> {dl}</span>
                <span className="text-[var(--ss-faint)]">Team {h.minTeamSize}-{h.maxTeamSize}</span>
                <span className="text-[var(--ss-faint)]">Deadline: {h.registrationDeadline}</span>
              </div>
              <div className="mt-3 flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => setDetail(h)}>View Details</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleSave(h.id)}>{saved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--ss-teal-600)]" /> : <Bookmark className="h-3.5 w-3.5" />}</Button>
                <Button variant="navy" size="sm" className="h-7 flex-1 text-[11px]" disabled={registered || dl === "Closed"} onClick={() => { register(h.id, S042, DEMO_STUDENT.name); }}>{registered ? "Registered" : "Register"}</Button>
              </div>
            </SsCard>
          );
        })}</div>
      )}
      <HackathonDetailDrawer hackathon={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  );
}

// ─── Hackathon Detail (§8, §9) ────────────────────────────────
function HackathonDetailDrawer({ hackathon, open, onClose }: { hackathon: Hackathon | null; open: boolean; onClose: () => void }) {
  if (!hackathon) return null;
  const problems = HackathonService.getProblems(hackathon.id);
  return (
    <Drawer open={open} onClose={onClose} title={hackathon?.title} subtitle={hackathon?.organizer}>
      {hackathon && <div className="space-y-4">
        <DemoBadge />
        <Field label="About" value={hackathon.description} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Domain" value={hackathon.domain} />
          <Field label="Mode" value={hackathon.mode} />
          <Field label="Team Size" value={`${hackathon.minTeamSize}-${hackathon.maxTeamSize}${hackathon.soloAllowed ? " (solo ok)" : ""}`} />
          <Field label="Status" value={getHackathonStatus(hackathon)} />
          <Field label="Registration Deadline" value={hackathon.registrationDeadline} />
          <Field label="Event Dates" value={`${hackathon.startDate} → ${hackathon.endDate}`} />
        </div>
        <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Required Skills</p><div className="mt-1 flex flex-wrap gap-1">{hackathon.requiredSkills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName} ({s.importance})</SsBadge>)}</div></div>
        {problems.length > 0 && (
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Problem Statements</p>
            <div className="mt-1 space-y-2">{problems.map((p) => <ProblemIntelligenceCard key={p.id} problem={p} />)}</div>
          </div>
        )}
        {hackathon.evaluationCriteria.length > 0 && (
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evaluation Criteria</p><div className="mt-1 flex flex-wrap gap-1">{hackathon.evaluationCriteria.map((c) => <span key={c.id} className="rounded-full bg-[var(--ss-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-muted)]">{c.name} ({Math.round(c.weight * 100)}%)</span>)}</div></div>
        )}
      </div>}
    </Drawer>
  );
}

// ─── Challenge Intelligence Panel (§9) ─────────────────────────
function ProblemIntelligenceCard({ problem }: { problem: ProblemStatement }) {
  const [showFit, setShowFit] = useState(false);
  const fit = calculateStudentFit(problem, S042);
  const overall = calculateOverallFit(problem, S042);
  return (
    <SsCard tone="flat" className="p-3">
      <p className="text-sm font-semibold text-[var(--ss-ink)]">{problem.title}</p>
      <p className="text-[10px] text-[var(--ss-muted)]">{problem.difficulty} · {problem.domain}</p>
      <p className="mt-1 text-[11px] text-[var(--ss-ink-soft)]">{problem.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">{problem.requiredSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
        <button onClick={() => setShowFit(!showFit)} className="text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Challenge Intelligence →</button>
      </div>
      {showFit && (
        <div className="mt-3 rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-blue-600)]">Student Fit — Overall: {overall}%</p>
          <div className="mt-2 space-y-1.5">{fit.map((f) => (
            <div key={f.skillId} className="flex items-center justify-between text-xs">
              <span className="text-[var(--ss-ink-soft)]">{f.skillName}</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--ss-muted)]">{f.studentLevel}/{f.requiredLevel}</span>
                <SsBadge tone={f.status === "Strong Match" || f.status === "Match" ? "teal" : f.status === "Partial" ? "blue" : "orange"} className="text-[9px]">{f.status}</SsBadge>
              </span>
            </div>
          ))}</div>
        </div>
      )}
    </SsCard>
  );
}

// ─── Recommended (§7, §14) ─────────────────────────────────────
function RecommendedPage() {
  const recs = getRecommendedHackathons(S042);
  return (
    <div className="space-y-6">
      <DashHeader title="Recommended Challenges" subtitle="Based on your skill intelligence + target role" icon={Sparkles} accent="#0D9488" action={<DemoBadge />} />
      {recs.length === 0 ? <EmptyState icon={Sparkles} title="No recommendations" hint="No challenges match your current skill profile." /> : (
        <div className="space-y-3">{recs.map((r) => (
          <SsCard key={r.hackathon.id} tone="lift" className="p-4">
            <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{r.hackathon.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{r.hackathon.organizer} · {r.hackathon.domain}</p></div><MatchBadge score={r.matchScore} /></div>
            <div className="mt-2 flex flex-wrap gap-1.5">{r.whyPoints.map((w) => <span key={w} className="inline-flex items-center gap-1 rounded-full bg-[var(--ss-teal-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-teal-600)]"><CheckCircle2 className="h-2.5 w-2.5" />{w}</span>)}</div>
            {r.potentialGap && <p className="mt-2 text-[11px] text-[var(--ss-orange-600)]">Potential gap: {r.potentialGap}</p>}
          </SsCard>
        ))}</div>
      )}
    </div>
  );
}

// ─── My Hackathons (§6) ────────────────────────────────────────
function MyHackathonsPage() {
  const { registrations } = useHackathonStore();
  if (registrations.length === 0) return <div className="space-y-6"><DashHeader title="My Hackathons" icon={Trophy} accent="#0D9488" /><EmptyState icon={Trophy} title="No hackathons registered" hint="Discover and register for challenges." /></div>;
  return (
    <div className="space-y-6">
      <DashHeader title="My Hackathons" subtitle={`${registrations.length} registered`} icon={Trophy} accent="#0D9488" />
      <div className="space-y-2">{registrations.map((r) => {
        const h = DEMO_HACKATHONS.find((hk) => hk.id === r.hackathonId);
        if (!h) return null;
        return <SsCard key={r.id} tone="soft" className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{h.title}</p><p className="text-[10px] text-[var(--ss-muted)]">{h.organizer} · Registered {r.registeredAt.slice(0, 10)}</p></div><SsBadge tone="blue" className="text-[10px]">{r.status}</SsBadge></div></SsCard>;
      })}</div>
    </div>
  );
}

// ─── My Teams (§24, §27, §28, §29, §30, §31) ───────────────────
function MyTeamsPage() {
  const { navigate } = useRouter();
  const { teams } = useHackathonStore();
  const [showCoverage, setShowCoverage] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="My Teams" subtitle="Team workspace + skill coverage" icon={Users} accent="#0D9488" action={<DemoBadge />} />
      {teams.length === 0 ? <EmptyState icon={Users} title="No teams" hint="Find a team or create one." /> : (
        <div className="space-y-3">{teams.map((t) => {
          const coverage = calculateTeamCoverage(t.id);
          const activeMembers = t.members.filter((m) => m.status === "Leader" || m.status === "Member");
          return (
            <SsCard key={t.id} tone="soft" className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[var(--ss-ink)]">{t.name}</p><p className="text-[10px] text-[var(--ss-muted)]">{activeMembers.length}/{t.members.length} active · Status: {t.status}</p></div>
                {coverage && <div className="text-right"><p className="text-lg font-bold" style={{ color: coverage.coverage >= 70 ? "#0D9488" : coverage.coverage >= 50 ? "#2563EB" : "#EA580C" }}>{coverage.coverage}%</p><p className="text-[9px] text-[var(--ss-muted)]">coverage</p></div>}
              </div>
              {/* Members */}
              <div className="mt-2 space-y-1">{activeMembers.map((m) => (
                <div key={m.studentId} className="flex items-center justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{m.studentName}</span><span className="text-[var(--ss-muted)]">{m.teamRole}</span></div>
              ))}</div>
              {/* Coverage summary */}
              {coverage && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {coverage.covered.map((s) => <span key={s} className="rounded-full bg-[var(--ss-teal-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-teal-600)]">✓ {s}</span>)}
                  {coverage.partial.map((s) => <span key={s} className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-blue-600)]">⚠ {s}</span>)}
                  {coverage.missing.map((s) => <span key={s} className="rounded-full bg-[var(--ss-orange-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-orange-600)]">✗ {s}</span>)}
                </div>
              )}
              {/* Open roles */}
              {t.openRoles.length > 0 && <div className="mt-2"><p className="text-[10px] font-semibold text-[var(--ss-faint)]">OPEN POSITIONS</p>{t.openRoles.map((r) => <p key={r.name} className="text-[11px] text-[var(--ss-ink-soft)]">{r.name} ({r.open} open) — {r.requiredSkills.map((s) => s.skillName).join(", ")}</p>)}</div>}
              {/* Milestones */}
              <div className="mt-3"><p className="text-[10px] font-semibold text-[var(--ss-faint)]">MILESTONES</p>
                <div className="mt-1 space-y-1">{useHackathonStore.getState().milestones.filter((m) => m.teamId === t.id).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-[11px]"><span className="text-[var(--ss-ink-soft)]">{m.title}</span><SsBadge tone={m.status === "Completed" ? "teal" : m.status === "In Progress" ? "blue" : "neutral"} className="text-[9px]">{m.status}</SsBadge></div>
                ))}</div>
              </div>
              <div className="mt-3 flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => setShowCoverage(t.id)}>View Coverage</Button>
                <Button variant="navy" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => navigate("/app/hackathons/submissions")}>Workspace</Button>
              </div>
            </SsCard>
          );
        })}</div>
      )}
      <CoverageDrawer teamId={showCoverage} open={!!showCoverage} onClose={() => setShowCoverage(null)} />
    </div>
  );
}

function CoverageDrawer({ teamId, open, onClose }: { teamId: string | null; open: boolean; onClose: () => void }) {
  const coverage = teamId ? calculateTeamCoverage(teamId) : null;
  return (
    <Drawer open={open} onClose={onClose} title="Team Skill Coverage" subtitle={`${coverage?.coverage}% coverage`}>
      {coverage && <div className="space-y-3">
        <DemoBadge />
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Formula</p>
          <p className="mt-1 text-[11px] text-[var(--ss-muted)]">For each required skill: best team member competency ÷ required level × importance weight. Team Coverage = weighted covered capability ÷ total required × 100.</p>
        </div>
        <div className="space-y-2">{coverage.rows.map((r) => (
          <div key={r.skillId}>
            <div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium text-[var(--ss-ink-soft)]">{r.skillName}</span><span className="flex items-center gap-1.5"><span className="text-[var(--ss-muted)]">{r.bestMemberCompetency}/{r.requiredLevel}</span><SsBadge tone={r.status === "Covered" ? "teal" : r.status === "Partial" ? "blue" : "orange"} className="text-[9px]">{r.status}</SsBadge></span></div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ss-surface-3)]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, r.coverage * 100)}%`, backgroundColor: r.status === "Covered" ? "#0D9488" : r.status === "Partial" ? "#2563EB" : "#EA580C" }} /></div>
            {r.coveredBy && <p className="mt-0.5 text-[9px] text-[var(--ss-muted)]">Covered by: {r.coveredBy}</p>}
          </div>
        ))}</div>
      </div>}
    </Drawer>
  );
}

// fix SxBadge typo
function SxBadge({ children, className, tone }: { children: React.ReactNode; className?: string; tone: any }) {
  return <SsBadge tone={tone} className={className}>{children}</SsBadge>;
}

// ─── Submissions (§39-43) ──────────────────────────────────────
function SubmissionsPage() {
  const { submissions, createSubmission, submitFinal } = useHackathonStore();
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <DashHeader title="Submissions" subtitle="Project submission + GitHub + live demo" icon={Send} accent="#0D9488" action={<Button variant="navy" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> New Submission</Button>} />
      {submissions.length === 0 ? <EmptyState icon={Send} title="No submissions" hint="Your team has not submitted a solution yet." /> : (
        <div className="space-y-2">{submissions.map((s) => (
          <SsCard key={s.id} tone="soft" className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--ss-ink)]">{s.projectTitle}</p><p className="text-[10px] text-[var(--ss-muted)]">{s.version} · {s.status} · Created {s.createdAt.slice(0, 10)}</p></div><SsBadge tone={s.status === "Submitted" ? "teal" : "neutral"} className="text-[10px]">{s.status}</SsBadge></div>
            {s.githubUrl && <p className="mt-1 text-[11px] text-[var(--ss-blue-600)]">GitHub: {s.githubUrl}</p>}
            {s.liveDemoUrl && <p className="text-[11px] text-[var(--ss-blue-600)]">Demo: {s.liveDemoUrl}</p>}
            {s.status === "Draft" && <Button variant="navy" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => submitFinal(s.id)}>Submit Final</Button>}
          </SsCard>
        ))}</div>
      )}
      {showForm && <SubmissionForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function SubmissionForm({ onClose }: { onClose: () => void }) {
  const { createSubmission, teams } = useHackathonStore();
  const [form, setForm] = useState({ projectTitle: "", description: "", problemSolved: "", approach: "", githubUrl: "", liveDemoUrl: "" });
  const team = teams[0]; // AI Innovators
  const submit = () => {
    if (!team) return;
    createSubmission({ teamId: team.id, hackathonId: team.hackathonId, problemStatementId: team.problemStatementId, projectTitle: form.projectTitle || "Untitled", description: form.description, problemSolved: form.problemSolved, approach: form.approach, technology: [], githubUrl: form.githubUrl, githubStatus: form.githubUrl ? "Submitted" : "Not Linked", liveDemoUrl: form.liveDemoUrl, contributions: team.members.filter((m) => m.status === "Leader" || m.status === "Member").map((m) => ({ studentId: m.studentId, studentName: m.studentName, role: m.teamRole, contribution: "Full participation", technologies: [], skillsDemonstrated: [] })) });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="New Submission" size="md">
      <div className="space-y-3">
        <input value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} placeholder="Project title" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <textarea value={form.problemSolved} onChange={(e) => setForm({ ...form, problemSolved: e.target.value })} rows={2} placeholder="Problem solved" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="GitHub URL" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <input value={form.liveDemoUrl} onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })} placeholder="Live demo URL" className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2.5 text-sm" />
        <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]"><Info className="mr-1 inline h-3 w-3" />GitHub URL does NOT automatically verify skills. Verification requires faculty/industry review.</p>
        <Button variant="navy" className="w-full" onClick={submit} disabled={!form.projectTitle}>Create Draft</Button>
      </div>
    </Modal>
  );
}

// ─── Mentorship (§35-38) ──────────────────────────────────────
function MentorshipPage() {
  const mentors = DEMO_MENTORS;
  return (
    <div className="space-y-6">
      <DashHeader title="Mentorship" subtitle="Find mentors for your team's skill gaps" icon={BookOpen} accent="#0D9488" action={<DemoBadge />} />
      <div className="grid gap-3 sm:grid-cols-2">{mentors.map((m) => (
        <SsCard key={m.id} tone="lift" className="p-4">
          <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]"><Star className="h-4 w-4" /></span><div><p className="text-sm font-bold text-[var(--ss-ink)]">{m.name}</p><p className="text-[10px] text-[var(--ss-muted)]">{m.category} · {m.domain}</p></div></div>
          <p className="mt-2 text-[11px] text-[var(--ss-ink-soft)]">{m.bio}</p>
          <div className="mt-2 flex flex-wrap gap-1">{m.skills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
          <SsBadge tone={m.availability === "Available" ? "teal" : m.availability === "Limited" ? "blue" : "orange"} className="mt-2 text-[10px]">{m.availability}</SsBadge>
        </SsCard>
      ))}</div>
    </div>
  );
}
