"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, TrendingUp, GraduationCap, Target, Loader2, Building2, Users, Award, Trophy, MapPin,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useApp } from "@/lib/store";
import { DashHeader, StatCard, Pill, DashCard, EmptyState, SkillBar } from "../dash-shared";
import type { BranchStatRow, PlacementRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT = "#6D28D9";
const TINT = "#EDE9FE";

const BRANCH_COLORS = ["#6D28D9", "#0D9488", "#B45309", "#BE123C", "#0EA5E9"];

export function InstitutionDashboard() {
  const { tab } = useApp();
  if (tab === "analytics") return <SkillIntelligence />;
  if (tab === "placements") return <PlacementInsights />;
  if (tab === "students") return <StudentIntelligence />;
  if (tab === "alignment") return <IndustryAlignment />;
  return <SkillIntelligence />;
}

// ───────────── Skill Intelligence ─────────────
function SkillIntelligence() {
  const [data, setData] = useState<{ institution: { id: string; name: string; location: string }; rows: BranchStatRow[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/institution/analytics");
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;
  const rows = data?.rows ?? [];
  const years = [...new Set(rows.map(r => r.academicYear))].sort();
  const branches = [...new Set(rows.map(r => r.branch))];

  // Latest year stats
  const latest = rows.filter(r => r.academicYear === years[years.length - 1]);
  const avgScore = latest.length ? Math.round(latest.reduce((s, r) => s + r.avgSkillScore, 0) / latest.length) : 0;
  const avgPlacement = latest.length ? Math.round(latest.reduce((s, r) => s + r.placementRate, 0) / latest.length) : 0;
  const totalStudents = latest.reduce((s, r) => s + r.studentCount, 0);

  // chart: avg skill score by branch (latest year)
  const branchChart = latest.map(r => ({ branch: r.branch.length > 14 ? r.branch.slice(0, 12) + "…" : r.branch, score: r.avgSkillScore, placement: r.placementRate }));

  // trend: institution avg across years
  const trend = years.map(y => {
    const ys = rows.filter(r => r.academicYear === y);
    return {
      year: y,
      avg: Math.round(ys.reduce((s, r) => s + r.avgSkillScore, 0) / ys.length),
      placement: Math.round(ys.reduce((s, r) => s + r.placementRate, 0) / ys.length),
    };
  });

  return (
    <div className="space-y-6">
      <DashHeader
        title="Skill Intelligence"
        subtitle={data?.institution ? `${data.institution.name} · ${data.institution.location}` : "Institution-wide skill analytics"}
        icon={BarChart3}
        accent={ACCENT}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Avg skill score" value={`${avgScore}%`} sub="Latest year" icon={Target} accent={ACCENT} tint={TINT} />
        <StatCard label="Placement rate" value={`${avgPlacement}%`} sub="Latest year" icon={Trophy} accent="#0D9488" tint="#CCFBF1" />
        <StatCard label="Students tracked" value={totalStudents} sub={`${branches.length} branches`} icon={Users} accent="#B45309" tint="#FEF3C7" />
        <StatCard label="Years" value={years.length} sub={`${years[0]}–${years[years.length - 1]}`} icon={TrendingUp} accent="#BE123C" tint="#FFE4E6" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashCard title="Avg skill score by branch" subtitle={`Academic year ${years[years.length - 1]}`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChart} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="branch" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" fill="#6D28D9" radius={[0, 4, 4, 0]} name="Skill score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard title="Institution trend" subtitle="Avg skill score & placement % over years">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avg" stroke="#6D28D9" strokeWidth={2} name="Skill score" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="placement" stroke="#0D9488" strokeWidth={2} name="Placement %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
      </div>

      {/* Detailed table */}
      <DashCard title="Branch intelligence table" subtitle="All branches × years">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">Branch</th>
                <th className="py-2 pr-3 font-semibold">Year</th>
                <th className="py-2 pr-3 font-semibold">Avg skill</th>
                <th className="py-2 pr-3 font-semibold">Placement</th>
                <th className="py-2 pr-3 font-semibold">Internship</th>
                <th className="py-2 font-semibold">Students</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-800">{r.branch}</td>
                  <td className="py-2 pr-3 text-slate-500">{r.academicYear}</td>
                  <td className="py-2 pr-3"><span className="font-bold" style={{ color: r.avgSkillScore >= 70 ? "#0D9488" : r.avgSkillScore >= 50 ? "#B45309" : "#BE123C" }}>{Math.round(r.avgSkillScore)}%</span></td>
                  <td className="py-2 pr-3 text-slate-600">{Math.round(r.placementRate)}%</td>
                  <td className="py-2 pr-3 text-slate-600">{Math.round(r.internshipRate)}%</td>
                  <td className="py-2 text-slate-600">{r.studentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ───────────── Placement Insights ─────────────
function PlacementInsights() {
  const [rows, setRows] = useState<PlacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/institution/placements");
      if (res.ok) setRows(await res.json());
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading />;

  const years = [...new Set(rows.map(r => r.academicYear))].sort();
  const latest = rows.filter(r => r.academicYear === years[years.length - 1]);
  const totalPlaced = latest.reduce((s, r) => s + r.placed, 0);
  const totalStudents = latest.reduce((s, r) => s + r.totalStudents, 0);
  const avgPkg = latest.length ? (latest.reduce((s, r) => s + r.avgPackage, 0) / latest.length).toFixed(1) : "0";
  const allRecruiters = [...new Set(latest.flatMap(r => r.topRecruiters))];

  const funnel = latest.map(r => ({
    branch: r.branch.length > 12 ? r.branch.slice(0, 10) + "…" : r.branch,
    placed: r.placed,
    total: r.totalStudents,
    rate: Math.round((r.placed / r.totalStudents) * 100),
  }));

  return (
    <div className="space-y-6">
      <DashHeader title="Placement Insights" subtitle={`Academic year ${years[years.length - 1]}`} icon={TrendingUp} accent={ACCENT} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Placement rate" value={totalStudents ? `${Math.round((totalPlaced / totalStudents) * 100)}%` : "—"} sub={`${totalPlaced}/${totalStudents}`} icon={Trophy} accent="#0D9488" tint="#CCFBF1" />
        <StatCard label="Avg package" value={`₹${avgPkg} LPA`} sub="Across branches" icon={Award} accent={ACCENT} tint={TINT} />
        <StatCard label="Branches" value={latest.length} icon={Building2} accent="#B45309" tint="#FEF3C7" />
        <StatCard label="Recruiters" value={allRecruiters.length} sub="Top employers" icon={Users} accent="#BE123C" tint="#FFE4E6" />
      </div>

      <DashCard title="Placement by branch" subtitle="Placed vs total students">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="branch" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="total" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="placed" fill="#6D28D9" radius={[4, 4, 0, 0]} name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashCard>

      <DashCard title="Top recruiters" subtitle="Across latest academic year">
        <div className="flex flex-wrap gap-2">
          {allRecruiters.map((r, i) => (
            <Pill key={r} accent={BRANCH_COLORS[i % BRANCH_COLORS.length]} tint={BRANCH_COLORS[i % BRANCH_COLORS.length] + "22"} className="text-xs">{r}</Pill>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

// ───────────── Student Intelligence ─────────────
function StudentIntelligence() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/institution/students${branch ? `?branch=${encodeURIComponent(branch)}` : ""}`);
      if (res.ok) setRows(await res.json());
      setLoading(false);
    })();
  }, [branch]);

  const branches = ["Computer Science", "Electronics & Comm", "Information Technology", "Data Science", "Mechanical"];

  return (
    <div className="space-y-6">
      <DashHeader title="Student Intelligence" subtitle="Per-student skill scores across the institution" icon={GraduationCap} accent={ACCENT} />
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setBranch("")} className={cn("rounded-full px-3 py-1 text-[11px] font-medium", !branch ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>All</button>
        {branches.map((b) => (
          <button key={b} onClick={() => setBranch(b)} className={cn("rounded-full px-3 py-1 text-[11px] font-medium", branch === b ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
            {b.length > 18 ? b.slice(0, 16) + "…" : b}
          </button>
        ))}
      </div>
      {loading ? <Loading /> : (
        <div className="grid gap-2.5">
          {rows.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: s.avatarColor }}>
                  {s.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{s.name}</p>
                  <p className="text-[11px] text-slate-500">{s.rollNo} · {s.branch} · Y{s.year} · CGPA {s.cgpa} · Target: {s.targetRole}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: s.avgSkillScore >= 70 ? "#0D9488" : s.avgSkillScore >= 50 ? "#B45309" : "#BE123C" }}>{s.avgSkillScore}%</p>
                  <p className="text-[10px] text-slate-400">avg skill</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.topSkills.map((sk: any) => (
                  <span key={sk.name} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {sk.name} <span className="text-slate-400">{sk.level}%</span>
                  </span>
                ))}
                {s.topSkills.length === 0 && <span className="text-[10px] text-slate-400">No evidence yet</span>}
              </div>
            </div>
          ))}
          {rows.length === 0 && <EmptyState icon={GraduationCap} title="No students in this branch" />}
        </div>
      )}
    </div>
  );
}

// ───────────── Industry Alignment ─────────────
function IndustryAlignment() {
  const [stats, setStats] = useState<BranchStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/institution/analytics");
      if (res.ok) {
        const d = await res.json();
        setStats(d.rows ?? []);
      }
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading />;

  const years = [...new Set(stats.map(s => s.academicYear))].sort();
  const latest = stats.filter(s => s.academicYear === years[years.length - 1]);
  // alignment score = avg(placement + internship)/2
  const alignment = latest.map(s => ({
    branch: s.branch,
    alignment: Math.round((s.placementRate + s.internshipRate) / 2),
    skill: Math.round(s.avgSkillScore),
  }));

  const pieData = [
    { name: "Strong alignment (≥80%)", value: alignment.filter(a => a.alignment >= 80).length, color: "#0D9488" },
    { name: "Moderate (60-79%)", value: alignment.filter(a => a.alignment >= 60 && a.alignment < 80).length, color: "#B45309" },
    { name: "Low (<60%)", value: alignment.filter(a => a.alignment < 60).length, color: "#BE123C" },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-6">
      <DashHeader title="Industry Alignment" subtitle="How well branches align with industry demand" icon={Target} accent={ACCENT} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashCard title="Alignment distribution" subtitle="By branch (latest year)">
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={Target} title="No alignment data" />}
        </DashCard>

        <DashCard title="Branch alignment scores" subtitle="Higher = better industry alignment">
          <div className="space-y-3">
            {alignment.map((a) => (
              <SkillBar
                key={a.branch}
                label={a.branch}
                level={a.alignment}
                target={90}
                accent={a.alignment >= 80 ? "#0D9488" : a.alignment >= 60 ? "#B45309" : "#BE123C"}
                showTarget={false}
                right={<span className="text-[10px] text-slate-400">skill {a.skill}%</span>}
              />
            ))}
            {alignment.length === 0 && <EmptyState icon={Target} title="No alignment data" />}
          </div>
        </DashCard>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
    </div>
  );
}
