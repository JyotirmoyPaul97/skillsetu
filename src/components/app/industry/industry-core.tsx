"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Target, PlusCircle, Briefcase, Users, MapPin,
  Award, Sparkles, CheckCircle2, ChevronRight,
  ArrowRight, Search, Bookmark, X, BookOpen, Trophy, Boxes, FileText,
  TrendingUp, AlertTriangle, Brain, BarChart3, Layers,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useIndustry, IndustryService, useIndustryStore } from "@/lib/industry";
import { useCareerStore } from "@/lib/career";
import { DEMO_COMPANY, DEMO_INDUSTRY_USER } from "@/lib/industry/candidates";
import { ALL_ROLES, COMPETENCY_TARGET_THRESHOLD } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import { IndustryAggregator, useAggregators } from "@/lib/intelligence/aggregators";
import type { Candidate, DemandConfig, DemandSkill, SkillImportance } from "@/lib/industry/industry-model";
import type { Opportunity, MatchResult, ApplicationStatus, OpportunityType } from "@/lib/career/opportunity-model";
import {
  DashHeader, Modal, Drawer, DemoBadge, EmptyState, Field, MatchBadge,
} from "@/components/app/student-parts";
import { SsCard, SsBadge } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import {
  SsDemandBadge, SsCoverageBar, SsPipeline, SsWorkflowBanner, SsWhyModal,
  SsWhyFactor, SsAlertPill, SsDataSourceLabel, SsIntelligenceAssistant,
} from "@/components/ui/ss-intelligence";
import { cn } from "@/lib/utils";

export function IndustryCore({ section }: { section: string }) {
  if (section === "dashboard") return <IndustryDashboard />;
  if (section === "demand") return <DemandIntelligence />;
  if (section === "post") return <CreateOpportunity />;
  if (section === "management") return <OpportunityManagement />;
  if (section === "talent") return <TalentDiscovery />;
  return <IndustryDashboard />;
}

