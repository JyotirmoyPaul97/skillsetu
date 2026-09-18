"use client";

import { useEffect, useState } from "react";
import {
  Users, Briefcase, PlusCircle, Boxes, MessageSquare, Loader2, Search, MapPin, Building2,
  Star, Send, Bot, X, CheckCircle2, Filter,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { DashHeader, StatCard, Pill, DashCard, EmptyState, MatchBadge } from "../dash-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TalentRow, OpportunityCard, RequiredSkill } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCENT = "#B45309";
const TINT = "#FEF3C7";

export function IndustryDashboard() {
  const { tab } = useApp();
  if (tab === "talent") return <TalentDiscovery />;
  if (tab === "post-opp") return <PostOpportunity />;
  if (tab === "my-opps") return <MyOpportunities />;
  if (tab === "team-builder") return <TeamBuilder />;
  if (tab === "industry-feedback") return <FeedbackGiven />;
  return <TalentDiscovery />;
}

// ───────────── Talent Discovery ─────────────
function TalentDiscovery() {
  const [talent, setTalent] = useState<TalentRow[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSkill, setFilterSkill] = useState("");
  const [branch, setBranch] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [minCgpa, setMinCgpa] = useState("");

  const reload = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterSkill) params.set("skills", filterSkill);
    if (branch) params.set("branch", branch);
    if (targetRole) params.set("targetRole", targetRole);
    if (minCgpa) params.set("minCgpa", minCgpa);
    const res = await fetch(`/api/industry/talent?${params.toString()}`);
    if (res.ok) setTalent(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    fetch("/api/skills").then(r => r.json()).then(s => { if (!cancelled) setSkills(s); }).catch(() => {});
    (async () => {
      const res = await fetch("/api/industry/talent");
      if (!cancelled && res.ok) setTalent(await res.json());
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const branches = ["Computer Science", "Electronics & Comm", "Information Technology", "Data Science", "Mechanical"];
  const roles = ["Frontend Engineer", "Backend Engineer", "ML Engineer", "DevOps Engineer", "Full-Stack Engineer", "Data Analyst"];

  return (
    <div className="space-y-6">
      <DashHeader title="Talent Discovery" subtitle="Evidence-backed student talent, ranked by match" icon={Users} accent={ACCENT} />

      {/* Filters */}
      <DashCard title="Search filters" subtitle="Refine by skill, branch, target role or CGPA">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Skill</Label>
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
              <option value="">Any skill</option>
              {skills.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Branch</Label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
              <option value="">Any branch</option>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Target role</Label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
              <option value="">Any role</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Min CGPA</Label>
            <Input type="number" step="0.1" min="0" max="10" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} className="h-9" placeholder="e.g. 8" />
          </div>
          <div className="flex items-end">
            <Button onClick={reload} className="h-9 w-full gap-1.5 bg-amber-700 text-white hover:bg-amber-800">
              <Search className="h-3.5 w-3.5" /> Search
            </Button>
          </div>
        </div>
      </DashCard>

      {loading ? <Loading /> : (
        <div className="grid gap-2.5">
          {talent.map((t) => <TalentRowCard key={t.id} t={t} />)}
          {talent.length === 0 && <EmptyState icon={Users} title="No talent matches these filters" hint="Try loosening your criteria." />}
        </div>
      )}
    </div>
  );
}

function TalentRowCard({ t }: { t: TalentRow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: t.avatarColor }}>
          {t.name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{t.name}</p>
          <p className="text-[11px] text-slate-500">{t.branch} · Year {t.year} · CGPA {t.cgpa} · {t.institutionName ?? "Independent"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill accent="#0D9488" tint="#CCFBF1">{t.targetRole}</Pill>
          {t.matchScore > 0 && <MatchBadge score={t.matchScore} />}
          <Button onClick={() => setOpen(!open)} variant="outline" size="sm" className="h-7 text-xs">
            {open ? "Hide" : "View"}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {t.topSkills.map((s) => (
          <span key={s.name} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {s.name} <span className="text-slate-400">{s.level}%</span>
          </span>
        ))}
      </div>
      {open && <GiveFeedbackInline studentId={t.id} studentName={t.name} />}
    </div>
  );
}

function GiveFeedbackInline({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/industry/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toStudentId: studentId, rating, comment }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Feedback sent — it now strengthens this student's skill evidence.");
      setComment("");
    } else {
      toast.error("Couldn't send feedback. Try again.");
    }
  };
  return (
    <form onSubmit={submit} className="mt-3 rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-semibold text-slate-600">Give feedback to {studentName}</p>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star className={cn("h-4 w-4", i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Specific, actionable feedback…" className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2 text-sm" />
      <Button type="submit" disabled={saving} className="mt-2 h-8 gap-1.5 bg-amber-700 text-xs text-white hover:bg-amber-800">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send feedback
      </Button>
    </form>
  );
}

// ───────────── Post Opportunity ─────────────
function PostOpportunity() {
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", type: "INTERNSHIP", location: "Remote", stipend: "", deadline: "", openings: 1,
  });
  const [reqs, setReqs] = useState<RequiredSkill[]>([{ name: "", weight: 1, minLevel: 70 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/skills").then(r => r.json()).then(setSkills).catch(() => {}); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanReqs = reqs.filter(r => r.name);
    const res = await fetch("/api/industry/opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, openings: Number(form.openings), requiredSkills: cleanReqs }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Opportunity posted — students will be matched live.");
      setForm({ title: "", description: "", type: "INTERNSHIP", location: "Remote", stipend: "", deadline: "", openings: 1 });
      setReqs([{ name: "", weight: 1, minLevel: 70 }]);
      useApp.getState().setTab("my-opps");
    } else toast.error("Couldn't post opportunity.");
  };

  return (
    <div className="space-y-6">
      <DashHeader title="Post an Opportunity" subtitle="Required skills drive live match scoring" icon={PlusCircle} accent={ACCENT} />
      <form onSubmit={submit} className="space-y-4">
        <DashCard>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[11px] font-semibold text-slate-600">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="h-9" placeholder="Frontend Engineer Intern" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[11px] font-semibold text-slate-600">Description</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full rounded-md border border-slate-200 p-2 text-sm" placeholder="What will the student work on?" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Type</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm">
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PROJECT">Project</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="HACKATHON">Hackathon</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Openings</Label>
              <Input type="number" min={1} value={form.openings} onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Stipend / package</Label>
              <Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} className="h-9" placeholder="₹35,000/mo" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Deadline</Label>
              <Input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="h-9" placeholder="30 days" />
            </div>
          </div>
        </DashCard>

        <DashCard title="Required skills" subtitle="These weights drive the match score">
          <div className="space-y-2">
            {reqs.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
                <select value={r.name} onChange={(e) => setReqs(reqs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm">
                  <option value="">Select skill…</option>
                  {skills.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Weight</span>
                  <input type="range" min={0.1} max={1} step={0.1} value={r.weight} onChange={(e) => setReqs(reqs.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))} className="w-20 accent-amber-600" />
                  <span className="w-7 text-[11px] font-semibold text-slate-700">{(r.weight * 100) | 0}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Min</span>
                  <input type="number" min={0} max={100} value={r.minLevel} onChange={(e) => setReqs(reqs.map((x, j) => j === i ? { ...x, minLevel: Number(e.target.value) } : x))} className="h-8 w-14 rounded-md border border-slate-200 bg-white px-2 text-sm" />
                </div>
                <button type="button" onClick={() => setReqs(reqs.filter((_, j) => j !== i))} className="rounded-md p-1 text-slate-400 hover:bg-slate-200">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setReqs([...reqs, { name: "", weight: 1, minLevel: 70 }])}>
              <PlusCircle className="h-3.5 w-3.5" /> Add skill
            </Button>
          </div>
        </DashCard>

        <Button type="submit" disabled={saving} className="h-10 gap-2 bg-amber-700 text-sm font-semibold text-white hover:bg-amber-800">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />} Post opportunity
        </Button>
      </form>
    </div>
  );
}

// ───────────── My opportunities + applications ─────────────
function MyOpportunities() {
  const [opps, setOpps] = useState<(OpportunityCard & { applicantCount: number })[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOpp, setActiveOpp] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const [oRes, aRes] = await Promise.all([
      fetch("/api/industry/opportunities"),
      fetch("/api/industry/applications"),
    ]);
    if (oRes.ok) setOpps(await oRes.json());
    if (aRes.ok) setApps(await aRes.json());
    setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [oRes, aRes] = await Promise.all([
        fetch("/api/industry/opportunities"),
        fetch("/api/industry/applications"),
      ]);
      if (!cancelled && oRes.ok) setOpps(await oRes.json());
      if (!cancelled && aRes.ok) setApps(await aRes.json());
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: "#64748b", SHORTLISTED: "#B45309", SELECTED: "#0D9488", REJECTED: "#BE123C", WITHDRAWN: "#94a3b8",
  };

  const filteredApps = activeOpp ? apps.filter(a => a.opportunity.id === activeOpp) : apps;

  return (
    <div className="space-y-6">
      <DashHeader title="My Opportunities" subtitle="Track applicants & update application status" icon={Briefcase} accent={ACCENT} />
      {loading ? <Loading /> : (
        <>
          <div className="grid gap-2.5">
            {opps.map((o) => (
              <button
                key={o.id}
                onClick={() => setActiveOpp(activeOpp === o.id ? null : o.id)}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors",
                  activeOpp === o.id ? "border-amber-400" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{o.title}</p>
                  <p className="text-[11px] text-slate-500">{o.type.replace("_", " ").toLowerCase()} · {o.location} · {o.stipend || "Unpaid"}</p>
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-800">{o.applicantCount} applicants</Badge>
              </button>
            ))}
            {opps.length === 0 && <EmptyState icon={Briefcase} title="No opportunities posted yet" hint="Use the Post Opportunity tab to create one." />}
          </div>

          {filteredApps.length > 0 && (
            <DashCard title="Applicants" subtitle={activeOpp ? "Filtered to selected opportunity" : "Across all your opportunities"}>
              <div className="space-y-2">
                {filteredApps.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: a.student.avatarColor }}>
                      {a.student.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{a.student.name}</p>
                      <p className="text-[10px] text-slate-500">{a.student.branch} · Y{a.student.year} · CGPA {a.student.cgpa} · {a.student.targetRole}</p>
                    </div>
                    <MatchBadge score={a.matchScore} />
                    <select
                      value={a.status}
                      onChange={async (e) => {
                        const res = await fetch("/api/industry/applications", {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ id: a.id, status: e.target.value }),
                        });
                        if (res.ok) {
                          toast.success("Status updated");
                          load();
                        }
                      }}
                      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold"
                      style={{ color: statusColor[a.status] }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="SELECTED">Selected</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                ))}
              </div>
            </DashCard>
          )}
        </>
      )}
    </div>
  );
}

