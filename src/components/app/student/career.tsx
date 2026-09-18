"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Building2, MapPin, Clock, Award, Target, AlertTriangle, Sparkles,
  ChevronRight, CheckCircle2, Bookmark, BookmarkCheck, ArrowRight, X, Search,
  Filter, TrendingUp, FileText, GraduationCap, BookOpen, Trophy, Send,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useCareer, useCareerStore, CareerService } from "@/lib/career";
import { useIntelligenceDerived } from "@/lib/intelligence";
import type { Opportunity, MatchResult, Application, ApplicationStatus } from "@/lib/career";
import {
  DashHeader, Modal, Drawer, DemoBadge, CalcBadge, MatchBadge, PriorityBadge,
  EvidenceStatusBadge, ApplicationTimeline, Field, EmptyState,
} from "@/components/app/student-parts";
import { SsCard, SsBadge, SsStat } from "@/components/ui/ss";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  JOB: "Jobs", INTERNSHIP: "Internships", PROJECT: "Projects",
  TRAINING: "Training", WORKSHOP: "Workshops", CERTIFICATION: "Certifications", MENTORSHIP: "Mentorship",
};

const SECTIONS = [
  { key: "recommended", label: "Recommended", icon: Sparkles },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "internships", label: "Internships", icon: GraduationCap },
  { key: "projects", label: "Projects", icon: Trophy },
  { key: "learning", label: "Industry Learning", icon: BookOpen },
  { key: "applications", label: "Applications", icon: FileText },
];

export function CareerPage({ section }: { section: string }) {
  const { navigate } = useRouter();
  const c = useCareer();
  const intel = useIntelligenceDerived();
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [whyMatch, setWhyMatch] = useState<Opportunity | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"match" | "deadline" | "newest">("match");

  const list = useMemo(() => {
    let opps: Opportunity[] = [];
    if (section === "jobs") opps = c.opportunities.filter((o) => o.type === "JOB");
    else if (section === "internships") opps = c.opportunities.filter((o) => o.type === "INTERNSHIP");
    else if (section === "projects") opps = c.opportunities.filter((o) => o.type === "PROJECT");
    else if (section === "learning") opps = c.opportunities.filter((o) => ["TRAINING", "WORKSHOP", "CERTIFICATION", "MENTORSHIP"].includes(o.type));
    else return []; // recommended + applications handled separately

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      opps = opps.filter((o) => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) || o.requiredSkills.some((s) => s.skillName.toLowerCase().includes(q)));
    }
    // sort
    const matchFor = (o: Opportunity) => c.matches[o.id]?.matchScore ?? 0;
    if (sort === "match") opps = [...opps].sort((a, b) => matchFor(b) - matchFor(a));
    else if (sort === "deadline") opps = [...opps].sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline));
    else opps = [...opps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return opps;
  }, [section, c.opportunities, c.matches, search, sort]);

  return (
    <div className="space-y-6">
      <DashHeader
        title="Career & Opportunities"
        subtitle={`Target: ${intel.role?.roleName ?? "—"} · Readiness ${intel.readiness.displayValue}%`}
        icon={Briefcase}
        accent="#0D9488"
        action={<DemoBadge />}
      />

      {/* Section switcher */}
      <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <button key={s.key} onClick={() => navigate(`/app/career/${s.key}`)}
            className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              section === s.key ? "bg-[var(--ss-navy-900)] text-white" : "bg-[var(--ss-surface-3)] text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]")}>
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* Career intelligence strip (master spec §75) */}
      <CareerIntelligenceStrip />

      {/* Recommended section */}
      {section === "recommended" && <RecommendedSection onOpen={setDetail} />}

      {/* Applications section */}
      {section === "applications" && <ApplicationsSection onOpenOpp={setDetail} />}

      {/* List sections (jobs/internships/projects/learning) */}
      {["jobs", "internships", "projects", "learning"].includes(section) && (
        <>
          {/* Filters + search + sort */}
          <SsCard tone="flat" className="flex flex-wrap items-center gap-2 p-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white px-3 py-1.5">
              <Search className="h-4 w-4 text-[var(--ss-faint)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, company, skill…" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-lg border border-[var(--ss-border)] bg-white px-2.5 text-sm">
              <option value="match">Best Match</option>
              <option value="deadline">Deadline</option>
              <option value="newest">Newest</option>
            </select>
          </SsCard>

          {list.length === 0 ? (
            <EmptyState icon={Briefcase} title="No opportunities match your filters" hint="Try adjusting your search or filters." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((o) => (
                <OpportunityCard key={o.id} opp={o} match={c.matches[o.id]} applied={c.applications.some((a) => a.opportunityId === o.id && a.status !== "WITHDRAWN")} saved={c.savedIds.includes(o.id)} onView={() => setDetail(o)} onWhy={() => setWhyMatch(o)} />
              ))}
            </div>
          )}
        </>
      )}

      <OpportunityDetailDrawer opp={detail} open={!!detail} onClose={() => setDetail(null)} onWhy={(o) => { setDetail(null); setWhyMatch(o); }} />
      <WhyMatchModal opp={whyMatch} open={!!whyMatch} onClose={() => setWhyMatch(null)} />
    </div>
  );
}

