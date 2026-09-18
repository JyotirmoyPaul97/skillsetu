"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Target, PlusCircle, Briefcase, Users, Trophy, Boxes,
  BookOpen, MessageSquare, BarChart3, Bell, User,
  Menu, X, LogOut, Settings, HelpCircle,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useIndustryStore, DEMO_INDUSTRY_USER, DEMO_COMPANY } from "@/lib/industry";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const PageLoader = () => (
  <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ss-border)] border-t-[var(--ss-orange-600)]" /></div>
);
const IndustryCore = dynamic(() => import("./industry-core").then((m) => m.IndustryCore), { ssr: false, loading: PageLoader });
const IndustryExtra = dynamic(() => import("./industry-extra").then((m) => m.IndustryExtra), { ssr: false, loading: PageLoader });

interface NavLeaf { label: string; route: string; icon: LucideIcon }
const NAV: NavLeaf[] = [
  { label: "Dashboard", route: "/industry/dashboard", icon: LayoutDashboard },
  { label: "Demand Pulse", route: "/industry/demand", icon: Target },
  { label: "Create Opportunity", route: "/industry/post", icon: PlusCircle },
  { label: "Opportunity Management", route: "/industry/management", icon: Briefcase },
  { label: "Discover Talent", route: "/industry/talent", icon: Users },
  { label: "Challenges & Hackathons", route: "/industry/challenges", icon: Trophy },
  { label: "Team Builder", route: "/industry/team-builder", icon: Boxes },
  { label: "Learning Hub", route: "/industry/learning", icon: BookOpen },
  { label: "Feedback Center", route: "/industry/feedback", icon: MessageSquare },
  { label: "Analytics", route: "/industry/analytics", icon: BarChart3 },
  { label: "Notifications", route: "/industry/notifications", icon: Bell },
  { label: "Profile", route: "/industry/profile", icon: User },
];

const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard",
  demand: "Demand Pulse",
  post: "Create Opportunity",
  management: "Opportunity Management",
  talent: "Discover Talent",
  challenges: "Challenges & Hackathons",
  "team-builder": "Team Builder",
  learning: "Learning Hub",
  feedback: "Feedback Center",
  analytics: "Analytics",
  notifications: "Notifications",
  profile: "Profile",
};

export function IndustryShell() {
  const { route, navigate } = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = useIndustryStore((s) => s.notifications.filter((n) => !n.read).length);

  // Close mobile drawer on route change (legitimate sync effect)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [route]);

  const section = route.replace(/^\/industry\/?/, "").split("/")[0] || "dashboard";
  const isExtra = ["challenges", "team-builder", "learning", "feedback", "analytics", "notifications", "profile"].includes(section);

  return (
    <div className="flex min-h-screen bg-[var(--ss-surface-2)]">
      {/* Sidebar */}
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--ss-border)] bg-white lg:flex", collapsed ? "w-[68px]" : "w-64")}>
        <div className="flex h-16 items-center border-b border-[var(--ss-border)] px-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <LogoMark size={32} />
            {!collapsed && <span className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--ss-ink)]">SKILL SETU</span>}
          </button>
        </div>
        <div className="border-b border-[var(--ss-border)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-faint)]">Talent Intelligence</p>
          {!collapsed && <p className="mt-1 text-sm font-bold text-[var(--ss-orange-600)]">{DEMO_COMPANY.companyName}</p>}
        </div>
        <nav className="scroll-slim flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            const active = isActive(section, item.route);
            const Icon = item.icon;
            return (
              <button key={item.route} onClick={() => navigate(item.route)} title={collapsed ? item.label : undefined}
                className={cn("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]",
                  collapsed && "justify-center px-0")}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-[var(--ss-border)] p-2">
          <button onClick={() => navigate("/industry/profile")} className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-[var(--ss-surface-2)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: DEMO_INDUSTRY_USER.avatarColor }}>{DEMO_INDUSTRY_USER.name.slice(0, 1)}</span>
            {!collapsed && <div className="min-w-0 flex-1 text-left"><p className="truncate text-xs font-semibold text-[var(--ss-ink)]">{DEMO_INDUSTRY_USER.name}</p><p className="truncate text-[10px] text-[var(--ss-muted)]">{DEMO_INDUSTRY_USER.role}</p></div>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white">
              <div className="flex h-16 items-center justify-between border-b border-[var(--ss-border)] px-3">
                <div className="flex items-center gap-2"><LogoMark size={30} /><span className="text-xs font-extrabold tracking-[0.14em]">Talent Intelligence</span></div>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-[var(--ss-faint)]"><X className="h-4 w-4" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-2 py-3">
                {NAV.map((item) => {
                  const active = isActive(section, item.route);
                  const Icon = item.icon;
                  return (
                    <button key={item.route} onClick={() => { navigate(item.route); setMobileOpen(false); }}
                      className={cn("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium", active ? "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]")}>
                      <Icon className="h-4 w-4" /> {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--ss-border)] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:hidden"><Menu className="h-5 w-5" /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:block">
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-[var(--ss-ink)]">{BREADCRUMBS[section] ?? section}</span>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => navigate("/industry/notifications")} className="relative rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ss-orange-600)] px-1 text-[9px] font-bold text-white">{unread}</span>}
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--ss-surface-2)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: DEMO_INDUSTRY_USER.avatarColor }}>{DEMO_INDUSTRY_USER.name.slice(0, 1)}</span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-[var(--ss-border)] bg-white shadow-pop">
                      <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2.5">
                        <p className="text-xs font-bold">{DEMO_INDUSTRY_USER.name}</p>
                        <p className="text-[10px] text-[var(--ss-muted)]">{DEMO_INDUSTRY_USER.role} · {DEMO_COMPANY.companyName}</p>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setProfileOpen(false); navigate("/industry/profile"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><User className="h-4 w-4" /> Profile</button>
                        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><Settings className="h-4 w-4" /> Settings</button>
                        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"><HelpCircle className="h-4 w-4" /> Help</button>
                        <div className="my-1 h-px bg-[var(--ss-border)]" />
                        <button onClick={() => navigate("/")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ss-orange-600)] hover:bg-[var(--ss-surface-2)]"><LogOut className="h-4 w-4" /> Logout</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {isExtra ? <IndustryExtra section={section} /> : <IndustryCore section={section} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function isActive(section: string, route: string) {
  const routeSection = route.split("/")[2] || "dashboard";
  return section === routeSection;
}
