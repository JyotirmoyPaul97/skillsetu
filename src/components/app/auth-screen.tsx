"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Factory, BookOpen, Building2, X, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/site/logo";
import type { RegisterRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { key: RegisterRole; label: string; icon: typeof GraduationCap; accent: string; tint: string; desc: string }[] = [
  { key: "STUDENT", label: "Student", icon: GraduationCap, accent: "#0D9488", tint: "#CCFBF1", desc: "Build your skill passport & find opportunities." },
  { key: "INDUSTRY", label: "Industry", icon: Factory, accent: "#B45309", tint: "#FEF3C7", desc: "Discover evidence-backed talent & post roles." },
  { key: "ACADEMIA", label: "Academia", icon: BookOpen, accent: "#BE123C", tint: "#FFE4E6", desc: "Align curriculum & mentor students." },
  { key: "INSTITUTION", label: "Institution", icon: Building2, accent: "#6D28D9", tint: "#EDE9FE", desc: "Turn skill data into institutional intelligence." },
];

const ERRORS: Record<string, string> = {
  invalid_credentials: "Wrong email or password. Try again.",
  email_taken: "An account with that email already exists.",
  missing_fields: "Please fill in all required fields.",
  network: "Network error — please retry.",
  login_failed: "Login failed. Please retry.",
  register_failed: "Registration failed. Please retry.",
};

export function AuthScreen() {
  const { login, register, setView, pendingRole, setPendingRole } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<RegisterRole>((pendingRole as RegisterRole) || "STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [year, setYear] = useState("3");
  const [cgpa, setCgpa] = useState("8.0");
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [designation, setDesignation] = useState("Assistant Professor");

  const reset = () => {
    setError(null);
    setLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    if (mode === "login") {
      const r = await login(email, password);
      if (!r.ok) {
        setError(r.error || "login_failed");
        setLoading(false);
      }
    } else {
      const payload: Record<string, unknown> = { email, password, name, role };
      if (role === "STUDENT") {
        payload.branch = branch;
        payload.year = Number(year);
        payload.cgpa = Number(cgpa);
        payload.targetRole = targetRole;
      } else if (role === "INDUSTRY") {
        payload.companyName = companyName || name;
        payload.industry = industry;
        payload.location = location;
      } else if (role === "ACADEMIA") {
        payload.department = department;
        payload.designation = designation;
      }
      const r = await register(payload);
      if (!r.ok) {
        setError(r.error || "register_failed");
        setLoading(false);
      }
    }
  };

  const fillDemo = (which: "student" | "industry" | "academia" | "institution") => {
    setMode("login");
    setError(null);
    const creds: Record<string, [string, string, RegisterRole]> = {
      student: ["aarav@iitm.ac.in", "skillsetu", "STUDENT"],
      industry: ["talent@technova.com", "skillsetu", "INDUSTRY"],
      academia: ["meena@iitm.ac.in", "skillsetu", "ACADEMIA"],
      institution: ["admin@iitm.ac.in", "skillsetu", "INSTITUTION"],
    };
    const [em, pw, r] = creds[which];
    setEmail(em);
    setPassword(pw);
    setRole(r);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2"
      >
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between bg-slate-900 p-8 text-white md:flex">
          <div className="bg-dot-grid-dark absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Logo size={36} onDark />
            <h2 className="mt-8 text-2xl font-bold leading-tight">
              From Skill Claims
              <br />
              to <span className="text-gradient-it">Skill Evidence.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              One platform. Four portals. One connected skill ecosystem.
            </p>
          </div>
          <div className="relative mt-8 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Quick demo login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "industry", "academia", "institution"] as const).map((d) => {
                const r = ROLES.find((x) => x.key === d.toUpperCase())!;
                const Icon = r.icon;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => fillDemo(d)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white transition-colors hover:bg-white/10"
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: r.accent }} />
                    <span className="font-medium capitalize">{d}</span>
                  </button>
                );
              })}
            </div>
            <p className="pt-1 text-[10px] text-slate-400">
              Password for all demo accounts: <span className="font-mono text-slate-200">skillsetu</span>
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setMode("login"); reset(); }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); reset(); }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                )}
              >
                Register
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setPendingRole(null); setView("landing"); }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-1 flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h3>

            {mode === "register" && (
              <div>
                <Label className="text-xs font-semibold text-slate-600">Choose your portal</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const active = role === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRole(r.key)}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2.5 text-left transition-all",
                          active ? "border-transparent shadow-sm" : "border-slate-200 hover:border-slate-300",
                        )}
                        style={active ? { backgroundColor: r.tint, borderColor: r.accent } : undefined}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: r.accent }} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold" style={{ color: active ? r.accent : "#0f172a" }}>
                            {r.label}
                          </p>
                          <p className="text-[10px] leading-tight text-slate-500">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {mode === "register" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Aarav Sharma" className="h-10" />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-10" />
              </div>

              {mode === "register" && role === "STUDENT" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Branch</Label>
                    <Input value={branch} onChange={(e) => setBranch(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Year</Label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">CGPA</Label>
                    <Input type="number" step="0.1" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Target role</Label>
                    <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Full-Stack Engineer" className="h-10" />
                  </div>
                </div>
              )}

              {mode === "register" && role === "INDUSTRY" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Company name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Industry</Label>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru" className="h-10" />
                  </div>
                </div>
              )}

              {mode === "register" && role === "ACADEMIA" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Department</Label>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Designation</Label>
                    <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="h-10" />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {ERRORS[error] ?? error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 gap-2 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === "login" ? "Login to SKILL SETU" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-[11px] text-slate-500">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button type="button" onClick={() => setMode("register")} className="font-semibold text-teal-700 hover:underline">
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")} className="font-semibold text-teal-700 hover:underline">
                    Login instead
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