// ─── Career intelligence strip (§75) ────────────────────────────
function CareerIntelligenceStrip() {
  const intel = useIntelligenceDerived();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[var(--ss-border)] bg-navy-gradient p-5 text-white shadow-soft">
      <div className="bg-dot-grid-dark absolute inset-0 opacity-20 rounded-2xl" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Your Career Intelligence</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Target Role</p><p className="mt-0.5 text-sm font-bold">{intel.role?.roleName}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Role Readiness</p><p className="mt-0.5 text-sm font-bold text-gradient-light">{intel.readiness.displayValue}%</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Top Gap</p><p className="mt-0.5 text-sm font-bold">{intel.gaps[0]?.skill ?? "—"}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Next Best Action</p><p className="mt-0.5 text-sm font-bold">{intel.nextAction?.actionTitle.slice(0, 24) ?? "—"}</p></div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Opportunity card ───────────────────────────────────────────
function OpportunityCard({ opp, match, applied, saved, onView, onWhy }: { opp: Opportunity; match?: MatchResult; applied: boolean; saved: boolean; onView: () => void; onWhy: () => void }) {
  const { toggleSave, apply } = useCareerStore();
  const [applying, setApplying] = useState(false);
  const dl = CareerService.getDeadlineStatus(opp.id);
  const dlColor = dl === "Open" ? "#0D9488" : dl === "Closing Soon" ? "#EA580C" : "#BE123C";

  const handleApply = async () => {
    setApplying(true);
    useCareerStore.getState().apply(opp.id);
    setTimeout(() => setApplying(false), 500);
  };

  return (
    <SsCard tone="lift" className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--ss-ink)]">{opp.title}</p>
          <p className="text-[11px] text-[var(--ss-muted)]"><Building2 className="mr-0.5 inline h-3 w-3" />{opp.company}</p>
        </div>
        {match && <MatchBadge score={match.matchScore} />}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--ss-muted)]">
        <span><MapPin className="mr-0.5 inline h-2.5 w-2.5" />{opp.location}</span>
        <span>· {opp.mode}</span>
        {opp.duration && <span>· {opp.duration}</span>}
        {opp.compensationAmount && <span>· {opp.compensationAmount}</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {opp.requiredSkills.slice(0, 4).map((s) => (
          <span key={s.skillId} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]">{s.skillName}</span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold" style={{ backgroundColor: dlColor + "1a", color: dlColor }}>
          <Clock className="h-2.5 w-2.5" /> {dl}
        </span>
        <span className="text-[var(--ss-faint)]">Deadline: {opp.applicationDeadline}</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        <Button variant="outline" size="sm" className="h-8 flex-1 text-[11px]" onClick={onView}>View Details</Button>
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleSave(opp.id)} aria-label="Save">
          {saved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--ss-teal-600)]" /> : <Bookmark className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="navy" size="sm" className="h-8 flex-1 text-[11px] gap-1" disabled={applied || applying || dl === "Closed"} onClick={handleApply}>
          {applied ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
          {applied ? "Applied" : "Apply Now"}
        </Button>
      </div>
      {match && (
        <button onClick={onWhy} className="mt-2 text-[10px] font-semibold text-[var(--ss-blue-600)] hover:underline">Why this match? →</button>
      )}
    </SsCard>
  );
}