// ============================================================
// DASHBOARD — Phase 9 §63 hierarchy:
// WHAT WE NEED → WHO CAN DEMONSTRATE IT → WHY THEY MATCH
// → WHAT IS MISSING → WHAT SHOULD WE DO
// ============================================================
function IndustryDashboard() {
  const { navigate } = useRouter();
  useAggregators(); // subscribe for reactivity

  const demandPulse = useMemo(() => IndustryAggregator.getDemandPulse(), []);
  const whatWeNeed = useMemo(() => IndustryAggregator.getWhatWeNeed() as unknown as Array<{
    roleId: string;
    roleName: string;
    opportunityCount: number;
    criticalSkills: Array<{ skillId: string; skillName: string; requiredLevel: number; importance: string; availableCandidates: number }>;
    overallAvailability: number;
    insufficient: boolean;
  }>, []);
  const talentSupply = useMemo(() => IndustryAggregator.getTalentSupply().filter((s) => s.inDemand), []);
  const summary = useMemo(() => IndustryAggregator.getIndustryIntelligenceSummary(), []);
  const ind = useIndustry();
  const opps = ind.opportunities.filter((o) => o.status === "Published");

  return (
    <div className="space-y-6">
      {/* HERO HEADER (§1) */}
      <SsCard tone="pop" className="overflow-hidden border-[var(--ss-orange-100)]">
        <div className="relative bg-gradient-to-br from-[var(--ss-navy-900)] via-[var(--ss-navy-800)] to-[var(--ss-navy-900)] p-6 text-white sm:p-8">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--ss-orange-600)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Industry Talent Intelligence</span>
              <SsWorkflowBanner
                tone="orange"
                steps={["Define Skills", "Set Levels", "Discover", "Compare", "Shortlist", "Interview", "Engage"]}
              />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">INDUSTRY TALENT INTELLIGENCE</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">Turn skill requirements into evidence-backed talent discovery. Define what you need. See who can demonstrate it. Build teams from real evidence — not résumés.</p>

            {/* Contextual controls (§1) */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ContextChip label="Organization" value={DEMO_COMPANY.companyName} />
              <ContextChip label="Open Roles" value={`${opps.length} opportunities`} />
              <ContextChip label="Role Focus" value="Data & ML" />
              <ContextChip label="Date Range" value="This Quarter" />
              <div className="ml-auto flex items-center gap-2">
                <SsDataSourceLabel source="platform" className="text-white/70" />
              </div>
            </div>
          </div>
        </div>
      </SsCard>

      {/* WHAT WE NEED (§3) — most prominent panel */}
      <section>
        <SectionLabel n={1} title="WHAT WE NEED" tone="orange" subtitle="Top demanded roles, critical skills + required levels" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {whatWeNeed.length === 0 ? (
            <SsCard tone="soft" className="p-5 md:col-span-2 lg:col-span-3">
              <EmptyState icon={Target} title="No published demand yet" hint="Publish an opportunity to populate this panel." action={<Button size="sm" variant="orange" onClick={() => navigate("/industry/post")}><PlusCircle className="h-3.5 w-3.5" /> Create Opportunity</Button>} />
            </SsCard>
          ) : whatWeNeed.map((r) => (
            <SsCard key={r.roleId} tone="lift" className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{r.roleName}</p>
                  <p className="text-[10px] text-[var(--ss-muted)]">{r.opportunityCount} open opportunities</p>
                </div>
                <SsBadge tone="orange" className="text-[10px]">{r.criticalSkills.length} skills</SsBadge>
              </div>
              <div className="mt-3 space-y-1.5">
                {r.criticalSkills.slice(0, 5).map((s) => (
                  <div key={s.skillId} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ss-ink-soft)]">{s.skillName}</span>
                    <span className="flex items-center gap-1.5">
                      <SsBadge tone={s.importance === "Critical" || s.importance === "High" ? "orange" : "blue"} className="text-[9px]">{s.importance}</SsBadge>
                      <span className="font-semibold text-[var(--ss-ink)]">≥ {s.requiredLevel}</span>
                    </span>
                  </div>
                ))}
              </div>
              {r.insufficient && (
                <div className="mt-2"><SsAlertPill tone="warning" label="Insufficient talent coverage" /></div>
              )}
              <Button variant="outline" size="sm" className="mt-3 h-8 w-full text-[11px]" onClick={() => navigate("/industry/demand")}>
                View Role Demand <ArrowRight className="h-3 w-3" />
              </Button>
            </SsCard>
          ))}
        </div>
      </section>

      {/* WHO CAN DEMONSTRATE IT (§4) — talent pool evidence */}
      <section>
        <SectionLabel n={2} title="WHO CAN DEMONSTRATE IT" tone="blue" subtitle="What the talent pool can evidence — for in-demand skills" />
        <SsCard tone="soft" className="p-5">
          {talentSupply.length === 0 ? (
            <p className="text-sm text-[var(--ss-muted)]">No talent supply data yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {talentSupply.slice(0, 9).map((s) => {
                const demand = demandPulse.find((d) => d.skillId === s.skillId);
                const supplyTone: "Strong" | "Moderate" | "Limited" | "Low Evidence" | "None" = s.supplyLevel;
                const supplyBadgeTone = supplyTone === "Strong" ? "teal" as const
                  : supplyTone === "Moderate" ? "blue" as const
                  : supplyTone === "Limited" ? "orange" as const
                  : "neutral" as const;
                return (
                  <div key={s.skillId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[var(--ss-ink)]">{s.skillName}</p>
                      <SsBadge tone={supplyBadgeTone} className="text-[9px]">{s.supplyLevel} supply</SsBadge>
                    </div>
                    <div className="mt-2">
                      <SsCoverageBar
                        label="Industry demand vs talent evidence"
                        demand={demand?.talentCoverage && demand.talentCoverage > 0 ? 100 : 60}
                        supply={s.avgCompetency}
                        required={demand?.requiredRoleLevels?.[0]?.requiredLevel ?? COMPETENCY_TARGET_THRESHOLD}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--ss-muted)]">
                      <span>Avg competency: <b className="text-[var(--ss-ink-soft)]">{s.avgCompetency}</b></span>
                      <span>Demonstrated by: <b className="text-[var(--ss-ink-soft)]">{s.demonstratedBy}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <SsDataSourceLabel source="platform" />
            <Button variant="blue" size="sm" className="h-8 gap-1.5" onClick={() => navigate("/industry/talent")}>
              <Users className="h-3.5 w-3.5" /> DISCOVER EVIDENCE-BACKED TALENT
            </Button>
          </div>
        </SsCard>
      </section>

      {/* WHY THEY MATCH (§5 preview) */}
      <section>
        <SectionLabel n={3} title="WHY THEY MATCH" tone="teal" subtitle="Top candidates vs open roles — same engine as Student Portal" />
        <SsCard tone="soft" className="p-5">
          <div className="grid gap-3 md:grid-cols-3">
            {summary.whyTheyMatch.map(({ candidate, roleReadiness }) => {
              const bestOpp = ind.publishedOpps
                .map((o) => ({ o, m: ind.candidateMatches[candidate.studentId]?.[o.id] }))
                .sort((a, b) => (b.m?.matchScore ?? 0) - (a.m?.matchScore ?? 0))[0];
              return (
                <div key={candidate.studentId} className="rounded-lg border border-[var(--ss-border)] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: candidate.avatarColor }}>{candidate.name.slice(0, 1)}</span>
                      <div>
                        <p className="text-xs font-bold text-[var(--ss-ink)]">{candidate.name}</p>
                        <p className="text-[10px] text-[var(--ss-muted)]">{candidate.targetRole}</p>
                      </div>
                    </div>
                    {bestOpp?.m && <MatchBadge score={bestOpp.m.matchScore} />}
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Role readiness: <b className="text-[var(--ss-teal-600)]">{roleReadiness}%</b> · Evidence: <b className="text-[var(--ss-ink-soft)]">{candidate.evidence.length}</b></p>
                </div>
              );
            })}
          </div>
        </SsCard>
      </section>

      {/* WHAT IS MISSING (§6) */}
      <section>
        <SectionLabel n={4} title="WHAT IS MISSING" tone="orange" subtitle="Skills with insufficient talent coverage" />
        <SsCard tone="soft" className="p-5">
          {summary.whatIsMissing.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[var(--ss-teal-600)]"><CheckCircle2 className="h-4 w-4" /> All demanded skills have sufficient coverage.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {summary.whatIsMissing.map((m) => (
                <div key={m.skillId} className="flex items-center gap-2 rounded-lg border border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] px-3 py-2">
                  <SsAlertPill tone="warning" label={`Low coverage: ${m.talentCoverage}%`} />
                  <div className="text-xs">
                    <p className="font-bold text-[var(--ss-ink)]">{m.skillName}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{m.openRoles} open roles · {m.openChallenges} open challenges</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3"><SsDataSourceLabel source="platform" /></div>
        </SsCard>
      </section>

      {/* WHAT SHOULD WE DO (§7) */}
      <section>
        <SectionLabel n={5} title="WHAT SHOULD WE DO" tone="navy" subtitle="Suggested actions to close the demand-supply gap" />
        <SsCard tone="soft" className="p-5">
          {summary.whatShouldWeDo.length === 0 ? (
            <p className="text-sm text-[var(--ss-muted)]">No outstanding actions — talent supply matches demand.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summary.whatShouldWeDo.map((s, i) => (
                <div key={i} className="rounded-lg border border-[var(--ss-border)] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <SsAlertPill tone="info" label={s.skill} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--ss-ink-soft)]">{s.suggestion}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <ActionChip icon={Briefcase} label="Create Internship" onClick={() => navigate("/industry/post")} />
                    <ActionChip icon={FileText} label="Create Project" onClick={() => navigate("/industry/post")} />
                    <ActionChip icon={Trophy} label="Create Challenge" onClick={() => navigate("/industry/challenges")} />
                    <ActionChip icon={BookOpen} label="Offer Workshop" onClick={() => navigate("/industry/learning")} />
                    <ActionChip icon={Users} label="Find Mentor" onClick={() => navigate("/industry/talent")} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SsCard>
      </section>

      {/* Intelligence Assistant (§8) — AI EXPLAINS, RULES CALCULATE */}
      <SsIntelligenceAssistant
        tone="orange"
        title="Why this talent intelligence? Ask the engine."
        questions={[
          { id: "why-candidate", label: "Why was this candidate recommended?" },
          { id: "hardest-source", label: "Which skills are hardest to source?" },
          { id: "pool-lacks", label: "What does our talent pool lack?" },
          { id: "challenge-require", label: "What should this challenge require?" },
        ]}
        answered={{
          "why-candidate": <span>Top candidates were ranked by the Phase 4 match engine — 40% skill alignment, 15% evidence strength, 5% availability. Highest match: <b>{summary.whyTheyMatch[0]?.candidate.name ?? "—"}</b> against their best-fit open role.</span>,
          "hardest-source": <span>{summary.whatIsMissing[0] ? <><b>{summary.whatIsMissing[0].skillName}</b> has the lowest talent coverage ({summary.whatIsMissing[0].talentCoverage}%). Consider a challenge or workshop pipeline.</> : "All demanded skills have sufficient coverage."}</span>,
          "pool-lacks": <span>{summary.whatIsMissing.length > 0 ? `${summary.whatIsMissing.length} skill(s) currently lack sufficient evidence-backed talent: ${summary.whatIsMissing.map((m) => m.skillName).join(", ")}.` : "The pool covers all currently demanded skills."}</span>,
          "challenge-require": <span>Base required levels on the role-config target threshold ({COMPETENCY_TARGET_THRESHOLD}/100). For in-demand skills with low coverage, require {Math.max(50, COMPETENCY_TARGET_THRESHOLD - 10)} so the challenge surfaces candidates while still filtering for capability.</span>,
        }}
      />

      <div className="flex items-center justify-between text-[10px] text-[var(--ss-muted)]">
        <SsDataSourceLabel source="platform" />
        <SsDataSourceLabel source="demo" />
      </div>
    </div>
  );
}

function ContextChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur">
      <span className="text-white/60 uppercase tracking-wide">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function SectionLabel({ n, title, subtitle, tone }: { n: number; title: string; subtitle: string; tone: "orange" | "blue" | "teal" | "navy" }) {
  const toneMap = {
    orange: "bg-[var(--ss-orange-600)] text-white",
    blue: "bg-[var(--ss-blue-600)] text-white",
    teal: "bg-[var(--ss-teal-600)] text-white",
    navy: "bg-[var(--ss-navy-900)] text-white",
  };
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold", toneMap[tone])}>{n}</span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-[var(--ss-ink)] sm:text-lg">{title}</h2>
          <p className="text-[11px] text-[var(--ss-muted)]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function ActionChip({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 rounded-md border border-[var(--ss-border)] bg-white px-2 py-1 text-[10px] font-semibold text-[var(--ss-ink-soft)] hover:border-[var(--ss-orange-600)] hover:bg-[var(--ss-orange-50)] hover:text-[var(--ss-orange-600)]">
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

// ============================================================
// DEMAND PULSE PAGE — SsPipeline + demand configs
// (Phase 9 §10)
// ============================================================
function DemandIntelligence() {
  const { demandConfigs, createDemand, updateDemand } = useIndustryStore();
  useAggregators();
  const demandPulse = useMemo(() => IndustryAggregator.getDemandPulse(), []);
  const [showForm, setShowForm] = useState(false);

  const pipelineStages = [
    { key: "create", label: "Create Role Demand" },
    { key: "skills", label: "Define Skills" },
    { key: "levels", label: "Set Required Levels" },
    { key: "discover", label: "Discover Talent" },
    { key: "compare", label: "Compare Evidence" },
    { key: "shortlist", label: "Shortlist" },
    { key: "interview", label: "Interview" },
    { key: "engage", label: "Engage" },
  ];

  return (
    <div className="space-y-6">
      <DashHeader title="Demand Pulse" subtitle="Define role requirements using centralized skills + see live talent coverage" icon={Target} accent="#EA580C" action={<Button variant="orange" size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}><PlusCircle className="h-3.5 w-3.5" /> Define Role Demand</Button>} />

      {/* DEMAND → CANDIDATE WORKFLOW pipeline (§10) */}
      <SsCard tone="soft" className="p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Demand → Candidate Workflow</p>
        <SsPipeline stages={pipelineStages} activeIndex={0} />
      </SsCard>

      {/* DEMAND PULSE BY SKILL (§3) */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Demand Pulse — by Skill</h3>
          <SsDataSourceLabel source="platform" />
        </div>
        {demandPulse.length === 0 ? (
          <p className="text-sm text-[var(--ss-muted)]">No demand data yet. Publish an opportunity to populate the pulse.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {demandPulse.map((d) => (
              <div key={d.skillId} className={cn("rounded-lg border bg-white p-4", d.insufficientCoverage ? "border-[var(--ss-orange-100)] ring-1 ring-[var(--ss-orange-50)]" : "border-[var(--ss-border)]")}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[var(--ss-ink)]">{d.skillName}</p>
                  <SsDemandBadge level={d.demandLevel === "High" ? "High" : d.demandLevel === "Medium" ? "Medium" : "Low"} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-[var(--ss-muted)]">
                  <div><p className="font-bold text-[var(--ss-ink-soft)]">{d.opportunityCount}</p><p>opps</p></div>
                  <div><p className="font-bold text-[var(--ss-ink-soft)]">{d.openRoles}</p><p>roles</p></div>
                  <div><p className="font-bold text-[var(--ss-ink-soft)]">{d.openChallenges}</p><p>challenges</p></div>
                </div>
                <div className="mt-3">
                  <SsCoverageBar label="Talent coverage" demand={100} supply={d.talentCoverage} />
                </div>
                {d.insufficientCoverage && (
                  <div className="mt-2"><SsAlertPill tone="warning" label="Insufficient talent coverage" /></div>
                )}
              </div>
            ))}
          </div>
        )}
      </SsCard>

      {/* EXISTING DEMAND CONFIGS — with new visual language */}
      <SsCard tone="soft" className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--ss-ink)]">Role Demand Configs</h3>
          <SsBadge tone="neutral" className="text-[10px]">{demandConfigs.length} saved</SsBadge>
        </div>
        {demandConfigs.length === 0 ? (
          <EmptyState icon={Target} title="No demand configs" hint="Create a role demand to define required skills." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">{demandConfigs.map((d) => <DemandCard key={d.id} config={d} />)}</div>
        )}
      </SsCard>

      {showForm && <DemandForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function DemandCard({ config }: { config: DemandConfig }) {
  return (
    <SsCard tone="lift" className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--ss-ink)]">{config.roleName}</h3>
        <SsBadge tone="orange" className="text-[10px]">{config.opportunityType}</SsBadge>
      </div>
      <div className="mt-3 space-y-2">
        {config.skills.map((s) => (
          <div key={s.skillId} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--ss-ink-soft)]">{s.skillName}</span>
              <span className="flex items-center gap-1.5">
                <SsBadge tone={s.importance === "Critical" || s.importance === "High" ? "orange" : "blue"} className="text-[9px]">{s.importance}</SsBadge>
                <span className="text-[var(--ss-muted)]">≥ {s.requiredLevel}</span>
              </span>
            </div>
            <SsCoverageBar label="" demand={s.requiredLevel} supply={s.requiredLevel} required={s.requiredLevel} />
          </div>
        ))}
      </div>
    </SsCard>
  );
}

function DemandForm({ onClose }: { onClose: () => void }) {
  const { createDemand } = useIndustryStore();
  const [roleId, setRoleId] = useState("data-scientist");
  const [skills, setSkills] = useState<DemandSkill[]>([]);
  const [oppType, setOppType] = useState<OpportunityType>("INTERNSHIP");
  const role = ALL_ROLES.find((r) => r.roleId === roleId)!;

  const addSkill = (skillId: string, skillName: string) => {
    if (skills.some((s) => s.skillId === skillId)) return;
    setSkills([...skills, { skillId, skillName, importance: "High", requiredLevel: COMPETENCY_TARGET_THRESHOLD }]);
  };
  const updateSkill = (i: number, updates: Partial<DemandSkill>) => setSkills(skills.map((s, j) => j === i ? { ...s, ...updates } : s));

  const submit = () => {
    createDemand({ roleId, roleName: role.roleName, skills, opportunityType: oppType, eligibility: { yearMin: 2 } });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Define Role Demand" subtitle="Skills use centralized SKILL SETU records — every role pulls from the same skillIds" size="lg">
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-[11px] font-semibold">Role</label><select value={roleId} onChange={(e) => { setRoleId(e.target.value); setSkills([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select></div>
        <div><label className="text-[11px] font-semibold">Opportunity Type</label><select value={oppType} onChange={(e) => setOppType(e.target.value as OpportunityType)} className="mt-1 h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option value="JOB">Job</option><option value="INTERNSHIP">Internship</option><option value="PROJECT">Project</option><option value="APPRENTICESHIP">Apprenticeship</option></select></div>
        <div><label className="text-[11px] font-semibold">Required Skills (from centralized skill records)</label><div className="mt-2 flex flex-wrap gap-1.5">{role.skills.map((s) => <button key={s.skillId} onClick={() => addSkill(s.skillId, s.skillName)} className="rounded-full border border-[var(--ss-border)] px-2.5 py-0.5 text-[11px] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]">+ {s.skillName}</button>)}</div></div>
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

// ============================================================
// CREATE OPPORTUNITY (§11, §12) — problem-first + Opportunity Intelligence
// ============================================================
function CreateOpportunity() {
  const { navigate } = useRouter();
  const { addOpportunity } = useCareerStore();
  const [form, setForm] = useState({
    problem: "", title: "", type: "INTERNSHIP" as OpportunityType,
    company: DEMO_COMPANY.companyName, location: DEMO_COMPANY.location,
    mode: "Hybrid" as any, description: "", duration: "",
    compensationType: "Stipend" as any, compensationAmount: "",
    deadline: "2026-12-31", roleId: "data-scientist",
  });
  const [reqSkills, setReqSkills] = useState<{ skillId: string; skillName: string; requiredLevel: number; importance: SkillImportance }[]>([]);
  const role = ALL_ROLES.find((r) => r.roleId === form.roleId)!;

  // Live Opportunity Intelligence (§12) — recomputes as user picks required skills
  const intel = useMemo(
    () => IndustryAggregator.getOpportunityIntelligence(reqSkills.map((s) => ({ skillId: s.skillId, requiredLevel: s.requiredLevel }))),
    [reqSkills],
  );

  const submit = () => {
    const now = new Date().toISOString();
    addOpportunity({
      id: "opp-" + Math.random().toString(36).slice(2, 9),
      title: form.title || "Untitled Opportunity",
      company: form.company, organizationType: "Industry",
      description: form.description, type: form.type, location: form.location,
      mode: form.mode, duration: form.duration,
      compensationType: form.compensationType, compensationAmount: form.compensationAmount,
      applicationDeadline: form.deadline,
      requiredSkills: reqSkills.map((s) => ({ skillId: s.skillId, skillName: s.skillName, importance: 1, requiredLevel: s.requiredLevel })),
      targetRoles: [form.roleId], eligibilityRules: { yearMin: 2 },
      responsibilities: [], qualifications: [], benefits: [],
      problem: form.problem,
      status: "Published", createdAt: now, updatedAt: now,
    });
    navigate("/industry/management");
  };

  return (
    <div className="space-y-6">
      <DashHeader title="Create Opportunity" subtitle="Problem-first · evidence-driven · live talent preview before publish" icon={PlusCircle} accent="#EA580C" />

      <SsWorkflowBanner tone="orange" steps={["Define Problem", "Set Skills", "Preview Talent", "Publish"]} className="rounded-lg border border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] px-3 py-2" />

      <SsCard tone="soft" className="space-y-4 p-5">
        {/* 1. PROBLEM-FIRST */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--ss-orange-600)] uppercase tracking-wide">What problem are you hiring/engaging for?</label>
          <textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} rows={2} placeholder="e.g. We need to build a churn-prediction pipeline for our SaaS product. The candidate should be able to demonstrate ML modeling, feature engineering, and SQL proficiency." className="w-full rounded-md border border-[var(--ss-border)] bg-white p-2.5 text-sm" />
          <p className="text-[10px] text-[var(--ss-muted)]">Lead with the problem — opportunities framed around real-world tasks surface better candidates (Phase 9 §11).</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field2 label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Opportunity Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OpportunityType })} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option value="JOB">Job</option><option value="INTERNSHIP">Internship</option><option value="PROJECT">Project</option><option value="APPRENTICESHIP">Apprenticeship</option></select></div>
          <Field2 label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <Field2 label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Mode</label><select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></div>
          <Field2 label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <Field2 label="Compensation" value={form.compensationAmount} onChange={(v) => setForm({ ...form, compensationAmount: v })} />
          <Field2 label="Deadline (YYYY-MM-DD)" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
          <div className="space-y-1"><label className="text-[11px] font-semibold">Target Role</label><select value={form.roleId} onChange={(e) => { setForm({ ...form, roleId: e.target.value }); setReqSkills([]); }} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm">{ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select></div>
        </div>

        <div className="space-y-1"><label className="text-[11px] font-semibold">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-md border border-[var(--ss-border)] bg-white p-2 text-sm" /></div>

        {/* 2. REQUIRED SKILLS — with Importance + Required Levels */}
        <div>
          <label className="text-[11px] font-semibold">Required Skills (with Importance + Required Level)</label>
          <div className="mt-2 flex flex-wrap gap-1.5">{role.skills.map((s) => {
            const selected = reqSkills.find((x) => x.skillId === s.skillId);
            return (
              <button key={s.skillId} onClick={() => {
                if (selected) {
                  setReqSkills(reqSkills.filter((x) => x.skillId !== s.skillId));
                } else {
                  setReqSkills([...reqSkills, { skillId: s.skillId, skillName: s.skillName, requiredLevel: COMPETENCY_TARGET_THRESHOLD, importance: "High" }]);
                }
              }} className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", selected ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-ink-soft)]")}>
                {selected ? "✓ " : "+ "}{s.skillName}
              </button>
            );
          })}</div>
        </div>

        {reqSkills.length > 0 && (
          <div className="space-y-2">
            {reqSkills.map((s, i) => (
              <div key={s.skillId} className="flex items-center gap-2 rounded-lg bg-[var(--ss-surface-2)] p-2.5">
                <span className="flex-1 text-sm font-medium text-[var(--ss-ink)]">{s.skillName}</span>
                <select value={s.importance} onChange={(e) => setReqSkills(reqSkills.map((x, j) => j === i ? { ...x, importance: e.target.value as SkillImportance } : x))} className="h-8 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
                <input type="number" min={0} max={100} value={s.requiredLevel} onChange={(e) => setReqSkills(reqSkills.map((x, j) => j === i ? { ...x, requiredLevel: Number(e.target.value) } : x))} className="h-8 w-14 rounded-md border border-[var(--ss-border)] bg-white px-2 text-xs" />
                <button onClick={() => setReqSkills(reqSkills.filter((_, j) => j !== i))} className="rounded-md p-1 text-[var(--ss-faint)]"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        {/* 3. EXPECTED TALENT AVAILABILITY — live panel using getOpportunityIntelligence */}
        {reqSkills.length > 0 && (
          <SsCard tone="flat" className={cn("border-2 p-4", intel.limited ? "border-[var(--ss-orange-200)]" : "border-[var(--ss-teal-100)]")}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--ss-blue-600)]" />
                <h4 className="text-sm font-bold text-[var(--ss-ink)]">Expected Talent Availability</h4>
              </div>
              <SsDataSourceLabel source="platform" />
            </div>
            <div className="mb-3 flex items-center gap-3 text-sm">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-[var(--ss-ink)]">{intel.overallCoverage}%</span>
                <span className="text-[10px] text-[var(--ss-muted)]">overall coverage</span>
              </div>
              {intel.limited && <SsAlertPill tone="warning" label="Limited talent — consider a pipeline" />}
            </div>
            <div className="space-y-2">
              {intel.perSkill.map((p) => (
                <SsCoverageBar
                  key={p.skillId}
                  label={p.skillName}
                  demand={p.requiredLevel}
                  supply={p.coverage}
                  required={p.requiredLevel}
                  suffix="%"
                />
              ))}
            </div>
            <div className="mt-3 rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-2 text-[11px] text-[var(--ss-ink-soft)]">
              <span className="font-semibold">Suggestion:</span> {intel.suggestion}
            </div>
            <p className="mt-2 text-[10px] text-[var(--ss-muted)]">Matching candidates: {intel.perSkill.reduce((a, b) => a + b.matchingCandidates, 0)} · Total demo candidates: {intel.perSkill[0]?.totalCandidates ?? 0}</p>
          </SsCard>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/industry/management")}>Cancel</Button>
          <Button variant="orange" onClick={submit} disabled={!form.title || reqSkills.length === 0} className="gap-1.5">
            <PlusCircle className="h-3.5 w-3.5" /> Publish Opportunity
          </Button>
        </div>
      </SsCard>
    </div>
  );
}

function Field2({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div className="space-y-1"><label className="text-[11px] font-semibold text-[var(--ss-ink-soft)]">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-white px-2.5 text-sm" /></div>;
}

// ============================================================
// OPPORTUNITY MANAGEMENT (§13) — light restyle with new primitives
// ============================================================
function OpportunityManagement() {
  const ind = useIndustry();
  const [tab, setTab] = useState<"active" | "drafts" | "closed">("active");
  const opps = ind.opportunities.filter((o) => tab === "active" ? o.status === "Published" : tab === "drafts" ? o.status === "Draft" : o.status === "Closed");
  const [manageOpp, setManageOpp] = useState<Opportunity | null>(null);
  return (
    <div className="space-y-6">
      <DashHeader title="Opportunity Management" subtitle="Manage your opportunities & applicants" icon={Briefcase} accent="#EA580C" />
      <div className="flex gap-1.5">
        {(["active", "drafts", "closed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", tab === t ? "bg-[var(--ss-orange-600)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)]")}>{t}</button>
        ))}
      </div>
      {opps.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities" hint="Create an opportunity to start building your talent pipeline." action={<Button size="sm" variant="orange" onClick={() => (window.location.hash = "/industry/post")}><PlusCircle className="h-3.5 w-3.5" /> Create Opportunity</Button>} />
      ) : (
        <div className="space-y-2.5">
          {opps.map((o) => {
            const apps = ind.applications.filter((a) => a.opportunityId === o.id);
            const intelligence = IndustryAggregator.getOpportunityIntelligence(o.requiredSkills.map((rs) => ({ skillId: rs.skillId, requiredLevel: rs.requiredLevel })));
            return (
              <SsCard key={o.id} tone="lift" className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--ss-ink)]">{o.title}</p>
                      <SsBadge tone="orange" className="text-[10px]">{o.type}</SsBadge>
                    </div>
                    <p className="mt-0.5 text-[10px] text-[var(--ss-muted)]">{o.company} · Deadline: {o.applicationDeadline}</p>
                    {o.problem && <p className="mt-1 text-[11px] italic text-[var(--ss-ink-soft)]">“{o.problem.slice(0, 80)}{o.problem.length > 80 ? "…" : ""}”</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <SsBadge tone="blue" className="text-[10px]">{apps.length} applicants</SsBadge>
                    <SsBadge tone={intelligence.limited ? "orange" : "teal"} className="text-[9px]">{intelligence.overallCoverage}% coverage</SsBadge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setManageOpp(o)}>Manage Applicants</Button>
                  <SsDataSourceLabel source="platform" className="ml-auto" />
                </div>
              </SsCard>
            );
          })}
        </div>
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
    <Drawer open={open} onClose={onClose} title={`Applicants — ${opp.title}`} subtitle={`${apps.length} applications · ${opp.type}`}>
      <div className="space-y-3">
        <SsDataSourceLabel source="platform" />
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

// ============================================================
// TALENT DISCOVERY (§6–§9) — evidence-backed candidate search
// ============================================================
function TalentDiscovery() {
  const ind = useIndustry();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minCompetency, setMinCompetency] = useState(0);
  const [evidenceOnly, setEvidenceOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [whyMatch, setWhyMatch] = useState<{ candidate: Candidate; match: MatchResult; opp: Opportunity } | null>(null);

  const allSkillIds = Array.from(new Set(ind.candidates.flatMap((c) => Object.keys(c.competencies))));

  const filtered = ind.candidates.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.targetRole.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && c.roleId !== roleFilter) return false;
    if (skillFilter && !(c.competencies[skillFilter]?.competencyScore >= minCompetency)) return false;
    if (evidenceOnly && c.evidence.length === 0) return false;
    if (availableOnly && !c.available) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DashHeader title="DISCOVER EVIDENCE-BACKED TALENT" subtitle="Same data as Student Portal — no second engine" icon={Users} accent="#EA580C" action={<SsDataSourceLabel source="platform" />} />

      <SsWorkflowBanner tone="orange" steps={["Search", "Inspect Evidence", "Why Match?", "Shortlist", "Invite"]} className="rounded-lg border border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] px-3 py-2" />

      {/* SEARCH CONTROLS + FILTERS (§6) */}
      <SsCard tone="flat" className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white px-3 py-1.5">
            <Search className="h-4 w-4 text-[var(--ss-faint)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or role…" className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 rounded-lg border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            <option value="">All roles</option>
            {ALL_ROLES.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
          </select>
          <select value={skillFilter} onChange={(e) => { setSkillFilter(e.target.value); setMinCompetency(e.target.value ? 50 : 0); }} className="h-9 rounded-lg border border-[var(--ss-border)] bg-white px-2.5 text-sm">
            <option value="">All skills</option>
            {allSkillIds.map((sid) => <option key={sid} value={sid}>{SKILL_NAMES[sid] ?? sid}</option>)}
          </select>
          {skillFilter && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white px-2 py-1.5">
              <span className="text-[10px] font-semibold text-[var(--ss-muted)]">MIN COMPETENCY</span>
              <input type="range" min={0} max={100} value={minCompetency} onChange={(e) => setMinCompetency(Number(e.target.value))} className="w-24 accent-[var(--ss-orange-600)]" />
              <span className="w-7 text-xs font-bold text-[var(--ss-orange-600)]">{minCompetency}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterChip label={`Evidence Only`} active={evidenceOnly} onClick={() => setEvidenceOnly(!evidenceOnly)} />
          <FilterChip label={`Available Only`} active={availableOnly} onClick={() => setAvailableOnly(!availableOnly)} />
          <span className="ml-auto text-[10px] text-[var(--ss-muted)]">Showing {filtered.length} of {ind.candidates.length}</span>
        </div>
      </SsCard>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No candidates match these filters" hint="Try widening your filters." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">{filtered.map((c) => {
          const best = ind.publishedOpps.map((o) => ({ o, m: ind.candidateMatches[c.studentId]?.[o.id] })).filter((x) => x.m).sort((a, b) => (b.m?.matchScore ?? 0) - (a.m?.matchScore ?? 0))[0];
          return <CandidateCard key={c.studentId} candidate={c} match={best?.m} onView={() => setSelected(c)} onWhy={() => best && setWhyMatch({ candidate: c, match: best.m, opp: best.o })} />;
        })}</div>
      )}

      <CandidateProfileDrawer candidate={selected} open={!!selected} onClose={() => setSelected(null)} onWhy={(c, m, opp) => { setSelected(null); setWhyMatch({ candidate: c, match: m, opp }); }} />
      <WhyMatchModal data={whyMatch} open={!!whyMatch} onClose={() => setWhyMatch(null)} />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", active ? "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "border-[var(--ss-border)] text-[var(--ss-muted)]")}>
      {label}
    </button>
  );
}

function CandidateCard({ candidate: c, match, onView, onWhy }: { candidate: Candidate; match?: MatchResult; onView: () => void; onWhy: () => void }) {
  const topSkills = Object.values(c.competencies).sort((a, b) => b.competencyScore - a.competencyScore).slice(0, 3);
  const gapSkills = match?.missingSkills ?? [];
  return (
    <SsCard tone="lift" className="p-4">
      {/* (§7) Candidate card emphasizes evidence */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: c.avatarColor }}>{c.name.slice(0, 1)}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-[var(--ss-ink)]">{c.name}</p>
              <span className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--ss-muted)]">{c.studentId}</span>
            </div>
            <p className="text-[10px] text-[var(--ss-muted)]">{c.branch} · Y{c.year} · {c.college}</p>
          </div>
        </div>
        {match && <MatchBadge score={match.matchScore} />}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[var(--ss-muted)]">
        <span>Target: <b className="text-[var(--ss-ink-soft)]">{c.targetRole}</b></span>
        <span>Readiness: <b className="text-[var(--ss-teal-600)]">{c.roleReadiness}%</b></span>
        <span>Evidence: <b className="text-[var(--ss-ink-soft)]">{c.evidence.length}</b></span>
        <span>Available: <b className={c.available ? "text-[var(--ss-teal-600)]" : "text-[var(--ss-orange-600)]"}>{c.available ? "Yes" : "No"}</b></span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {topSkills.map((s) => <span key={s.skillId} className="rounded-full bg-[var(--ss-teal-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-teal-600)]">{s.skillName} {s.competencyScore}</span>)}
        {gapSkills.slice(0, 2).map((s) => <span key={s} className="rounded-full bg-[var(--ss-orange-50)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-orange-600)]">GAP: {s}</span>)}
      </div>
      <div className="mt-3 flex gap-1.5">
        <Button variant="outline" size="sm" className="h-8 flex-1 text-[11px]" onClick={onView}>View Evidence</Button>
        {match && <Button variant="blue" size="sm" className="h-8 text-[11px]" onClick={onWhy}>Why Match?</Button>}
      </div>
    </SsCard>
  );
}

