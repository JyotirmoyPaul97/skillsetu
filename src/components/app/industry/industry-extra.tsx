"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare, BarChart3, Trophy, Boxes, BookOpen, Bell, User, Building2,
  CheckCircle2, AlertTriangle, TrendingUp, FileText, PlusCircle, Send, Info,
  Target, Users, Award, Brain, X, ArrowRight, ShieldCheck, Layers, ClipboardList,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useIndustry, useIndustryStore, IndustryService, DEMO_COMPANY, DEMO_INDUSTRY_USER, DEMO_CANDIDATES } from "@/lib/industry";
import { useCareerStore } from "@/lib/career";
import { ALL_ROLES, COMPETENCY_TARGET_THRESHOLD } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import { IndustryAggregator, useAggregators } from "@/lib/intelligence/aggregators";
import type { Candidate, FeedbackCategory, IndustryFeedback } from "@/lib/industry/industry-model";
import type { Challenge } from "@/lib/industry/industry-model";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsStat } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import {
  SsDemandBadge, SsCoverageBar, SsPipeline, SsAlertPill, SsWhyModal, SsWhyFactor,
  SsDataSourceLabel, SsWorkflowBanner,
} from "@/components/ui/ss-intelligence";
import { cn } from "@/lib/utils";

export function IndustryExtra({ section }: { section: string }) {
  if (section === "feedback") return <FeedbackCenter />;
  if (section === "analytics") return <AnalyticsPage />;
  if (section === "challenges") return <ChallengesPage />;
  if (section === "team-builder") return <TeamBuilderPage />;
  if (section === "learning") return <LearningHubPage />;
  if (section === "notifications") return <NotificationsPage />;
  if (section === "profile") return <ProfilePage />;
  return <FeedbackCenter />;
}

