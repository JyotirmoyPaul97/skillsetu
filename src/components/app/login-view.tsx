"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Factory, BookOpen, Building2, X, Sparkles, Loader2, ArrowRight, Lock, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/lib/router";
import { Logo } from "@/components/site/logo";
import { useStudentState } from "@/lib/student-state";
import { cn } from "@/lib/utils";

const DEMO_ROLES = [
  { key: "student", label: "Student", icon: GraduationCap, accent: "#0D9488", tint: "#CCFBF1", email: "s042@skillsetu.demo" },
  { key: "industry", label: "Industry", icon: Factory, accent: "#EA580C", tint: "#FED7AA", email: "talent@nova.demo" },
  { key: "academia", label: "Academia", icon: BookOpen, accent: "#2563EB", tint: "#DBEAFE", email: "faculty@iitm.ac.in" },
  { key: "institution", label: "Institution", icon: Building2, accent: "#0F2547", tint: "#DBE7F5", email: "admin@iitm.ac.in" },
] as const;

export function LoginView() {
  const { navigate } = useRouter();
  const { setRole } = useStudentState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const demoLogin = (which: "student" | "industry" | "academia" | "institution") => {
    setLoading(which);
    setTimeout(() => {
      setLoading(null);
      if (which === "student") {
        setRole("Data Scientist");
        navigate("/app/dashboard");
      } else if (which === "industry") {
        navigate("/industry/dashboard");
      } else if (which === "academia") {
        navigate("/academia/dashboard");
      } else if (which === "institution") { navigate("/institution/dashboard"); } else {
        navigate("/");
      }
    }, 600);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading("login");
    // Prototype: any email/password enters the student portal as a demo.
    setTimeout(() => {
      setLoading(null);
      setRole("Data Scientist");
      navigate("/app/dashboard");
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--ss-surface-2)] px-4 py-12">
      {/* subtle background pattern */}
      <div className="bg-dot-grid absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[var(--ss-blue-100)]/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-[var(--ss-teal-100)]/60 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop md:grid-cols-2"
      >
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between bg-navy-gradient p-8 text-white md:flex">
          <div className="bg-dot-grid-dark absolute inset-0 opacity-40" />
          <div className="relative">
            <Logo size={34} onDark />
            <h2 className="mt-8 text-2xl font-bold leading-tight">
              From Skill Claims
              <br />
              to <span className="text-gradient-light">Skill Evidence.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              AI-Powered Skill Intelligence &amp; Academia–Industry Ecosystem.
            </p>
          </div>
          <div className="relative mt-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/30 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">
              <Lock className="h-3 w-3" /> DEMO LOGIN
            </span>
            <p className="mt-3 text-[11px] text-slate-400">
              Phase 2 prototypes authentication. No real session is created.
              Use a demo role below to enter the Student Portal.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--ss-ink)]">Login</h3>
              <p className="text-xs text-[var(--ss-muted)]">Welcome back to SKILL SETU</p>
            </div>
            <button onClick={() => navigate("/")} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]" aria-label="Back to landing">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] font-semibold text-[var(--ss-ink-soft)]"><Mail className="h-3 w-3" /> Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10" required />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] font-semibold text-[var(--ss-ink-soft)]"><KeyRound className="h-3 w-3" /> Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-10" required />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 text-[var(--ss-muted)]">
                <input type="checkbox" className="accent-[var(--ss-blue-600)]" /> Remember me
              </label>
              <button type="button" className="font-semibold text-[var(--ss-blue-600)] hover:underline">Forgot Password?</button>
            </div>
            <Button type="submit" disabled={loading === "login"} className="h-10 w-full gap-1.5">
              {loading === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Demo login divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--ss-border)]" />
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">
              <Lock className="h-2.5 w-2.5" /> Demo Login
            </span>
            <div className="h-px flex-1 bg-[var(--ss-border)]" />
          </div>

          <p className="text-[11px] text-[var(--ss-muted)]">
            Pick a role to enter the portal. <b>Student</b> and <b>Industry</b> portals are available.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ROLES.map((r) => {
              const Icon = r.icon;
              const active = loading === r.key;
              const disabled = loading !== null;
              const phase2 = r.key === "student" || r.key === "industry" || r.key === "academia" || r.key === "institution";
              return (
                <button
                  key={r.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => demoLogin(r.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all disabled:opacity-60",
                    phase2 ? "border-[var(--ss-border)] bg-white hover:border-[var(--ss-faint)] hover:shadow-soft" : "border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)]/60",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: r.tint, color: r.accent }}>
                    {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--ss-ink)]">{r.label} Demo</p>
                    <p className="truncate text-[9px] text-[var(--ss-faint)]">{phase2 ? "Available" : "Later phase"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
