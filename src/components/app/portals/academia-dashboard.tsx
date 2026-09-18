"use client";

import { useEffect, useState } from "react";
import {
  Briefcase, BookOpen, Loader2, MapPin, Building2, GraduationCap, Plus, AlertTriangle,
  TrendingDown, Lightbulb, ArrowRight, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useApp } from "@/lib/store";
import { DashHeader, StatCard, Pill, DashCard, EmptyState } from "../dash-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OpportunityCard, CurriculumGapRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCENT = "#BE123C";
const TINT = "#FFE4E6";

export function AcademiaDashboard() {
  const { tab } = useApp();
  if (tab === "ac-opps") return <AcademiaOpportunities />;
  if (tab === "curriculum") return <CurriculumAlignment />;
  return <AcademiaOpportunities />;
}

// ───────────── Industry opportunities (faculty view) ─────────────
function AcademiaOpportunities() {
  const [opps, setOpps] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/academia/opportunities");
      if (res.ok) setOpps(await res.json());
      setLoading(false);
    })();
  }, []);

  const filtered = type === "ALL" ? opps : opps.filter(o => o.type === type);

  return (
    <div className="space-y-6">
      <DashHeader title="Industry Opportunities" subtitle="Share these with students & mentor them through" icon={Briefcase} accent={ACCENT} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open opportunities" value={opps.length} icon={Briefcase} accent={ACCENT} tint={TINT} />
        <StatCard label="Internships" value={opps.filter(o => o.type === "INTERNSHIP").length} icon={GraduationCap} accent="#0D9488" tint="#CCFBF1" />
        <StatCard label="Full-time roles" value={opps.filter(o => o.type === "FULL_TIME").length} icon={Building2} accent="#6D28D9" tint="#EDE9FE" />
        <StatCard label="Mentorships" value={opps.filter(o => o.type === "MENTORSHIP").length} icon={Lightbulb} accent="#B45309" tint="#FEF3C7" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["ALL", "INTERNSHIP", "FULL_TIME", "PROJECT", "MENTORSHIP"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
              type === t ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {t === "FULL_TIME" ? "Full-time" : t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{o.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <Building2 className="h-3 w-3" /> {o.industry.name}
                  </p>
                </div>
                <Pill accent={ACCENT} tint={TINT}>{o.type.replace("_", " ").toLowerCase()}</Pill>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{o.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {o.requiredSkills.map((s) => <Pill key={s.name} accent={ACCENT} tint={TINT}>{s.name}</Pill>)}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</span>
                <span>·</span><span>{o.stipend}</span>
                <span>·</span><span>Deadline: {o.deadline}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState icon={Briefcase} title="No opportunities in this category" />}
        </div>
      )}
    </div>
  );
}

