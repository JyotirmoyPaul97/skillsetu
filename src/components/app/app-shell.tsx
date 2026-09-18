"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Radar,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  PlusCircle,
  ListChecks,
  Boxes,
  BookOpen,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Target,
  LogOut,
  Menu,
  X,
  Bot,
  Building2,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp, type PortalTab } from "@/lib/store";
import { Logo, LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudentDashboard } from "./portals/student-dashboard";
import { IndustryDashboard } from "./portals/industry-dashboard";
import { AcademiaDashboard } from "./portals/academia-dashboard";
import { InstitutionDashboard } from "./portals/institution-dashboard";
import { AiAssistant } from "./ai-assistant";
import type { Role } from "@prisma/client";

interface NavItem {
  tab: PortalTab;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<string, NavItem[]> = {
  STUDENT: [
    { tab: "overview", label: "Overview", icon: LayoutDashboard },
    { tab: "skills", label: "Skill Passport", icon: Radar },
    { tab: "opportunities", label: "Opportunities", icon: Briefcase },
    { tab: "applications", label: "My Applications", icon: FileText },
    { tab: "feedback", label: "Feedback", icon: MessageSquare },
  ],
  INDUSTRY: [
    { tab: "talent", label: "Talent Discovery", icon: Users },
    { tab: "post-opp", label: "Post Opportunity", icon: PlusCircle },
    { tab: "my-opps", label: "My Opportunities", icon: Briefcase },
    { tab: "team-builder", label: "AI Team Builder", icon: Boxes },
    { tab: "industry-feedback", label: "Feedback Given", icon: MessageSquare },
  ],
  ACADEMIA: [
    { tab: "ac-opps", label: "Industry Opportunities", icon: Briefcase },
    { tab: "curriculum", label: "Curriculum Alignment", icon: BookOpen },
  ],
  INSTITUTION: [
    { tab: "analytics", label: "Skill Intelligence", icon: BarChart3 },
    { tab: "placements", label: "Placement Insights", icon: TrendingUp },
    { tab: "students", label: "Student Intelligence", icon: GraduationCap },
    { tab: "alignment", label: "Industry Alignment", icon: Target },
  ],
  ADMIN: [],
};

const PORTAL_META: Record<string, { name: string; accent: string; tint: string }> = {
  STUDENT: { name: "Student Portal", accent: "#0D9488", tint: "#CCFBF1" },
  INDUSTRY: { name: "Industry Portal", accent: "#B45309", tint: "#FEF3C7" },
  ACADEMIA: { name: "Academia Portal", accent: "#BE123C", tint: "#FFE4E6" },
  INSTITUTION: { name: "Institution Portal", accent: "#6D28D9", tint: "#EDE9FE" },
  ADMIN: { name: "Admin Portal", accent: "#0F172A", tint: "#F1F5F9" },
};

export function AppShell() {
  const { user, tab, setTab, setView, logout } = useApp();
  const [mobileNav, setMobileNav] = useState(false);
  const role = (user?.role as string) ?? "STUDENT";
  const meta = PORTAL_META[role] ?? PORTAL_META.STUDENT;
  const nav = NAV[role] ?? [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <button onClick={() => setView("landing")} className="flex items-center gap-2" aria-label="Back to landing">
            <LogoMark size={32} />
            <span className="text-[13px] font-extrabold tracking-[0.16em] text-slate-900">SKILL SETU</span>
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Portal</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: meta.tint, color: meta.accent }}>
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold" style={{ color: meta.accent }}>{meta.name}</span>
          </div>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-2 py-3">
          {nav.map((item) => {
            const active = tab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
                style={active ? { backgroundColor: meta.tint, color: meta.accent } : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User block */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: user?.avatarColor ?? "#0D9488" }}>
              {(user?.name ?? "U").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-3 lg:hidden">
        <button onClick={() => setView("landing")} className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="text-xs font-extrabold tracking-[0.14em] text-slate-900">SKILL SETU</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNav(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white"
            >
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3">
                <span className="text-xs font-extrabold tracking-[0.14em] text-slate-900">{meta.name}</span>
                <button onClick={() => setMobileNav(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-2">
                {nav.map((item) => {
                  const active = tab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => { setTab(item.tab); setMobileNav(false); }}
                      className={cn(
                        "mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                        active ? "text-slate-900" : "text-slate-500 hover:bg-slate-100",
                      )}
                      style={active ? { backgroundColor: meta.tint, color: meta.accent } : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-slate-200 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: user?.avatarColor ?? "#0D9488" }}>
                    {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
                  </div>
                  <button onClick={logout} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {role === "STUDENT" && <StudentDashboard />}
              {role === "INDUSTRY" && <IndustryDashboard />}
              {role === "ACADEMIA" && <AcademiaDashboard />}
              {role === "INSTITUTION" && <InstitutionDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating AI assistant */}
      <AiAssistant accent={meta.accent} tint={meta.tint} portalName={meta.name} role={role as Role} />
    </div>
  );
}