// ───────────── AI Team Builder ─────────────
interface RoleSpec { role: string; count: number; requiredSkills: RequiredSkill[]; }
function TeamBuilder() {
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState<RoleSpec[]>([{ role: "Frontend Engineer", count: 1, requiredSkills: [{ name: "React.js", weight: 1, minLevel: 70 }] }]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ id: string; result: { projectName: string; members: TalentRow[]; reasoning: string } } | null>(null);

  useEffect(() => { fetch("/api/skills").then(r => r.json()).then(setSkills).catch(() => {}); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setResult(null);
    const res = await fetch("/api/industry/team-builder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectName, description, roles }),
    });
    setSaving(false);
    if (res.ok) {
      const r = await res.json();
      setResult(r);
      toast.success("Team assembled from evidence-backed talent.");
    } else toast.error("Couldn't build team.");
  };

  return (
    <div className="space-y-6">
      <DashHeader title="AI Team Builder" subtitle="Assemble a project team from evidence-backed talent" icon={Boxes} accent={ACCENT} />
      <form onSubmit={submit} className="space-y-4">
        <DashCard>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Project name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="h-9" placeholder="Document AI MVP" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Project description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-slate-200 p-2 text-sm" placeholder="What will the team build?" />
            </div>
          </div>
        </DashCard>

        <DashCard title="Team roles" subtitle="Add the roles your project needs">
          <div className="space-y-3">
            {roles.map((rs, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input value={rs.role} onChange={(e) => setRoles(roles.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm" placeholder="Role name" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Count</span>
                    <input type="number" min={1} max={5} value={rs.count} onChange={(e) => setRoles(roles.map((x, j) => j === i ? { ...x, count: Number(e.target.value) } : x))} className="h-8 w-12 rounded-md border border-slate-200 bg-white px-2 text-sm" />
                  </div>
                  <button type="button" onClick={() => setRoles(roles.filter((_, j) => j !== i))} className="rounded-md p-1 text-slate-400 hover:bg-slate-200">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rs.requiredSkills.map((sk, k) => (
                    <select
                      key={k}
                      value={sk.name}
                      onChange={(e) => setRoles(roles.map((x, j) => j === i ? { ...x, requiredSkills: x.requiredSkills.map((y, l) => l === k ? { ...y, name: e.target.value } : y) } : x))}
                      className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs"
                    >
                      <option value="">+ skill</option>
                      {skills.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRoles(roles.map((x, j) => j === i ? { ...x, requiredSkills: [...x.requiredSkills, { name: "", weight: 1, minLevel: 70 }] } : x))}
                    className="h-7 rounded-md border border-dashed border-slate-300 px-2 text-xs text-slate-500"
                  >
                    + add skill
                  </button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setRoles([...roles, { role: "", count: 1, requiredSkills: [{ name: "", weight: 1, minLevel: 70 }] }])}>
              <PlusCircle className="h-3.5 w-3.5" /> Add role
            </Button>
          </div>
        </DashCard>

        <Button type="submit" disabled={saving} className="h-10 gap-2 bg-amber-700 text-sm font-semibold text-white hover:bg-amber-800">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />} Assemble team
        </Button>
      </form>

      {result && (
        <DashCard title="Recommended team" subtitle={result.result.projectName}>
          <div className="space-y-2.5">
            {result.result.members.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: m.avatarColor }}>
                  {m.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-500">{m.branch} · {m.targetRole}</p>
                </div>
                <MatchBadge score={m.matchScore} />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-200">
            <Bot className="mr-1 inline h-3 w-3 text-amber-400" /> {result.result.reasoning}
          </div>
        </DashCard>
      )}
    </div>
  );
}

// ───────────── Feedback given ─────────────
function FeedbackGiven() {
  const { user } = useApp();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      // Industry "feedback given" — derived from feedback authored by this user.
      // We re-fetch via a small endpoint-less approach: the /api/industry/applications has student info.
      // Simpler: query student passport for all — but that's per-student. Use a direct db call via a new endpoint?
      // To keep this lean, we re-use the applications list to surface students we've engaged with.
      const res = await fetch("/api/industry/applications");
      if (res.ok) {
        const apps = await res.json();
        // unique students
        const map = new Map<string, any>();
        apps.forEach((a: any) => map.set(a.student.id, a.student));
        setFeedback([...map.values()]);
      }
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading />;
  return (
    <div className="space-y-6">
      <DashHeader title="Feedback Given" subtitle="Industry feedback strengthens every student's skill evidence" icon={MessageSquare} accent={ACCENT} />
      <div className="grid gap-2.5">
        {feedback.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: s.avatarColor }}>
              {s.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{s.name}</p>
              <p className="text-[10px] text-slate-500">{s.branch} · {s.targetRole}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => useApp.getState().setTab("talent")}
            >
              View & give feedback
            </Button>
          </div>
        ))}
        {feedback.length === 0 && <EmptyState icon={MessageSquare} title="No engagement yet" hint="Use Talent Discovery to find and review students." />}
      </div>
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