// (§9) EVIDENCE-FIRST candidate detail
function CandidateProfileDrawer({ candidate: c, open, onClose, onWhy }: { candidate: Candidate | null; open: boolean; onClose: () => void; onWhy: (c: Candidate, m: MatchResult, opp: Opportunity) => void }) {
  const ind = useIndustry();
  const { shortlist, invite } = useIndustryStore();
  if (!c) return null;
  const best = ind.publishedOpps.map((o) => ({ o, m: ind.candidateMatches[c.studentId]?.[o.id] })).filter((x) => x.m).sort((a, b) => (b.m?.matchScore ?? 0) - (a.m?.matchScore ?? 0))[0];
  const comps = Object.values(c.competencies).sort((a, b) => b.competencyScore - a.competencyScore);

  return (
    <Drawer open={open} onClose={onClose} title={`${c.name} — ${c.studentId}`} subtitle={`${c.targetRole} · Readiness ${c.roleReadiness}%`}>
      <div className="space-y-4">
        <SsDataSourceLabel source="platform" />

        {/* EVIDENCE-FIRST (§9) */}
        <SsCard tone="flat" className="border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-teal-600)]">Can this person demonstrate the required skills?</p>
          <p className="mt-1 text-xs text-[var(--ss-ink-soft)]">Role readiness <b>{c.roleReadiness}%</b> · <b>{c.evidence.length}</b> evidence records · <b>{comps.filter((s) => s.evidenceCount > 0).length}</b> skills backed by evidence.</p>
        </SsCard>

        {best?.m && (
          <div className="rounded-lg border border-[var(--ss-blue-100)] bg-[var(--ss-blue-50)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--ss-blue-600)]">Best match: {best.o.title}</span>
              <MatchBadge score={best.m.matchScore} />
            </div>
          </div>
        )}

        {/* Skill Evidence list (EVIDENCE-FIRST) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Skill Evidence</p>
          <div className="mt-1 space-y-1">
            {comps.map((s) => (
              <div key={s.skillId} className="flex items-center justify-between text-xs">
                <span className="text-[var(--ss-ink-soft)]">{s.skillName}</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--ss-ink)]">{s.competencyScore}</span>
                  <SsBadge tone={s.evidenceCount > 0 ? "teal" : "neutral"} className="text-[9px]">{s.evidenceConfidence}</SsBadge>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Evidence Records ({c.evidence.length})</p>
          <div className="mt-1 max-h-64 space-y-1 overflow-y-auto">
            {c.evidence.map((e) => (
              <div key={e.evidenceId} className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--ss-ink-soft)]">{e.sourceTitle} · {e.skillName}</span>
                <SsBadge tone={e.status === "Evaluated" ? "teal" : "neutral"} className="text-[9px]">{e.status}</SsBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Projects / Hackathons / Industry Feedback / Certifications / Internships — sourced from evidence */}
        <EvidenceBreakdown candidate={c} />

        {best?.m && (
          <Button variant="blue" size="sm" className="h-8 w-full text-[11px]" onClick={() => onWhy(c, best.m, best.o)}>
            Why this candidate? →
          </Button>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="orange" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => shortlist(c.studentId, c.name, best?.o.id)}><Bookmark className="h-3 w-3" /> Shortlist</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, opportunityId: best?.o.id, opportunityTitle: best?.o.title, type: "Interview", message: "You are invited to interview." })}>Invite to Interview</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, type: "Internship", message: "Internship invitation." })}>Internship</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={() => invite({ studentId: c.studentId, studentName: c.name, type: "Project", message: "Project offer." })}>Offer Project</Button>
        </div>

        {/* Resume — LAST, NOT PRIMARY (§9) */}
        <div className="rounded-md border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-2 text-[10px] text-[var(--ss-muted)]">
          <FileText className="mr-1 inline h-3 w-3" /> Résumé preview is intentionally shown last — this portal leads with evidence, not claims.
        </div>
      </div>
    </Drawer>
  );
}