// ─── Opportunity detail drawer (§8, §36, §37) ──────────────────
function OpportunityDetailDrawer({ opp, open, onClose, onWhy }: { opp: Opportunity | null; open: boolean; onClose: () => void; onWhy: (o: Opportunity) => void }) {
  const intel = useIntelligenceDerived();
  const match = opp ? CareerService.calculateOpportunityMatch(opp.id) : null;
  const elig = opp ? CareerService.checkOpportunityEligibility(opp.id) : null;
  if (!opp) return null;
  return (
    <Drawer open={open} onClose={onClose} title={opp.title} subtitle={`${opp.company} · ${opp.type}`}>
      <div className="space-y-4">
        <DemoBadge />
        <Field label="About the Role" value={opp.description} />
        {opp.responsibilities && opp.responsibilities.length > 0 && (
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Responsibilities</p><ul className="mt-1 space-y-1">{opp.responsibilities.map((r) => <li key={r} className="flex items-start gap-1.5 text-xs text-[var(--ss-ink-soft)]"><CheckCircle2 className="mt-0.5 h-3 w-3 text-[var(--ss-teal-600)]" />{r}</li>)}</ul></div>
        )}
        <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Required Skills</p><div className="mt-1 flex flex-wrap gap-1">{opp.requiredSkills.map((s) => <SsBadge key={s.skillId} tone="blue" className="text-[10px]">{s.skillName} ({s.requiredLevel}+)</SsBadge>)}</div></div>
        {opp.preferredSkills && opp.preferredSkills.length > 0 && (
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Preferred Skills</p><div className="mt-1 flex flex-wrap gap-1">{opp.preferredSkills.map((s) => <SsBadge key={s.skillId} tone="neutral" className="text-[10px]">{s.skillName}</SsBadge>)}</div></div>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Location" value={`${opp.location} · ${opp.mode}`} />
          {opp.compensationAmount && <Field label="Compensation" value={`${opp.compensationType}: ${opp.compensationAmount}`} />}
          {opp.duration && <Field label="Duration" value={opp.duration} />}
          <Field label="Deadline" value={opp.applicationDeadline} />
        </div>
        {elig && (
          <div className={cn("rounded-lg border p-3", elig.eligible ? "border-[var(--ss-teal-600)]/30 bg-[var(--ss-teal-50)]" : "border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)]")}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Eligibility</p>
            <p className={cn("mt-0.5 text-sm font-bold", elig.eligible ? "text-[var(--ss-teal-600)]" : "text-[var(--ss-orange-600)]")}>{elig.eligible ? "✓ Eligible" : "✗ Not Eligible"}</p>
            {!elig.eligible && elig.failedRequirements.length > 0 && (
              <ul className="mt-1 space-y-0.5">{elig.failedRequirements.map((f) => <li key={f} className="text-[11px] text-[var(--ss-orange-600)]">• {f}</li>)}</ul>
            )}
          </div>
        )}
        {match && (
          <>
            <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Your Match</p><MatchBadge score={match.matchScore} /></div>
              <p className="mt-1 text-[11px] text-[var(--ss-muted)]">{match.matchLabel} · {match.eligible ? "Eligible" : "Not eligible"}</p>
            </div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Your Skill Fit</p>
              <div className="mt-1 space-y-1">
                {match.skillDetails.map((d) => (
                  <div key={d.skillId} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ss-ink-soft)]">{d.skillName}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--ss-muted)]">{d.studentLevel}/{d.requiredLevel}</span>
                      <SsBadge tone={d.status === "Strong Match" || d.status === "Match" ? "teal" : d.status === "Partial" ? "blue" : "orange"} className="text-[9px]">{d.status}</SsBadge>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {match.missingSkills.length > 0 && (
              <div className="rounded-lg border border-[var(--ss-orange-600)]/30 bg-[var(--ss-orange-50)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-orange-600)]">Skill Gaps</p>
                <div className="mt-1 flex flex-wrap gap-1">{match.missingSkills.map((s) => <SsBadge key={s} tone="orange" className="text-[10px]">{s}</SsBadge>)}</div>
              </div>
            )}
            {match.evidenceConsidered.length > 0 && (
              <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-faint)]">Evidence Considered</p><div className="mt-1 flex flex-wrap gap-1">{match.evidenceConsidered.map((e) => <SsBadge key={e} tone="neutral" className="text-[10px]">{e}</SsBadge>)}</div></div>
            )}
            {match.potentialGap && intel.nextAction && (
              <div className="rounded-lg border border-[var(--ss-blue-600)]/30 bg-[var(--ss-blue-50)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-blue-600)]">Suggested Next Step</p>
                <p className="mt-0.5 text-xs font-bold text-[var(--ss-ink)]">{intel.nextAction.actionTitle}</p>
                <p className="mt-1 text-[10px] text-[var(--ss-muted)]">Addresses the {match.potentialGap} gap for this opportunity and generates evidence.</p>
              </div>
            )}
          </>
        )}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => onWhy(opp)}>Why this match?</Button>
          <Button variant="navy" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Drawer>
  );
}