// ───────────── Curriculum alignment ─────────────
function CurriculumAlignment() {
  const { user } = useApp();
  const [gaps, setGaps] = useState<CurriculumGapRow[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ branch: "Computer Science", skillId: "", currentLevel: 50, targetLevel: 80, recommendation: "" });
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    const res = await fetch("/api/academia/curriculum");
    if (res.ok) setGaps(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    fetch("/api/skills").then(r => r.json()).then(s => { if (!cancelled) setSkills(s); }).catch(() => {});
    (async () => {
      const res = await fetch("/api/academia/curriculum");
      if (!cancelled && res.ok) setGaps(await res.json());
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/academia/curriculum", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Curriculum gap recorded.");
      setShowAdd(false);
      setForm({ branch: "Computer Science", skillId: "", currentLevel: 50, targetLevel: 80, recommendation: "" });
      reload();
    } else toast.error("Couldn't save gap.");
  };

  // Aggregate by branch for chart
  const byBranch = new Map<string, { avgCurrent: number; avgTarget: number; count: number }>();
  gaps.forEach((g) => {
    const e = byBranch.get(g.branch) ?? { avgCurrent: 0, avgTarget: 0, count: 0 };
    e.avgCurrent += g.currentLevel; e.avgTarget += g.targetLevel; e.count++;
    byBranch.set(g.branch, e);
  });
  const chartData = [...byBranch.entries()].map(([branch, e]) => ({
    branch: branch.length > 12 ? branch.slice(0, 10) + "…" : branch,
    current: Math.round(e.avgCurrent / e.count),
    target: Math.round(e.avgTarget / e.count),
  }));

  return (
    <div className="space-y-6">
      <DashHeader
        title="Curriculum Alignment"
        subtitle="Map cohort skill levels vs industry requirements"
        icon={BookOpen}
        accent={ACCENT}
        action={
          <Button onClick={() => setShowAdd(true)} size="sm" className="h-8 gap-1.5 bg-rose-700 text-xs font-semibold text-white hover:bg-rose-800">
            <Plus className="h-3.5 w-3.5" /> Track gap
          </Button>
        }
      />

      {loading ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Tracked skills" value={gaps.length} icon={BookOpen} accent={ACCENT} tint={TINT} />
            <StatCard label="Branches" value={chartData.length} icon={GraduationCap} accent="#6D28D9" tint="#EDE9FE" />
            <StatCard label="Critical gaps" value={gaps.filter(g => g.gap >= 30).length} icon={AlertTriangle} accent="#B45309" tint="#FEF3C7" />
            <StatCard label="Avg gap" value={gaps.length ? Math.round(gaps.reduce((s, g) => s + g.gap, 0) / gaps.length) : 0} sub="points" icon={TrendingDown} accent="#0D9488" tint="#CCFBF1" />
          </div>

          {chartData.length > 0 && (
            <DashCard title="Cohort levels by branch" subtitle="Current vs target proficiency">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="current" fill="#BE123C" radius={[4, 4, 0, 0]} name="Current" />
                    <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashCard>
          )}

          <DashCard title="Skill-level gaps" subtitle="Sorted by gap severity">
            <div className="space-y-2">
              {gaps.map((g) => (
                <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Pill accent={ACCENT} tint={TINT}>{g.branch}</Pill>
                      <p className="text-sm font-semibold text-slate-900">{g.skill.name}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", g.gap >= 30 ? "bg-rose-50 text-rose-700" : g.gap >= 15 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                      gap {g.gap}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Current <b className="text-slate-700">{g.currentLevel}</b></span>
                    <ArrowRight className="h-3 w-3" />
                    <span>Target <b className="text-slate-700">{g.targetLevel}</b></span>
                  </div>
                  <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-rose-500" style={{ width: `${Math.min(100, g.currentLevel)}%` }} />
                  </div>
                  {g.recommendation && (
                    <p className="mt-2 flex items-start gap-1 text-[11px] text-slate-600">
                      <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> {g.recommendation}
                    </p>
                  )}
                </div>
              ))}
              {gaps.length === 0 && <EmptyState icon={BookOpen} title="No gaps tracked yet" hint="Use Track gap to add your first curriculum gap." />}
            </div>
          </DashCard>
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setShowAdd(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-3 rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Track a curriculum gap</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Branch</Label>
              <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Skill</Label>
              <select value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })} required className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
                <option value="">Select skill…</option>
                {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-600">Current level: {form.currentLevel}</Label>
                <input type="range" min={0} max={100} value={form.currentLevel} onChange={(e) => setForm({ ...form, currentLevel: Number(e.target.value) })} className="w-full accent-rose-600" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-600">Target level: {form.targetLevel}</Label>
                <input type="range" min={0} max={100} value={form.targetLevel} onChange={(e) => setForm({ ...form, targetLevel: Number(e.target.value) })} className="w-full accent-rose-600" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Recommendation</Label>
              <textarea value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} rows={2} className="w-full rounded-md border border-slate-200 p-2 text-sm" placeholder="What should the department do?" />
            </div>
            <Button type="submit" disabled={saving} className="h-9 w-full gap-1.5 bg-rose-700 text-white hover:bg-rose-800">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save gap"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
    </div>
  );
}
