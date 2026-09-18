"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Radar, ClipboardCheck, Code, Users, Brain, AlertTriangle,
  Briefcase, GraduationCap, FolderKanban, BookOpen, Trophy, Search, Send,
  BadgeCheck, CheckCircle2, FolderGit, Award, Building2, FileText, Bell,
  ChevronDown, ChevronRight, Menu, X, LogOut, Settings, HelpCircle, User,
  PanelLeftClose, PanelLeft, Command,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter, appSection } from "@/lib/router";
import { useStudentState } from "@/lib/student-state";
import { STUDENT, NOTIFICATIONS, TECHNICAL_SKILLS, JOBS, INTERNSHIPS, PROJECTS, UPCOMING_HACKATHONS } from "@/lib/student-data";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "./student-parts";

// Code-split each student page so the AppShell bundle stays light (memory-friendly).
const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ss-border)] border-t-[var(--ss-blue-600)]" />
  </div>
);
const DashboardPage = dynamic(() => import("./student/dashboard").then((m) => m.DashboardPage), { ssr: false, loading: PageLoader });
const MySkillsPage = dynamic(() => import("./student/learning").then((m) => m.MySkillsPage), { ssr: false, loading: PageLoader });
const AssessmentPage = dynamic(() => import("./student/learning").then((m) => m.AssessmentPage), { ssr: false, loading: PageLoader });
const CareerPage = dynamic(() => import("./student/career").then((m) => m.CareerPage), { ssr: false, loading: PageLoader });
const PassportPage = dynamic(() => import("./student/passport").then((m) => m.PassportPage), { ssr: false, loading: PageLoader });
const HackathonsPage = dynamic(() => import("./student/hackathons").then((m) => m.HackathonsPage), { ssr: false, loading: PageLoader });
const NotificationsPage = dynamic(() => import("./student/misc").then((m) => m.NotificationsPage), { ssr: false, loading: PageLoader });
const ProfilePage = dynamic(() => import("./student/misc").then((m) => m.ProfilePage), { ssr: false, loading: PageLoader });

// ─── Nav configuration (spec §3) ────────────────────────────────
interface NavLeaf { label: string; route: string; icon: LucideIcon }
interface NavGroup { label: string; icon: LucideIcon; children: NavLeaf[] }
type NavItem = NavLeaf | (NavGroup & { children: NavLeaf[] })

function isGroup(i: NavItem): i is NavGroup & { children: NavLeaf[] } {
  return (i as NavGroup).children !== undefined;
}

const NAV: (NavLeaf | NavGroup)[] = [
  { label: "Dashboard", route: "/app/dashboard", icon: LayoutDashboard },
  {
    label: "My Skills", icon: Radar, children: [
      { label: "Assessment", route: "/app/assessment", icon: ClipboardCheck },
      { label: "Technical", route: "/app/skills/technical", icon: Code },
      { label: "Soft Skills", route: "/app/skills/soft", icon: Users },
      { label: "Aptitude", route: "/app/skills/aptitude", icon: Brain },
      { label: "Skill Gap", route: "/app/skills/gap", icon: AlertTriangle },
    ],
  },
  {
    label: "Career & Opportunities", icon: Briefcase, children: [
      { label: "Jobs", route: "/app/career/jobs", icon: Briefcase },
      { label: "Internships", route: "/app/career/internships", icon: GraduationCap },
      { label: "Projects", route: "/app/career/projects", icon: FolderKanban },
      { label: "Industry Learning", route: "/app/career/learning", icon: BookOpen },
    ],
  },
  {
    label: "Hackathons & Teams", icon: Trophy, children: [
      { label: "Discover", route: "/app/hackathons/discover", icon: Search },
      { label: "My Hackathons", route: "/app/hackathons/mine", icon: Trophy },
      { label: "My Teams", route: "/app/hackathons/teams", icon: Users },
      { label: "Submissions", route: "/app/hackathons/submissions", icon: Send },
      { label: "Mentorship", route: "/app/hackathons/mentorship", icon: GraduationCap },
    ],
  },
  {
    label: "Skill Passport", icon: BadgeCheck, children: [
      { label: "Verified Skills", route: "/app/passport/verified", icon: CheckCircle2 },
      { label: "Projects", route: "/app/passport/projects", icon: FolderGit },
      { label: "Certifications", route: "/app/passport/certifications", icon: Award },
      { label: "Internships", route: "/app/passport/internships", icon: Building2 },
      { label: "Hackathons", route: "/app/passport/hackathons", icon: Trophy },
      { label: "Resume", route: "/app/passport/resume", icon: FileText },
    ],
  },
  { label: "Notifications", route: "/app/notifications", icon: Bell },
];