// ─── Why this match? modal (§15, §16) ───────────────────────────
function WhyMatchModal({ opp, open, onClose }: { opp: Opportunity | null; open: boolean; onClose: () => void }) {
  const match = opp ? CareerService.calculateOpportunityMatch(opp.id) : null;
  if (!opp || !match) return null;
  const row = (label: string, v: number) => (
    <div className="flex items-center justify-between text-xs"><span className="text-[var(--ss-ink-soft)]">{label}</span><span className="font-bold text-[var(--ss-ink)]">{v}</span></div>
  );
  return (
    <Modal open={open} onClose={onClose} title="Why this match?" subtitle={`${opp.title} · ${match.matchScore}%`} size="md">
      <div className="space-y-3">
        <DemoBadge />
        <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-3 space-y-2">
          {row("Skill Alignment (40%)", match.skillAlignment)}
          {row("Role Alignment (20%)", match.roleAlignment)}
          {row("Evidence Strength (15%)", match.evidenceStrength)}
          {row("Eligibility (10%)", match.eligibility)}
          {row("Experience (10%)", match.experienceAlignment)}
          {row("Availability (5%)", match.availability)}
          <div className="border-t border-[var(--ss-line)] pt-2 flex items-center justify-between"><span className="text-sm font-bold text-[var(--ss-ink)]">Final Match</span><span className="text-lg font-extrabold text-[var(--ss-blue-600)]">{match.matchScore}%</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><p className="text-[10px] font-semibold uppercase text-[var(--ss-teal-600)]">Strong</p>{match.matchedSkills.map((s) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">✓ {s}</p>)}</div>
          <div><p className="text-[10px] font-semibold uppercase text-[var(--ss-orange-600)]">Gaps</p>{match.missingSkills.map((s) => <p key={s} className="text-xs text-[var(--ss-ink-soft)]">• {s}</p>)}</div>
        </div>
        <p className="text-[10px] text-[var(--ss-muted)]">{match.explanation}</p>
      </div>
    </Modal>
  );
}

// ─── Recommended section (§21, §22) ──────────────────────────────
function RecommendedSection({ onOpen }: { onOpen: (o: Opportunity) => void }) {
  const c = useCareer();
  if (c.recommendations.length === 0) {
    return <EmptyState icon={Sparkles} title="No strong matches yet" hint="Your current skill profile has limited alignment. Review your Skill Gaps and Next Best Action." />;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ss-blue-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">Recommended for you</h2><DemoBadge /></div>
      {c.recommendations.slice(0, 5).map((r) => (
        <SsCard key={r.opportunity.id} tone="lift" className="p-4">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => onOpen(r.opportunity)} className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-[var(--ss-ink)]">{r.opportunity.title}</p>
              <p className="text-[11px] text-[var(--ss-muted)]">{r.opportunity.company} · {r.opportunity.type}</p>
            </button>
            <MatchBadge score={r.match.matchScore} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">{r.whyPoints.map((w) => <span key={w} className="inline-flex items-center gap-1 rounded-full bg-[var(--ss-teal-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--ss-teal-600)]"><CheckCircle2 className="h-2.5 w-2.5" />{w}</span>)}</div>
          {r.currentGap && <p className="mt-2 text-[11px] text-[var(--ss-orange-600)]">Current gap: {r.currentGap}</p>}
        </SsCard>
      ))}
    </div>
  );
}

// ─── Applications section (§26, §27, §28) ───────────────────────
function ApplicationsSection({ onOpenOpp }: { onOpenOpp: (o: Opportunity) => void }) {
  const c = useCareer();
  const { withdraw } = useCareerStore();
  if (c.applications.length === 0) {
    return <EmptyState icon={FileText} title="No applications yet" hint="You have not applied to any opportunities yet. Explore matched opportunities." />;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--ss-blue-600)]" /><h2 className="text-sm font-bold text-[var(--ss-ink)]">My Applications</h2><DemoBadge /></div>
      {c.applications.map((app) => {
        const opp = c.opportunities.find((o) => o.id === app.opportunityId);
        if (!opp) return null;
        return (
          <SsCard key={app.id} tone="soft" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-sm font-bold text-[var(--ss-ink)]">{opp.title}</p><p className="text-[11px] text-[var(--ss-muted)]">{opp.company} · Applied {app.appliedAt.slice(0, 10)}</p></div>
              <SsBadge tone={app.status === "SELECTED" ? "teal" : app.status === "REJECTED" || app.status === "WITHDRAWN" ? "orange" : "blue"} className="text-[10px]">{app.status.replace("_", " ")}</SsBadge>
            </div>
            <div className="mt-2"><ApplicationTimeline timeline={["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED"]} current={app.status} /></div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => onOpenOpp(opp)}>View Opportunity</Button>
              {app.status === "APPLIED" && <Button variant="ghost" size="sm" className="h-8 text-[11px] text-[var(--ss-orange-600)]" onClick={() => withdraw(app.id)}>Withdraw</Button>}
            </div>
          </SsCard>
        );
      })}
    </div>
  );
}
