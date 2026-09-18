"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, GraduationCap, Briefcase, BookOpen, Trophy,
  Sparkles, Users, FileText, Bell, User,
  Menu, X, LogOut, Settings, HelpCircle,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useInstitutionStore, DEMO_USER } from "@/lib/institution";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const PageLoader = () => (
  <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ss-border)] border-t-[var(--ss-navy-800)]" /></div>
);
const InstitutionCore = dynamic(() => import("./institution-core").then((m) => m.InstitutionCore), { ssr: false, loading: PageLoader });
const InstitutionExtra = dynamic(() => import("./institution-extra").then((m) => m.InstitutionExtra), { ssr: false, loading: PageLoader });

interface NavLeaf { label: string; route: string; icon: LucideIcon }
const NAV: NavLeaf[] = [
  { label: "Dashboard", route: "/institution/dashboard", icon: LayoutDashboard },
  { label: "Skill Intelligence", route: "/institution/skills", icon: BarChart3 },
  { label: "Branch Analytics", route: "/institution/branches", icon: GraduationCap },
  { label: "Placement Insights", route: "/institution/placements", icon: Briefcase },
  { label: "Internship Insights", route: "/institution/internships", icon: Users },
  { label: "Industry Alignment", route: "/institution/alignment", icon: BookOpen },
  { label: "Hackathon Analytics", route: "/institution/hackathons", icon: Trophy },
  { label: "Interventions", route: "/institution/interventions", icon: Sparkles },
  { label: "Collaborations", route: "/institution/collaborations", icon: Users },
  { label: "Reports", route: "/institution/reports", icon: FileText },
  { label: "Notifications", route: "/institution/notifications", icon: Bell },
  { label: "Profile", route: "/institution/profile", icon: User },
];

const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard", skills: "Skill Intelligence", branches: "Branch Analytics",
  placements: "Placement Insights", internships: "Internship Insights", alignment: "Industry Alignment",
  hackathons: "Hackathon Analytics", interventions: "Interventions", collaborations: "Collaborations",
  reports: "Reports", notifications: "Notifications", profile: "Profile",
};

export function InstitutionShell() {
  const { route, navigate } = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const unread = useInstitutionStore((s) => s.notifications.filter((n) => !n.read).length);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    setMobileOpen(false);
  }, [route]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return <div className="flex min-h-screen items-center justify-center bg-[var(--ss-surface-2)]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ss-border)] border-t-[var(--ss-navy-800)]" /></div>;

  const section = route.replace(/^\/institution\/?/, "").split("/")[0] || "dashboard";
  const isExtra = ["placements", "internships", "alignment", "hackathons", "interventions", "collaborations", "reports", "notifications", "profile"].includes(section);

  return (
    <div className="flex min-h-screen bg-[var(--ss-surface-2)]">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--ss-border)] bg-white lg:flex", collapsed ? "w-[68px]" : "w-64")}>
        <div className="flex h-16 items-center border-b border-[var(--ss-border)] px-3"><button onClick={() => navigate("/")} className="flex items-center gap-2"><LogoMark size={32} />{!collapsed && <span className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--ss-ink)]">SKILL SETU</span>}</button></div>
        <div className="border-b border-[var(--ss-border)] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-faint)]">Institution Portal</p>{!collapsed && <p className="mt-1 text-sm font-bold text-[var(--ss-navy-800)]">IIT Madras</p>}</div>
        <nav className="scroll-slim flex-1 overflow-y-auto px-2 py-3">{NAV.map((item) => { const active = isActive(section, item.route); const Icon = item.icon; return (
          <button key={item.route} onClick={() => navigate(item.route)} title={collapsed ? item.label : undefined} className={cn("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-[var(--ss-navy-50, #DBE7F5)] text-[var(--ss-navy-800)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]", collapsed && "justify-center px-0")}><Icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{item.label}</span>}</button>);})}</nav>
        <div className="border-t border-[var(--ss-border)] p-2"><button onClick={() => navigate("/institution/profile")} className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-[var(--ss-surface-2)]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: DEMO_USER.avatarColor }}>{DEMO_USER.name.slice(0, 1)}</span>{!collapsed && <div className="min-w-0 flex-1 text-left"><p className="truncate text-xs font-semibold text-[var(--ss-ink)]">{DEMO_USER.name}</p><p className="truncate text-[10px] text-[var(--ss-muted)]">{DEMO_USER.role}</p></div>}</button></div>
      </aside>

      <AnimatePresence>{mobileOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-[var(--ss-border)] px-3"><div className="flex items-center gap-2"><LogoMark size={30} /><span className="text-xs font-extrabold">Institution Portal</span></div><button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-[var(--ss-faint)]"><X className="h-4 w-4" /></button></div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">{NAV.map((item) => { const active = isActive(section, item.route); const Icon = item.icon; return (
              <button key={item.route} onClick={() => { navigate(item.route); setMobileOpen(false); }} className={cn("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium", active ? "bg-[var(--ss-navy-50, #DBE7F5)] text-[var(--ss-navy-800)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]")}><Icon className="h-4 w-4" /> {item.label}</button>);})}</nav>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--ss-border)] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:hidden"><Menu className="h-5 w-5" /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:block">{collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
          <span className="text-sm font-semibold text-[var(--ss-ink)]">{BREADCRUMBS[section] ?? section}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => navigate("/institution/notifications")} className="relative rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ss-navy-800)] px-1 text-[9px] font-bold text-white">{unread}</span>}</button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--ss-surface-2)]"><span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: DEMO_USER.avatarColor }}>{DEMO_USER.name.slice(0, 1)}</span></button>
              <AnimatePresence>{profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-[var(--ss-border)] bg-white shadow-pop">
                    <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2.5"><p className="text-xs font-bold">{DEMO_USER.name}</p><p className="text-[10px] text-[var(--ss-muted)]">{DEMO_USER.role} · IIT Madras</p></div>
                    <div className="p-1">
                      <button onClick={() => { setProfileOpen(false); navigate("/institution/profile"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><User className="h-4 w-4" /> Profile</button>
                      <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><Settings className="h-4 w-4" /> Settings</button>
                      <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><HelpCircle className="h-4 w-4" /> Help</button>
                      <div className="my-1 h-px bg-[var(--ss-border)]" />
                      <button onClick={() => navigate("/")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-navy-800)] hover:bg-[var(--ss-surface-2)]"><LogOut className="h-4 w-4" /> Logout</button>
                    </div>
                  </motion.div>
                </>
              )}</AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait"><motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {isExtra ? <InstitutionExtra section={section} /> : <InstitutionCore section={section} />}
          </motion.div></AnimatePresence>
        </div></main>
      </div>
    </div>
  );
}

function isActive(section: string, route: string) { return section === (route.split("/")[2] || "dashboard"); }