function EvidenceBreakdown({ candidate: c }: { candidate: Candidate }) {
  const projects = c.evidence.filter((e) => e.sourceTitle.toLowerCase().includes("project"));
  const hackathons = c.evidence.filter((e) => e.sourceTitle.toLowerCase().includes("hackathon"));
  const industry = c.evidence.filter((e) => e.sourceTitle.toLowerCase().includes("industry"));
  const certifications = c.evidence.filter((e) => e.sourceTitle.toLowerCase().includes("certification"));
  const internships = c.evidence.filter((e) => e.sourceTitle.toLowerCase().includes("internship"));

  const rows = [
    { label: "Projects", items: projects },
    { label: "Hackathons", items: hackathons },
    { label: "Industry Feedback", items: industry },
    { label: "Certifications", items: certifications },
    { label: "Internships", items: internships },
  ];

  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.label} className="rounded-md border border-[var(--ss-border)] bg-white px-2.5 py-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ss-muted)]">{r.label}</p>
            <span className="text-[10px] font-bold text-[var(--ss-ink-soft)]">{r.items.length}</span>
          </div>
          {r.items.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {r.items.slice(0, 3).map((e) => (
                <li key={e.evidenceId} className="text-[10px] text-[var(--ss-ink-soft)]">· {e.sourceTitle}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// (§8) WHY THIS CANDIDATE — using SsWhyModal + SsWhyFactor
function WhyMatchModal({ data, open, onClose }: { data: { candidate: Candidate; match: MatchResult; opp: Opportunity } | null; open: boolean; onClose: () => void }) {
  if (!data) return null;
  const { candidate: c, match: m, opp } = data;

  const factors: { ok: "pass" | "warn" | "fail"; label: string; detail?: string }[] = [
    { ok: m.roleAligned ? "pass" : "warn", label: "Role Alignment", detail: `Target role "${c.targetRole}" vs opportunity "${opp.title}" (${m.roleAlignment}%)` },
    ...m.skillDetails.slice(0, 5).map((s) => ({
      ok: (s.status === "Strong Match" || s.status === "Match") ? "pass" as const
        : s.status === "Partial" ? "warn" as const
        : "fail" as const,
      label: `Skill: ${s.skillName}`,
      detail: `Required ${s.requiredLevel}, candidate ${s.studentLevel} (${s.status})`,
    })),
    { ok: m.evidenceStrength >= 60 ? "pass" : m.evidenceStrength >= 30 ? "warn" : "fail", label: "Evidence Strength", detail: `${m.evidenceStrength}% — ${m.evidenceConsidered.length} evidence records considered` },
    { ok: m.eligible ? "pass" : "warn", label: "Eligibility", detail: `Year/CGPA/branch rules — ${m.eligibility}%` },
    { ok: c.available ? "pass" : "warn", label: "Availability", detail: c.available ? "Candidate is currently available" : "Currently unavailable" },
  ];

  return (
    <SsWhyModal
      open={open}
      onClose={onClose}
      title={`Why this candidate? — ${c.name}`}
      subtitle={`${m.matchScore}% match · same engine as Student Portal`}
      factors={factors}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--ss-muted)]">Match breakdown (weights)</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <BreakdownRow label="Skill Alignment (40%)" value={m.skillAlignment} />
            <BreakdownRow label="Role Alignment (20%)" value={m.roleAlignment} />
            <BreakdownRow label="Evidence Strength (15%)" value={m.evidenceStrength} />
            <BreakdownRow label="Eligibility (10%)" value={m.eligibility} />
            <BreakdownRow label="Experience (10%)" value={m.experienceAlignment} />
            <BreakdownRow label="Availability (5%)" value={m.availability} />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[var(--ss-line)] pt-2">
            <span className="text-xs font-bold text-[var(--ss-ink)]">Final Match</span>
            <span className="text-lg font-extrabold text-[var(--ss-blue-600)]">{m.matchScore}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><p className="text-[10px] font-bold uppercase text-[var(--ss-teal-600)]">Strong</p>{m.matchedSkills.map((s) => <p key={s} className="text-xs">✓ {s}</p>)}</div>
          <div><p className="text-[10px] font-bold uppercase text-[var(--ss-orange-600)]">Gaps</p>{m.missingSkills.map((s) => <p key={s} className="text-xs">• {s}</p>)}</div>
        </div>
        <div className="flex items-center justify-between">
          <SsDataSourceLabel source="platform" />
          <span className="text-[10px] text-[var(--ss-muted)]">{m.matchLabel} · calculated {m.calculatedAt.slice(0, 10)}</span>
        </div>
      </div>
    </SsWhyModal>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--ss-muted)]">{label}</span>
      <span className="font-bold text-[var(--ss-ink)]">{value}%</span>
    </div>
  );
}