// Breadcrumb labels for the top bar
const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard", assessment: "Assessment",
  "skills": "My Skills", "career": "Career & Opportunities", "hackathons": "Hackathons & Teams", "passport": "Skill Passport",
  notifications: "Notifications", profile: "My Profile",
  technical: "Technical", soft: "Soft Skills", aptitude: "Aptitude", gap: "Skill Gap",
  jobs: "Jobs", internships: "Internships", projects: "Projects", learning: "Industry Learning",
  discover: "Discover", mine: "My Hackathons", teams: "My Teams", submissions: "Submissions", mentorship: "Mentorship",
  verified: "Verified Skills", certifications: "Certifications", resume: "Resume",
};

export function AppShell() {
  const { route } = useRouter();
  const [collapsed, setCollapsed] = useState(false); // desktop sidebar collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  // Close mobile drawer on route change (legitimate sync effect)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [route]);

  const seg = appSection(route);
  const section = seg[0] || "dashboard";

  return (
    <div className="flex min-h-screen bg-[var(--ss-surface-2)]">
      <Sidebar collapsed={collapsed} section={section} />
      <MobileDrawer section={section} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleMobile={() => setMobileOpen(true)} onToggleCollapse={() => setCollapsed(!collapsed)} collapsed={collapsed} seg={seg} />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <ContentOutlet seg={seg} />
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Content outlet ─────────────────────────────────────────────
function ContentOutlet({ seg }: { seg: string[] }) {
  const [section, sub] = seg;
  const key = (section || "dashboard") + "/" + (sub || "");
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {(() => {
          switch (section) {
            case undefined:
            case "dashboard": return <DashboardPage />;
            case "skills": return <MySkillsPage section={(sub as any) || "technical"} />;
            case "assessment": return <AssessmentPage />;
            case "career": return <CareerPage section={(sub as any) || "jobs"} />;
            case "hackathons": return <HackathonsPage section={(sub as any) || "discover"} />;
            case "passport": return <PassportPage tab={(sub as any) || "verified"} />;
            case "notifications": return <NotificationsPage />;
            case "profile": return <ProfilePage />;
            default: return <DashboardPage />;
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Sidebar (desktop) ──────────────────────────────────────────
function Sidebar({ collapsed, section }: { collapsed: boolean; section: string }) {
  const { navigate } = useRouter();
  return (
    <aside className={cn(
      "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--ss-border)] bg-white lg:flex",
      collapsed ? "w-[68px]" : "w-64",
    )}>
      {/* brand */}
      <div className="flex h-16 items-center border-b border-[var(--ss-border)] px-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2" aria-label="SKILL SETU home">
          <LogoMark size={32} />
          {!collapsed && <span className="text-[13px] font-extrabold tracking-[0.14em] text-[var(--ss-ink)]">SKILL SETU</span>}
        </button>
      </div>

      <nav className="scroll-slim flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((item) =>
          isGroup(item) ? (
            <NavGroupItem key={item.label} group={item} collapsed={collapsed} section={section} />
          ) : (
            <NavLeafItem key={item.label} item={item} collapsed={collapsed} active={isActive(section, item.route)} onClick={() => navigate(item.route)} />
          ),
        )}
      </nav>

      {/* user block */}
      <div className="border-t border-[var(--ss-border)] p-2">
        <button onClick={() => navigate("/app/profile")} className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-[var(--ss-surface-2)]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: STUDENT.avatarColor }}>
            {STUDENT.name.slice(0, 1)}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-[var(--ss-ink)]">{STUDENT.name}</p>
              <p className="truncate text-[10px] text-[var(--ss-muted)]">{STUDENT.id}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function isActive(section: string, route: string) {
  const routeSection = route.split("/")[2] || "dashboard";
  return section === routeSection;
}

function NavLeafItem({ item, collapsed, active, onClick }: { item: NavLeaf; collapsed: boolean; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}

function NavGroupItem({ group, collapsed, section }: { group: NavGroup; collapsed: boolean; section: string }) {
  const [open, setOpen] = useState(true);
  const { navigate } = useRouter();
  const hasActive = group.children.some((c) => isActive(section, c.route));
  const Icon = group.icon;
  // Auto-expand a group when one of its children is the active route
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasActive) setOpen(true);
  }, [hasActive]);

  if (collapsed) {
    return (
      <div className="mb-0.5 flex justify-center py-1">
        <button title={group.label} onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
          <Icon className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          hasActive ? "text-[var(--ss-ink)]" : "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-4 border-l border-[var(--ss-border)] pl-2 pt-0.5">
              {group.children.map((c) => {
                const active = isActive(section, c.route);
                return <NavLeafItem key={c.route} item={c} collapsed={false} active={active} onClick={() => navigate(c.route)} />;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile drawer ──────────────────────────────────────────────
function MobileDrawer({ section, open, onClose }: { section: string; open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white"
          >
            <div className="flex h-16 items-center justify-between border-b border-[var(--ss-border)] px-3">
              <div className="flex items-center gap-2"><LogoMark size={30} /><span className="text-xs font-extrabold tracking-[0.14em] text-[var(--ss-ink)]">SKILL SETU</span></div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]"><X className="h-4 w-4" /></button>
            </div>
            <nav className="scroll-slim flex-1 overflow-y-auto px-2 py-3">
              {NAV.map((item) =>
                isGroup(item) ? (
                  <NavGroupItem key={item.label} group={item} collapsed={false} section={section} />
                ) : (
                  <NavLeafItem key={item.label} item={item} collapsed={false} active={isActive(section, item.route)} onClick={() => navigate(item.route)} />
                ),
              )}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────
function Topbar({ onToggleMobile, onToggleCollapse, collapsed, seg }: { onToggleMobile: () => void; onToggleCollapse: () => void; collapsed: boolean; seg: string[] }) {
  const { navigate } = useRouter();
  const { readNotifications } = useStudentState();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => !readNotifications.has(n.id)).length;

  const crumbs = seg.map((s) => BREADCRUMBS[s] || s);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--ss-border)] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      {/* left: toggles + breadcrumb */}
      <button onClick={onToggleMobile} className="rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <button onClick={onToggleCollapse} className="hidden rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] lg:block" aria-label="Toggle sidebar">
        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.length === 0 ? (
          <span className="font-semibold text-[var(--ss-ink)]">Dashboard</span>
        ) : (
          crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-[var(--ss-faint)]" />}
              <span className={i === crumbs.length - 1 ? "font-semibold text-[var(--ss-ink)]" : "text-[var(--ss-muted)]"}>{c}</span>
            </span>
          ))
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        {/* search */}
        <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-1.5 text-xs text-[var(--ss-muted)] hover:bg-[var(--ss-surface-3)] sm:w-56">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-auto hidden rounded border border-[var(--ss-border)] bg-white px-1 text-[9px] text-[var(--ss-faint)] sm:inline">⌘K</kbd>
        </button>

        {/* notifications */}
        <button onClick={() => navigate("/app/notifications")} className="relative rounded-lg p-2 text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ss-orange-600)] px-1 text-[9px] font-bold text-white">{unread}</span>
          )}
        </button>

        {/* profile */}
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--ss-surface-2)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: STUDENT.avatarColor }}>
              {STUDENT.name.slice(0, 1)}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--ss-faint)] sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-[var(--ss-border)] bg-white shadow-pop"
                >
                  <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2.5">
                    <p className="text-xs font-bold text-[var(--ss-ink)]">{STUDENT.name}</p>
                    <p className="text-[10px] text-[var(--ss-muted)]">{STUDENT.id} · {STUDENT.branch}</p>
                  </div>
                  <div className="p-1">
                    <ProfileItem icon={User} label="My Profile" onClick={() => { setProfileOpen(false); navigate("/app/profile"); }} />
                    <ProfileItem icon={Settings} label="Settings" onClick={() => setProfileOpen(false)} />
                    <ProfileItem icon={HelpCircle} label="Help" onClick={() => setProfileOpen(false)} />
                    <div className="my-1 h-px bg-[var(--ss-border)]" />
                    <ProfileItem icon={LogOut} label="Logout" onClick={() => { setProfileOpen(false); navigate("/"); }} danger />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function ProfileItem({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--ss-surface-2)]", danger ? "text-[var(--ss-orange-600)]" : "text-[var(--ss-ink-soft)]")}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// ─── Global search palette (spec §37) ───────────────────────────
