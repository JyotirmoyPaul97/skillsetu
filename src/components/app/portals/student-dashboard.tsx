"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Radar,
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  Plus,
  Loader2,
  MapPin,
  Building2,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { DashHeader, StatCard, SkillBar, Pill, DashCard, EmptyState, MatchBadge, VerifiedBadge } from "../dash-shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Radar as RechartsRadar,
  Progress,
} from "recharts";
import type { SkillPassport, OpportunityCard, ApplicationRow, FeedbackItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCENT = "#0D9488";
const TINT = "#CCFBF1";

export function StudentDashboard() {
  const { tab, user } = useApp();
  if (tab === "overview") return <Overview />;
  if (tab === "skills") return <SkillsPassport />;
  if (tab === "opportunities") return <Opportunities />;
  if (tab === "applications") return <Applications />;
  if (tab === "feedback") return <FeedbackView />;
  return <Overview />;
}

// ───────────── Overview ─────────────
function Overview() {
  const { user } = useApp();
  const [p, setP] = useState<SkillPassport | null>(null);
  const [opps, setOpps] = useState<OpportunityCard[]>([]);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes, aRes] = await Promise.all([
          fetch("/api/student/passport"),
          fetch("/api/student/opportunities"),
          fetch("/api/student/applications"),
        ]);
        if (pRes.ok) setP(await pRes.json());
        if (oRes.ok) setOpps(await oRes.json());
        if (aRes.ok) setApps(await aRes.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading accent={ACCENT} />;
  const profile = (user?.profile as { branch?: string; year?: number; cgpa?: number; targetRole?: string; institutionName?: string }) ?? {};

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <DashHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "Student"}`}
        subtitle={`${profile.branch ?? "—"} · Year ${profile.year ?? 1} · CGPA ${profile.cgpa ?? "-"}`}
        icon={LayoutDashboard}
        accent={ACCENT}
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Readiness" value={`${p?.overallReadiness ?? 0}%`} sub={profile.targetRole} icon={Target} accent={ACCENT} tint={TINT} />
        <StatCard label="Skills tracked" value={p?.skills.length ?? 0} sub={`${p?.skills.filter(s => s.verifiedCount > 0).length ?? 0} verified`} icon={Radar} accent="#6D28D9" tint="#EDE9FE" />
        <StatCard label="Evidence" value={p?.evidence.length ?? 0} sub={`${p?.evidence.filter(e => e.verified).length ?? 0} verified`} icon={Award} accent="#B45309" tint="#FEF3C7" />
        <StatCard label="Applications" value={apps.length} sub={`${apps.filter(a => a.status === "SHORTLISTED" || a.status === "SELECTED").length} shortlisted`} icon={FileText} accent="#BE123C" tint="#FFE4E6" />
      </div>

      {/* Readiness ring + gaps */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DashCard title="Career Readiness" subtitle={profile.targetRole}>
          <div className="flex flex-col items-center justify-center py-2">
            <ReadinessRing value={p?.overallReadiness ?? 0} accent={ACCENT} />
            <p className="mt-3 text-center text-xs text-slate-500">Matched against industry skill requirements</p>
          </div>
        </DashCard>

        <DashCard title="Top skill gaps" subtitle="Close these to boost readiness" className="lg:col-span-2">
          <div className="space-y-3">
            {(p?.gaps ?? []).filter(g => g.gap > 0).slice(0, 5).map((g) => (
              <SkillBar
                key={g.skill.id}
                label={g.skill.name}
                level={g.currentLevel}
                target={g.targetLevel}
                accent={ACCENT}
                right={<span className="mr-1 text-[10px] font-medium text-slate-400">gap {g.gap}</span>}
              />
            ))}
            {(p?.gaps ?? []).filter(g => g.gap > 0).length === 0 && (
              <EmptyState icon={CheckCircle2} title="No gaps detected" hint="You meet all required skill levels for your target role." />
            )}
          </div>
        </DashCard>
      </div>

      {/* Top opportunities preview */}
      <DashCard title="Top matched opportunities" subtitle="Sorted by your live match score" action={<UseAppSwitchTab tab="opportunities" label="View all" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {opps.slice(0, 4).map((o) => (
            <OppMini key={o.id} opp={o} onApply={() => toast.success("Opening opportunities…")} />
          ))}
          {opps.length === 0 && <EmptyState icon={Briefcase} title="No opportunities available yet" />}
        </div>
      </DashCard>
    </div>
  );
}

function UseAppSwitchTab({ tab, label }: { tab: any; label: string }) {
  const { setTab } = useApp();
  return (
    <button onClick={() => setTab(tab)} className="text-xs font-semibold text-teal-700 hover:underline">
      {label} →
    </button>
  );
}

function OppMini({ opp, onApply }: { opp: OpportunityCard; onApply: () => void }) {
  const { setTab } = useApp();
  return (
    <button
      onClick={() => setTab("opportunities")}
      className="rounded-lg border border-slate-200 p-3 text-left transition-all hover:border-teal-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-900">{opp.title}</p>
        {opp.matchScore !== undefined && <MatchBadge score={opp.matchScore} />}
      </div>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
        <Building2 className="h-3 w-3" /> {opp.industry.name}
        <span>·</span>
        <MapPin className="h-3 w-3" /> {opp.location}
      </p>
    </button>
  );
}

// ───────────── Skills passport ─────────────
function SkillsPassport() {
  const { user } = useApp();
  const [p, setP] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    const res = await fetch("/api/student/passport");
    if (res.ok) setP(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/student/passport");
      if (!cancelled && res.ok) setP(await res.json());
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loading accent={ACCENT} />;

  const radarData = (p?.skills ?? []).map((s) => ({ skill: s.skill.name.length > 14 ? s.skill.name.slice(0, 12) + "…" : s.skill.name, level: s.level }));

  return (
    <div className="space-y-6">
      <DashHeader
        title="Skill Passport"
        subtitle={`Target role: ${p?.targetRole ?? "—"}`}
        icon={Radar}
        accent={ACCENT}
        action={<AddEvidenceButton skillsUpdated={reload} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Radar */}
        <DashCard title="Skill radar" subtitle="Your demonstrated proficiency across skills">
          {radarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} stroke="#e2e8f0" />
                  <RechartsRadar dataKey="level" stroke={ACCENT} fill={ACCENT} fillOpacity={0.35} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={Radar} title="No evidence yet" hint="Add your first skill evidence to build your passport." />
          )}
        </DashCard>

        {/* Gap analysis */}
        <DashCard title="Gap analysis" subtitle={`${p?.gaps.filter(g => g.gap > 0).length ?? 0} gaps to close`}>
          <div className="max-h-72 space-y-3 overflow-y-auto scroll-slim pr-1">
            {(p?.gaps ?? []).map((g) => (
              <div key={g.skill.id}>
                <SkillBar label={g.skill.name} level={g.currentLevel} target={g.targetLevel} accent={g.gap > 20 ? "#BE123C" : ACCENT} right={<span className="text-[10px] text-slate-400">weight {(g.weight * 100) | 0}%</span>} />
                {g.gap > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-1">
                    {g.suggestions.slice(0, 1).map((s, i) => (
                      <li key={i} className="flex items-start gap-1 text-[10px] text-slate-500">
                        <ArrowRight className="mt-0.5 h-2.5 w-2.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {(p?.gaps ?? []).length === 0 && <EmptyState icon={CheckCircle2} title="No gaps — role-ready!" />}
          </div>
        </DashCard>
      </div>

      {/* Evidence list */}
      <DashCard title="Skill evidence" subtitle={`${p?.evidence.length ?? 0} items — evidence over claims`}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(p?.evidence ?? []).map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <p className="text-[11px] text-slate-500">{e.skill.name}</p>
                </div>
                <VerifiedBadge verified={e.verified} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Pill accent={ACCENT} tint={TINT}>{e.type.toLowerCase()}</Pill>
                <span className="text-xs font-semibold text-slate-700">{e.score}/100</span>
              </div>
            </div>
          ))}
          {(p?.evidence ?? []).length === 0 && <EmptyState icon={Award} title="No evidence yet" hint="Use Add Evidence to record your work." />}
        </div>
      </DashCard>
    </div>
  );
}

// Add-evidence modal
function AddEvidenceButton({ skillsUpdated }: { skillsUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ skillId: "", type: "PROJECT", title: "", description: "", score: 75, provider: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/skills").then(r => r.json()).then(setSkills).catch(() => {});
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/student/evidence", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Evidence added to your passport.");
      setOpen(false);
      setForm({ skillId: "", type: "PROJECT", title: "", description: "", score: 75, provider: "" });
      skillsUpdated();
    } else {
      toast.error("Couldn't add evidence. Try again.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="h-8 gap-1.5 bg-teal-700 text-xs font-semibold text-white hover:bg-teal-800">
        <Plus className="h-3.5 w-3.5" /> Add Evidence
      </Button>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md space-y-3 rounded-xl bg-white p-5 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-900">Add skill evidence</h3>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Skill</label>
              <select value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })} required className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
                <option value="">Select skill…</option>
                {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
                <option value="PROJECT">Project</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="COURSEWORK">Coursework</option>
                <option value="FEEDBACK">Feedback</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" placeholder="e.g. E-commerce storefront" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Provider / issuer</label>
              <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" placeholder="Self / Coursera / IITM" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Score (0-100): {form.score}</label>
              <input type="range" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="w-full accent-teal-600" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="h-9 flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="h-9 flex-1 gap-1.5 bg-teal-700 text-white hover:bg-teal-800">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add evidence"}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400">Student-added evidence is unverified until confirmed by faculty/industry.</p>
          </form>
        </div>
      )}
    </>
  );
}

// ───────────── Opportunities ─────────────
function Opportunities() {
  const [opps, setOpps] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>("ALL");

  const reload = async () => {
    setLoading(true);
    const res = await fetch("/api/student/opportunities");
    if (res.ok) setOpps(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/student/opportunities");
      if (!cancelled && res.ok) setOpps(await res.json());
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = type === "ALL" ? opps : opps.filter(o => o.type === type);

  return (
    <div className="space-y-6">
      <DashHeader title="Matched Opportunities" subtitle="Ranked by your live skill-match score" icon={Briefcase} accent={ACCENT} />
      <div className="flex flex-wrap gap-1.5">
        {["ALL", "INTERNSHIP", "FULL_TIME", "PROJECT", "MENTORSHIP"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
              type === t ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {t === "FULL_TIME" ? "Full-time" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? <Loading accent={ACCENT} /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((o) => <OppFull key={o.id} opp={o} onApplied={reload} />)}
          {filtered.length === 0 && <EmptyState icon={Briefcase} title="No opportunities match this filter" />}
        </div>
      )}
    </div>
  );
}

function OppFull({ opp, onApplied }: { opp: OpportunityCard; onApplied: () => void }) {
  const [applying, setApplying] = useState(false);
  const apply = async () => {
    setApplying(true);
    const res = await fetch("/api/student/apply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunityId: opp.id }),
    });
    setApplying(false);
    if (res.ok) {
      const { matchScore } = await res.json();
      toast.success(`Applied! Your match score: ${matchScore}%`);
      onApplied();
    } else {
      toast.error("Couldn't apply. You may have already applied.");
    }
  };
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{opp.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
            <Building2 className="h-3 w-3" /> {opp.industry.name}
            {opp.industry.industry && <><span>·</span> {opp.industry.industry}</>}
          </p>
        </div>
        {opp.matchScore !== undefined && <MatchBadge score={opp.matchScore} />}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{opp.description}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {opp.requiredSkills.map((s) => (
          <Pill key={s.name} accent={ACCENT} tint={TINT}>{s.name}</Pill>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {opp.location}</span>
        <span>·</span>
        <span>{opp.stipend}</span>
        <span>·</span>
        <span>Deadline: {opp.deadline}</span>
      </div>
      <div className="mt-auto pt-3">
        {opp.applied ? (
          <Button disabled className="h-8 w-full gap-1.5 bg-slate-100 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5" /> Applied
          </Button>
        ) : (
          <Button onClick={apply} disabled={applying} className="h-8 w-full gap-1.5 bg-teal-700 text-xs font-semibold text-white hover:bg-teal-800">
            {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />} Apply now
          </Button>
        )}
      </div>
    </div>
  );
}

// ───────────── Applications ─────────────
function Applications() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/student/applications");
      if (res.ok) setApps(await res.json());
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading accent={ACCENT} />;

  const statusColor: Record<string, string> = {
    PENDING: "#64748b", SHORTLISTED: "#B45309", SELECTED: "#0D9488", REJECTED: "#BE123C", WITHDRAWN: "#94a3b8",
  };

  return (
    <div className="space-y-6">
      <DashHeader title="My Applications" subtitle="Track your applications and outcomes" icon={FileText} accent={ACCENT} />
      <div className="grid gap-2.5">
        {apps.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{a.opportunity.title}</p>
              <p className="text-[11px] text-slate-500">{a.opportunity.industry.name} · {a.opportunity.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <MatchBadge score={a.matchScore} />
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase"
                style={{ backgroundColor: statusColor[a.status] + "22", color: statusColor[a.status] }}
              >
                {a.status.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
        {apps.length === 0 && <EmptyState icon={FileText} title="No applications yet" hint="Apply to opportunities on the Opportunities tab." />}
      </div>
    </div>
  );
}

// ───────────── Feedback ─────────────
function FeedbackView() {
  const [p, setP] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/student/passport");
      if (res.ok) setP(await res.json());
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading accent={ACCENT} />;

  const fb = p?.feedbackReceived ?? [];
  const avg = fb.length ? Math.round(fb.reduce((s, f) => s + f.rating, 0) / fb.length * 20) : 0;

  return (
    <div className="space-y-6">
      <DashHeader title="Industry Feedback" subtitle="Real-world feedback strengthens your skill profile" icon={MessageSquare} accent={ACCENT} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Feedback count" value={fb.length} icon={MessageSquare} accent={ACCENT} tint={TINT} />
        <StatCard label="Avg rating" value={fb.length ? `${(fb.reduce((s, f) => s + f.rating, 0) / fb.length).toFixed(1)}/5` : "—"} icon={Star} accent="#B45309" tint="#FEF3C7" />
        <StatCard label="Feedback score" value={`${avg}%`} icon={TrendingUp} accent="#6D28D9" tint="#EDE9FE" />
      </div>
      <div className="grid gap-3">
        {fb.map((f) => (
          <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: f.fromUser.avatarColor }}>
                  {f.fromUser.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{f.fromUser.name}</p>
                  <p className="text-[10px] uppercase text-slate-400">{f.fromUser.role}</p>
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              <Quote className="mr-1 inline h-3 w-3 text-slate-300" />{f.comment}
            </p>
            {f.opportunity && <p className="mt-1 text-[11px] text-slate-400">Re: {f.opportunity.title}</p>}
          </div>
        ))}
        {fb.length === 0 && <EmptyState icon={MessageSquare} title="No feedback yet" hint="Industry feedback appears here after you take on opportunities." />}
      </div>
    </div>
  );
}

// ───────────── Helpers ─────────────
function ReadinessRing({ value, accent }: { value: number; accent: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const off = circ - (value / 100) * circ;
  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{value}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">ready</span>
      </div>
    </div>
  );
}

function Loading({ accent }: { accent: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: accent }} />
    </div>
  );
}