// ============================================================
// CHALLENGES (§13) — prominent CREATE CHALLENGE + SsPipeline
// ============================================================
function ChallengesPage() {
  const ind = useIndustry();
  const { createChallenge } = useIndustryStore();
  const [showForm, setShowForm] = useState(false);

  const pipelineStages = [
    { key: "problem", label: "Problem" },
    { key: "skills", label: "Skills" },
    { key: "eligibility", label: "Eligibility" },
    { key: "team", label: "Team" },
    { key: "evaluation", label: "Evaluation" },
    { key: "discovery", label: "Talent Discovery" },
  ];

  return (
    <div className="space-y-6">
      <DashHeader title="Challenges & Hackathons" subtitle="Industry-side entry point for the SKILL SETU challenge system" icon={Trophy} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Create Challenge</Button>} />

      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Challenge Creation Workflow</p>
        <SsPipeline stages={pipelineStages} activeIndex={0} />
      </SsCard>

      <div className="grid gap-3 sm:grid-cols-2">
        {ind.challenges.map((ch) => <ChallengeCard key={ch.id} challenge={ch} />)}
      </div>

      {ind.challenges.length === 0 && <EmptyState icon={Trophy} title="No challenges yet" hint="Create a challenge to surface evidence-backed talent." />}

      <p className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] text-[var(--ss-muted)]">The detailed Hackathon execution system (submissions, evaluation, team matching) will be completed in the dedicated Hackathon phase. This is the Industry-side entry point only.</p>

      {showForm && <ChallengeForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ChallengeCard({ challenge: ch }: { challenge: Challenge }) {
  const candidatesWithRequired = DEMO_CANDIDATES.filter((c) =>
    ch.requiredSkills.every((rs) => (c.competencies[rs.skillId]?.competencyScore ?? 0) >= rs.requiredLevel),
  );
  return (
    <SsCard tone="lift" className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--ss-ink)]">{ch.title}</p>
          <p className="text-[10px] text-[var(--ss-muted)]">{ch.domain} · Team {ch.teamSize} · {ch.startDate} → {ch.endDate}</p>
        </div>
        <SsBadge tone="orange" className="text-[10px]">{ch.status}</SsBadge>
      </div>
      <p className="mt-2 text-xs text-[var(--ss-ink-soft)]">{ch.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {ch.requiredSkills.map((s) => (
          <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName} ≥{s.requiredLevel}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <SsBadge tone={candidatesWithRequired.length > 0 ? "teal" : "orange"} className="text-[10px]">{candidatesWithRequired.length} candidates meet requirements</SsBadge>
        <SsDataSourceLabel source="platform" />
      </div>
    </SsCard>
  );
}

function ChallengeForm({ onClose }: { onClose: () => void }) {
  const { createChallenge } = useIndustryStore();
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("AI/ML");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState("3-4");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [reqSkills, setReqSkills] = useState<{ skillId: string; skillName: string; requiredLevel: number }[]>([]);
  const [roleId, setRoleId] = useState("data-scientist");
  const role = ALL_ROLES.find((r) => r.roleId === roleId)!;

  const submit = () => {
    createChallenge({
      title: title || "Untitled Challenge",
      description: description || "—",
      domain, objective: "Demonstrate skills via project",
      expectedOutcome: "Working solution + presentation",
      requiredSkills: reqSkills,
      eligibility: { yearMin: 2 },
      mode: "Online",
      startDate: new Date().toISOString().slice(0, 10),
      endDate, teamSize,
      evaluationCriteria: ["Solution quality", "Presentation", "Code review"],
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Create Challenge" subtitle="Skill-anchored · evidence-generating" size="lg">
      <div className="space-y-3">
        <div className="space-y-1"><label className="text-[11px] font-semibold">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><label className="text-[11px] font-semibold">Domain</label><input value={domain} onChange={(e) => setDomain(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>
          <div className="space-y-1"><label className="text-[11px] font-semibold">Team Size</label><input value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>
        </div>
        <div className="space-y-1"><label className="text-[11px] font-semibold">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-[var(--ss-border)] bg-white p-2 text-sm" /></div>
        <div className="space-y-1"><label className="text-[11px] font-semibold">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold">Required Skills (anchor on a role)</label>
          <select value={roleId} onChange={(e) => { setRoleId(e.target.value); setReqSkills([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select>
        </div>
        <div className="flex flex-wrap gap-1.5">{role.skills.map((s) => {
          const selected = reqSkills.find((x) => x.skillId === s.skillId);
          return (
            <button key={s.skillId} onClick={() => {
              if (selected) {
                setReqSkills(reqSkills.filter((x) => x.skillId !== s.skillId));
              } else {
                setReqSkills([...reqSkills, { skillId: s.skillId, skillName: s.skillName, requiredLevel: COMPETENCY_TARGET_THRESHOLD }]);
              }
            }} className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", selected ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>
              {selected ? "✓ " : "+ "}{s.skillName}
            </button>
          );
        })}</div>
        {reqSkills.length > 0 && (
          <div className="space-y-1">
            {reqSkills.map((s, i) => (
              <div key={s.skillId} className="flex items-center gap-2 rounded-lg bg-[var(--ss-surface-2)] p-2">
                <span className="flex-1 text-sm font-medium">{s.skillName}</span>
                <input type="number" min={0} max={100} value={s.requiredLevel} onChange={(e) => setReqSkills(reqSkills.map((x, j) => j === i ? { ...x, requiredLevel: Number(e.target.value) } : x))} className="h-8 w-14 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs" />
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button variant="orange" className="flex-1" onClick={submit} disabled={!title}>Publish Challenge</Button></div>
      </div>
    </Modal>
  );
}

// ============================================================
// TEAM BUILDER (§14) — multi-role coverage analysis
// ============================================================
function TeamBuilderPage() {
  const [teamSize, setTeamSize] = useState(4);
  const [roles, setRoles] = useState<string[]>(["ml-engineer", "full-stack-developer"]);
  const [reqSkills, setReqSkills] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [results, setResults] = useState<null | ReturnType<typeof safeTeamBuilderCoverage>>(null);

  const find = () => {
    setResults(safeTeamBuilderCoverage({ roleIds: roles, skillIds: reqSkills, availableOnly }));
  };

  return (
    <div className="space-y-6">
      <DashHeader title="Build a Team" subtitle="Multi-role skill coverage — distinct from single hiring" icon={Boxes} accent="#EA580C" action={<SsBadge tone="orange" className="text-[10px]">TEAM BUILDER</SsBadge>} />

      <SsCard tone="soft" className="p-5 space-y-4">
        <div className="rounded-md border-l-4 border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] px-3 py-2 text-[11px] text-[var(--ss-orange-600)]">
          <ShieldCheck className="mr-1 inline h-3 w-3" /> Team Builder is distinct from normal hiring — it asks <b>can your combined talent pool cover all required skills?</b> rather than finding one candidate.
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold">Team Size</label>
            <input type="number" min={1} max={10} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="h-9 w-full rounded-md border border-[var(--ss-border)] px-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold">Availability</label>
            <select value={availableOnly ? "yes" : "any"} onChange={(e) => setAvailableOnly(e.target.value === "yes")} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">
              <option value="yes">Available only</option>
              <option value="any">Anyone</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold">Required Roles</label>
            <p className="text-[10px] text-[var(--ss-muted)]">{roles.length} selected</p>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold">Roles (multi-select)</label>
          <div className="mt-2 flex flex-wrap gap-1.5">{ALL_ROLES.map((r) => <button key={r.roleId} onClick={() => setRoles(roles.includes(r.roleId) ? roles.filter((x) => x !== r.roleId) : [...roles, r.roleId])} className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", roles.includes(r.roleId) ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>{r.roleName}</button>)}</div>
        </div>
        <div>
          <label className="text-[11px] font-semibold">Additional Required Skills (optional)</label>
          <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(SKILL_NAMES).slice(0, 15).map(([sid, name]) => <button key={sid} onClick={() => setReqSkills(reqSkills.includes(sid) ? reqSkills.filter((x) => x !== sid) : [...reqSkills, sid])} className={cn("rounded-full border px-2.5 py-0.5 text-[10px]", reqSkills.includes(sid) ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>{name}</button>)}</div>
        </div>
        <Button variant="orange" onClick={find} disabled={roles.length === 0} className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Find Team</Button>
      </SsCard>

      {results && <TeamResults results={results} teamSize={teamSize} />}
    </div>
  );
}

// Safe wrapper around the shared aggregator — falls back to a manual
// computation using role.skills + COMPETENCY_TARGET_THRESHOLD if the
// upstream aggregator's iteration over role.weightedSkills throws.
function safeTeamBuilderCoverage(spec: { roleIds: string[]; skillIds: string[]; availableOnly: boolean }) {
  try {
    return IndustryAggregator.getTeamBuilderCoverage({ roleIds: spec.roleIds });
  } catch {
    const candidates = DEMO_CANDIDATES.filter((c) => !spec.availableOnly || c.available);
    const required = new Map<string, { skillId: string; skillName: string; requiredLevel: number; sourceRole: string }>();
    for (const roleId of spec.roleIds) {
      const role = ALL_ROLES.find((r) => r.roleId === roleId);
      if (!role) continue;
      for (const ws of role.skills) {
        const e = required.get(ws.skillId) ?? { skillId: ws.skillId, skillName: SKILL_NAMES[ws.skillId] ?? ws.skillName, requiredLevel: COMPETENCY_TARGET_THRESHOLD, sourceRole: roleId };
        e.requiredLevel = Math.max(e.requiredLevel, COMPETENCY_TARGET_THRESHOLD);
        required.set(ws.skillId, e);
      }
    }
    for (const sid of spec.skillIds) {
      const e = required.get(sid) ?? { skillId: sid, skillName: SKILL_NAMES[sid] ?? sid, requiredLevel: COMPETENCY_TARGET_THRESHOLD, sourceRole: "additional" };
      required.set(sid, e);
    }
    const requiredList = [...required.values()];
    const coverage = requiredList.map((rs) => {
      const candidatesWith = candidates.filter((c) => (c.competencies[rs.skillId]?.competencyScore ?? 0) >= rs.requiredLevel);
      return { ...rs, availableCandidates: candidatesWith.length, covered: candidatesWith.length > 0 };
    });
    const missing = coverage.filter((c) => !c.covered);
    return {
      requiredSkills: coverage,
      coveragePercent: requiredList.length > 0 ? Math.round((coverage.length - missing.length) / requiredList.length * 100) : 0,
      missing,
      candidateFits: candidates.map((c) => ({
        candidate: c,
        matchCount: coverage.filter((cs) => (c.competencies[cs.skillId]?.competencyScore ?? 0) >= cs.requiredLevel).length,
      })).sort((a, b) => b.matchCount - a.matchCount),
    };
  }
}

function TeamResults({ results, teamSize }: { results: NonNullable<ReturnType<typeof safeTeamBuilderCoverage>>; teamSize: number }) {
  return (
    <div className="space-y-4">
      {/* Skill Coverage table */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Skill Coverage</h3>
          <SsBadge tone={results.coveragePercent >= 75 ? "teal" : results.coveragePercent >= 50 ? "blue" : "orange"} className="text-[10px]">{results.coveragePercent}% coverage</SsBadge>
        </div>
        <div className="overflow-x-auto rounded-md border border-[var(--ss-border)]">
          <table className="w-full text-xs">
            <thead className="bg-[var(--ss-surface-2)]">
              <tr><th className="px-3 py-2 text-left font-semibold text-[var(--ss-muted)]">Skill</th><th className="px-3 py-2 text-left font-semibold text-[var(--ss-muted)]">Required</th><th className="px-3 py-2 text-left font-semibold text-[var(--ss-muted)]">Available</th><th className="px-3 py-2 text-left font-semibold text-[var(--ss-muted)]">Status</th></tr>
            </thead>
            <tbody>
              {results.requiredSkills.map((rs) => (
                <tr key={rs.skillId} className="border-t border-[var(--ss-border)]">
                  <td className="px-3 py-2 font-medium text-[var(--ss-ink)]">{rs.skillName}</td>
                  <td className="px-3 py-2 text-[var(--ss-ink-soft)]">≥ {rs.requiredLevel}</td>
                  <td className="px-3 py-2 text-[var(--ss-ink-soft)]">{rs.availableCandidates} candidates</td>
                  <td className="px-3 py-2">{rs.covered ? <SsBadge tone="teal" className="text-[9px]">Covered</SsBadge> : <SsAlertPill tone="critical" label="Missing" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2"><SsDataSourceLabel source="platform" /></div>
      </SsCard>

      {/* Missing Capability list */}
      {results.missing.length > 0 && (
        <SsCard tone="soft" className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">Missing Capability</h3>
          <div className="space-y-2">
            {results.missing.map((m) => (
              <div key={m.skillId} className="flex items-center justify-between rounded-md border border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] px-3 py-2">
                <div className="text-xs">
                  <p className="font-bold text-[var(--ss-ink)]">{m.skillName}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">Required by: {m.sourceRole}</p>
                </div>
                <SsAlertPill tone="critical" label="Not covered" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[var(--ss-muted)]">No candidate currently demonstrates these skills at the required level. Consider a challenge or workshop pipeline.</p>
        </SsCard>
      )}

      {/* Candidate Fit list (sorted by matchCount desc) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Candidate Fit (sorted by match count)</h3>
          <span className="text-[10px] text-[var(--ss-muted)]">Team size: {teamSize}</span>
        </div>
        <div className="space-y-1.5">
          {results.candidateFits.slice(0, 6).map((cf) => (
            <div key={cf.candidate.studentId} className="flex items-center justify-between rounded-md border border-[var(--ss-border)] bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: cf.candidate.avatarColor }}>{cf.candidate.name.slice(0, 1)}</span>
                <div>
                  <p className="text-xs font-bold text-[var(--ss-ink)]">{cf.candidate.name} <span className="font-mono text-[9px] text-[var(--ss-muted)]">{cf.candidate.studentId}</span></p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{cf.candidate.targetRole} · Readiness {cf.candidate.roleReadiness}%</p>
                </div>
              </div>
              <SsBadge tone={cf.matchCount >= results.requiredSkills.length / 2 ? "teal" : "blue"} className="text-[10px]">{cf.matchCount}/{results.requiredSkills.length} skills</SsBadge>
            </div>
          ))}
        </div>
      </SsCard>
    </div>
  );
}

// ============================================================
// FEEDBACK CENTER (§15, §16) — Pending/Active/Completed/History
// + rubric + post-submission confirmation
// ============================================================
function FeedbackCenter() {
  const ind = useIndustry();
  const [tab, setTab] = useState<"pending" | "active" | "completed" | "history">("history");
  const [showForm, setShowForm] = useState(false);
  const [confirmEvidence, setConfirmEvidence] = useState<{ skills: string[] } | null>(null);

  // Filter logic — uses platform applications and feedback
  const pendingEval = ind.applications.filter((a) => a.status === "INTERVIEW" || a.status === "SELECTED");
  const activeFeedback = ind.feedback.filter((f) => f.status === "Submitted" && (Date.now() - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 30);
  const completedFeedback = ind.feedback.filter((f) => f.status === "Reviewed" || (Date.now() - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24) >= 30);

  return (
    <div className="space-y-6">
      <DashHeader title="Feedback Center" subtitle="Rubric-based feedback → evidence records (for S042)" icon={MessageSquare} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Give Feedback</Button>} />

      <SsWorkflowBanner tone="orange" steps={["Evaluate", "Score Rubric", "Submit", "Evidence Created"]} className="rounded-lg border border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] px-3 py-2" />

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        {([
          { key: "pending", label: `Pending Evaluation (${pendingEval.length})` },
          { key: "active", label: `Active Experiences (${activeFeedback.length})` },
          { key: "completed", label: `Completed Experiences (${completedFeedback.length})` },
          { key: "history", label: `Feedback History (${ind.feedback.length})` },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-full px-3 py-1 text-xs font-semibold", tab === t.key ? "bg-[var(--ss-orange-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)]")}>{t.label}</button>
        ))}
      </div>

      {tab === "pending" && (
        pendingEval.length === 0 ? <EmptyState icon={AlertTriangle} title="No pending evaluations" hint="Candidates who reach interview/selection will appear here." /> : (
          <div className="space-y-2">{pendingEval.map((a) => {
            const c = ind.candidates.find((c) => c.studentId === a.studentId);
            const o = ind.opportunities.find((o) => o.id === a.opportunityId);
            return (
              <SsCard key={a.id} tone="soft" className="p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-[var(--ss-ink)]">{c?.name ?? a.studentId}</p><p className="text-[10px] text-[var(--ss-muted)]">{o?.title} · {a.status}</p></div>
                  <Button variant="orange" size="sm" className="h-7 text-[11px]" onClick={() => setShowForm(true)}>Evaluate Now</Button>
                </div>
              </SsCard>
            );
          })}</div>
        )
      )}

      {tab === "active" && (activeFeedback.length === 0 ? <EmptyState icon={MessageSquare} title="No active experiences" /> : <FeedbackList items={activeFeedback} />)}
      {tab === "completed" && (completedFeedback.length === 0 ? <EmptyState icon={CheckCircle2} title="No completed experiences" /> : <FeedbackList items={completedFeedback} />)}

      {tab === "history" && (ind.feedback.length === 0 ? <EmptyState icon={ClipboardList} title="No feedback submitted yet" hint="Submit rubric-based feedback to create evidence for students." /> : <FeedbackList items={ind.feedback} />)}

      {showForm && <FeedbackForm onClose={() => setShowForm(false)} onSubmitted={(skills) => setConfirmEvidence({ skills })} />}
      <ConfirmEvidenceModal data={confirmEvidence} open={!!confirmEvidence} onClose={() => setConfirmEvidence(null)} />
    </div>
  );
}

function FeedbackList({ items }: { items: IndustryFeedback[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((f) => (
        <SsCard key={f.id} tone="soft" className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--ss-ink)]">{f.studentName}</p>
              <p className="text-[10px] text-[var(--ss-muted)]">{f.experience} · {f.createdAt.slice(0, 10)}</p>
            </div>
            <SsBadge tone={f.status === "Submitted" ? "teal" : "neutral"} className="text-[10px]">{f.status}</SsBadge>
          </div>
          {f.skillScores.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {f.skillScores.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-teal-50)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ss-teal-600)]">{s.skillName}: {s.score}</span>)}
            </div>
          )}
          {f.categoryScores.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {f.categoryScores.map((c) => <span key={c.category} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--ss-muted)]">{c.category}: {c.score}/5</span>)}
            </div>
          )}
        </SsCard>
      ))}
    </div>
  );
}

function FeedbackForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: (skills: string[]) => void }) {
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

  // Rubric categories (§15) — sliders 1–5
  const RUBRIC: FeedbackCategory[] = ["Technical", "Problem Solving", "Communication", "Teamwork", "Leadership", "Professionalism"];
  const [rubric, setRubric] = useState<Record<FeedbackCategory, number>>({
    Technical: 4, "Problem Solving": 4, Communication: 4, Teamwork: 4, Leadership: 3, Adaptability: 4, Professionalism: 4,
  });

  const addSkill = (skillId: string, skillName: string) => {
    if (skillScores.some((s) => s.skillId === skillId)) return;
    setSkillScores([...skillScores, { skillId, skillName, score: 70 }]);
  };

  const submit = () => {
    const categoryScores = RUBRIC.map((category) => ({ category, score: rubric[category] }));
    submitFeedback({
      studentId: c.studentId, studentName: c.name, experience,
      technicalFeedback: technical, professionalFeedback: professional,
      strengths, areasForImprovement: improvements,
      skillScores, categoryScores,
    });
    onSubmitted(skillScores.map((s) => s.skillName));
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Industry Feedback — Rubric" subtitle="Feedback → Evidence (creates evidence records for S042)" size="lg">
      <div className="space-y-4">
        <SsDataSourceLabel source="platform" />
        <div className="space-y-1"><label className="text-[11px] font-semibold">Student</label><select value={studentId} onChange={(e) => { setStudentId(e.target.value); setSkillScores([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{DEMO_CANDIDATES.map((c) => <option key={c.studentId} value={c.studentId}>{c.name} ({c.studentId})</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-semibold">Experience</label><select value={experience} onChange={(e) => setExperience(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>Internship</option><option>Project</option><option>Hackathon</option></select></div>

        {/* RUBRIC (§15) */}
        <div>
          <label className="text-[11px] font-semibold text-[var(--ss-orange-600)] uppercase">Evaluation Rubric</label>
          <div className="mt-2 space-y-2">
            {RUBRIC.map((cat) => (
              <div key={cat} className="rounded-lg bg-[var(--ss-surface-2)] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ss-ink-soft)]">{cat}</span>
                  <span className="text-sm font-bold text-[var(--ss-orange-600)]">{rubric[cat]}<span className="text-[10px] text-[var(--ss-muted)]">/5</span></span>
                </div>
                <input type="range" min={1} max={5} value={rubric[cat]} onChange={(e) => setRubric({ ...rubric, [cat]: Number(e.target.value) })} className="w-full accent-[var(--ss-orange-600)]" />
              </div>
            ))}
          </div>
        </div>

        <textarea value={technical} onChange={(e) => setTechnical(e.target.value)} rows={2} placeholder="Technical feedback…" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <textarea value={professional} onChange={(e) => setProfessional(e.target.value)} rows={2} placeholder="Professional feedback…" className="w-full rounded-md border border-[var(--ss-border)] p-2 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Strengths" className="h-9 rounded-md border border-[var(--ss-border)] px-2 text-sm" />
          <input value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="Areas for improvement" className="h-9 rounded-md border border-[var(--ss-border)] px-2 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-semibold">Skill Scores (centralized skills)</label>
          <div className="mt-2 flex flex-wrap gap-1.5">{roleSkills.map((s) => <button key={s.skillId} onClick={() => addSkill(s.skillId, s.skillName)} className="rounded-full border border-[var(--ss-border)] px-2.5 py-0.5 text-[11px] hover:bg-[var(--ss-surface-2)]">+ {s.skillName}</button>)}</div>
        </div>
        {skillScores.length > 0 && (
          <div className="space-y-2">{skillScores.map((s, i) => (
            <div key={s.skillId} className="flex items-center gap-2 rounded-lg bg-[var(--ss-surface-2)] p-2.5">
              <span className="flex-1 text-sm font-medium">{s.skillName}</span>
              <input type="number" min={0} max={100} value={s.score} onChange={(e) => setSkillScores(skillScores.map((x, j) => j === i ? { ...x, score: Number(e.target.value) } : x))} className="h-8 w-14 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs" />
            </div>
          ))}</div>
        )}
        <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]"><Info className="mr-1 inline h-3 w-3" />For S042, feedback creates real EvidenceRecords in the shared intelligence store — visible in the Student Portal's evidence timeline. Evidence is <b>not</b> automatically verified (§16).</div>
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button variant="orange" className="flex-1 gap-1.5" onClick={submit}><Send className="h-3.5 w-3.5" /> Submit Feedback</Button></div>
      </div>
    </Modal>
  );
}

// (§16) post-submission confirmation: evidence created but NOT auto-verified
function ConfirmEvidenceModal({ data, open, onClose }: { data: { skills: string[] } | null; open: boolean; onClose: () => void }) {
  if (!data) return null;
  return (
    <Modal open={open} onClose={onClose} title="Feedback Submitted" subtitle="Potential evidence created" size="sm">
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)] p-3">
          <CheckCircle2 className="mb-1 h-5 w-5 text-[var(--ss-teal-600)]" />
          <p className="text-sm font-bold text-[var(--ss-ink)]">Potential evidence created for:</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.skills.length > 0 ? data.skills.map((s) => <span key={s} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-teal-600)] ring-1 ring-[var(--ss-teal-100)]">{s}</span>) : <span className="text-[10px] text-[var(--ss-muted)]">No skill scores submitted.</span>}
          </div>
        </div>
        <div className="rounded-md border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]">
          <AlertTriangle className="mr-1 inline h-3 w-3 text-[var(--ss-orange-600)]" />
          Evidence is created but <b>not automatically verified</b>. Verification requires a faculty/industry review step.
        </div>
        <Button variant="orange" className="w-full" onClick={onClose}>Got it</Button>
      </div>
    </Modal>
  );
}

// ============================================================
// ANALYTICS (§65) — Talent Coverage / Skill Demand / Evidence-Backed Candidates
// ============================================================
function AnalyticsPage() {
  useAggregators();
  const ind = useIndustry();
  const demandPulse = useMemo(() => IndustryAggregator.getDemandPulse(), []);
  const talentSupply = useMemo(() => IndustryAggregator.getTalentSupply(), []);
  const apps = ind.applications;

  const evidenceBacked = ind.candidates.filter((c) => c.evidence.length > 0).length;
  const totalCandidates = ind.candidates.length;
  const avgCoverage = demandPulse.length > 0 ? Math.round(demandPulse.reduce((a, b) => a + b.talentCoverage, 0) / demandPulse.length) : 0;
  const funnel = {
    applied: apps.filter((a) => a.status === "APPLIED").length,
    review: apps.filter((a) => a.status === "UNDER_REVIEW").length,
    shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
    interview: apps.filter((a) => a.status === "INTERVIEW").length,
    selected: apps.filter((a) => a.status === "SELECTED").length,
  };

  return (
    <div className="space-y-6">
      <DashHeader title="Talent Analytics" subtitle="Skill-anchored · evidence-based — no generic KPI grid (§65)" icon={BarChart3} accent="#EA580C" />

      {/* (§65) Specific KPIs: Talent Coverage / Skill Demand / Evidence-Backed Candidates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SsStat label="Avg Talent Coverage" value={`${avgCoverage}%`} sub="across all demanded skills" icon={Layers} tone="orange" />
        <SsStat label="Skill Demand" value={demandPulse.length} sub="distinct skills demanded" icon={TrendingUp} tone="blue" />
        <SsStat label="Evidence-Backed Candidates" value={`${evidenceBacked}/${totalCandidates}`} sub="with at least 1 evidence record" icon={ShieldCheck} tone="teal" />
      </div>

      {/* Skill-level demand vs supply (no fabricated numbers) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Skill Demand vs Talent Supply</h3>
          <SsDataSourceLabel source="platform" />
        </div>
        {demandPulse.length === 0 ? (
          <p className="text-sm text-[var(--ss-muted)]">No published demand yet.</p>
        ) : (
          <div className="space-y-2.5">
            {demandPulse.slice(0, 8).map((d) => (
              <SsCoverageBar key={d.skillId} label={d.skillName} demand={100} supply={d.talentCoverage} />
            ))}
          </div>
        )}
      </SsCard>

      {/* Application funnel (from real applications) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Application Funnel</h3>
          <SsDataSourceLabel source="platform" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[["Applied", funnel.applied], ["Under Review", funnel.review], ["Shortlisted", funnel.shortlisted], ["Interview", funnel.interview], ["Selected", funnel.selected]].map(([label, count], i, arr) => (
            <span key={label as string} className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--ss-orange-50)] px-2.5 py-1 font-semibold text-[var(--ss-orange-600)]">{label}: {count as number}</span>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}
            </span>
          ))}
        </div>
      </SsCard>

      {/* Skill supply levels */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Talent Supply Levels</h3>
          <SsDataSourceLabel source="platform" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {talentSupply.slice(0, 8).map((s) => (
            <div key={s.skillId} className="flex items-center justify-between rounded-md border border-[var(--ss-border)] bg-white px-3 py-2 text-xs">
              <div>
                <p className="font-semibold text-[var(--ss-ink)]">{s.skillName}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{s.demonstratedBy} candidates · avg {s.avgCompetency}</p>
              </div>
              <SsBadge tone={s.supplyLevel === "Strong" ? "teal" : s.supplyLevel === "Moderate" ? "blue" : "orange"} className="text-[9px]">{s.supplyLevel}</SsBadge>
            </div>
          ))}
        </div>
      </SsCard>
    </div>
  );
}

// ============================================================
// LEARNING HUB (§34) — keep
// ============================================================
function LearningHubPage() {
  const ind = useIndustry();
  const learningOpps = ind.opportunities.filter((o) => ["TRAINING", "WORKSHOP", "CERTIFICATION", "MENTORSHIP"].includes(o.type));
  return (
    <div className="space-y-6">
      <DashHeader title="Learning Hub" subtitle="Publish training, workshops, certifications & mentorship" icon={BookOpen} accent="#EA580C" />
      {learningOpps.length === 0 ? <EmptyState icon={BookOpen} title="No learning programs" hint="Publish learning opportunities from Create Opportunity." /> : (
        <div className="grid gap-3 sm:grid-cols-2">{learningOpps.map((o) => (
          <SsCard key={o.id} tone="lift" className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
              <SsBadge tone="orange" className="text-[10px]">{o.type}</SsBadge>
            </div>
            <p className="mt-1 text-[10px] text-[var(--ss-muted)]">{o.provider} · {o.duration}</p>
            <div className="mt-2 flex flex-wrap gap-1">{o.requiredSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] text-[var(--ss-muted)]">{s.skillName}</span>)}</div>
          </SsCard>
        ))}</div>
      )}
    </div>
  );
}

// ============================================================
// NOTIFICATIONS (§54) — keep, light restyle
// ============================================================
function NotificationsPage() {
  const ind = useIndustry();
  const { markAllNotificationsRead, markNotificationRead } = useIndustryStore();
  return (
    <div className="space-y-6">
      <DashHeader title="Notifications" subtitle="Real prototype events from application/invitation/feedback" icon={Bell} accent="#EA580C" action={<Button variant="outline" size="sm" className="h-8" onClick={markAllNotificationsRead}>Mark all read</Button>} />
      {ind.notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">{ind.notifications.map((n) => (
          <div key={n.id} className={cn("rounded-lg border p-3", n.read ? "border-[var(--ss-border)] bg-white" : "border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)]")}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ss-ink)]">{n.title}</p>
              <span className="text-[10px] text-[var(--ss-faint)]">{n.time.slice(0, 10)}</span>
            </div>
            <p className="text-[11px] text-[var(--ss-muted)]">{n.detail}</p>
            {!n.read && <button onClick={() => markNotificationRead(n.id)} className="mt-1 text-[10px] font-semibold text-[var(--ss-orange-600)]">Mark read</button>}
          </div>
        ))}</div>
      )}
    </div>
  );
}

// ============================================================
// PROFILE (§51, §52) — keep, light restyle
// ============================================================
function ProfilePage() {
  const auditLog = useIndustryStore((s) => s.auditLog);
  return (
    <div className="space-y-6">
      <DashHeader title="Industry Profile" subtitle={`${DEMO_COMPANY.companyName} · ${DEMO_INDUSTRY_USER.role}`} icon={User} accent="#EA580C" />
      <SsCard tone="soft" className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]"><Building2 className="h-7 w-7" /></span>
          <div>
            <p className="text-lg font-bold text-[var(--ss-ink)]">{DEMO_COMPANY.companyName}</p>
            <p className="text-xs text-[var(--ss-muted)]">{DEMO_COMPANY.industry} · {DEMO_COMPANY.location}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--ss-ink-soft)]">{DEMO_COMPANY.about}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.activeOpportunities}</p><p className="text-[10px] text-[var(--ss-muted)]">Active Opps</p></div>
          <div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.challenges}</p><p className="text-[10px] text-[var(--ss-muted)]">Challenges</p></div>
          <div><p className="text-lg font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.mentors}</p><p className="text-[10px] text-[var(--ss-muted)]">Mentors</p></div>
        </div>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--ss-ink)]">User Profile</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Name" value={DEMO_INDUSTRY_USER.name} />
          <Field label="Role" value={DEMO_INDUSTRY_USER.role} />
          <Field label="Organization" value={DEMO_INDUSTRY_USER.organization} />
          <Field label="Email" value={DEMO_INDUSTRY_USER.email} />
        </div>
      </SsCard>
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Audit Log</h3>
          <SsDataSourceLabel source="platform" />
        </div>
        <div className="space-y-1">
          {auditLog.slice(0, 8).map((a) => (
            <div key={a.id} className="flex justify-between text-[11px]">
              <span className="text-[var(--ss-ink-soft)]"><b>{a.actor}</b> — {a.action} ({a.entity})</span>
              <span className="text-[var(--ss-faint)]">{a.timestamp.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </SsCard>
    </div>
  );
}