function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return null;
    const skills = TECHNICAL_SKILLS.filter((s) => s.name.toLowerCase().includes(query)).map((s) => ({ type: "Skill", label: s.name, sub: `${s.score}/100`, route: "/app/skills/technical" }));
    const jobs = JOBS.filter((o) => o.title.toLowerCase().includes(query) || o.company.toLowerCase().includes(query)).map((o) => ({ type: "Job", label: o.title, sub: o.company, route: "/app/career/jobs" }));
    const ints = INTERNSHIPS.filter((o) => o.title.toLowerCase().includes(query) || o.company.toLowerCase().includes(query)).map((o) => ({ type: "Internship", label: o.title, sub: o.company, route: "/app/career/internships" }));
    const prjs = PROJECTS.filter((o) => o.title.toLowerCase().includes(query) || o.company.toLowerCase().includes(query)).map((o) => ({ type: "Project", label: o.title, sub: o.company, route: "/app/career/projects" }));
    const hks = UPCOMING_HACKATHONS.filter((h) => h.name.toLowerCase().includes(query) || h.domain.toLowerCase().includes(query)).map((h) => ({ type: "Hackathon", label: h.name, sub: h.domain, route: "/app/hackathons/discover" }));
    return [...skills, ...jobs, ...ints, ...prjs, ...hks];
  }, [query]);

  return (
    <Modal open={open} onClose={onClose} title="Global Search" subtitle="Skills · Jobs · Internships · Projects · Hackathons" size="md">
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2">
          <Search className="h-4 w-4 text-[var(--ss-faint)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills, jobs, internships, projects, hackathons…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ss-faint)]"
          />
          {q && <button onClick={() => setQ("")} className="text-[var(--ss-faint)] hover:text-[var(--ss-ink)]"><X className="h-3.5 w-3.5" /></button>}
        </div>
        <p className="inline-flex items-center gap-1 text-[10px] text-[var(--ss-muted)]"><Command className="h-3 w-3" /> Uses local prototype data</p>

        {results === null ? (
          <div className="py-8 text-center text-xs text-[var(--ss-muted)]">Start typing to search the student ecosystem.</div>
        ) : results.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--ss-muted)]">No results for “{q}”.</div>
        ) : (
          <div className="scroll-slim max-h-72 space-y-1 overflow-y-auto">
            {results.map((r, i) => (
              <button key={i} onClick={() => { navigate(r.route); onClose(); }} className="flex w-full items-center gap-3 rounded-lg border border-[var(--ss-border)] px-3 py-2 text-left hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
                <span className="rounded bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ss-blue-600)]">{r.type}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--ss-ink)]">{r.label}</p>
                  <p className="truncate text-[10px] text-[var(--ss-muted)]">{r.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--ss-faint)]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
