"use client";

/**
 * SKILL SETU — Phase 10 System Status Panel (§26).
 *
 * Subtle indicator showing the Skill Intelligence Engine status,
 * last update time, and affected modules. Visible only when demo mode is active.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Cpu, Clock } from "lucide-react";
import { useDemoStore } from "@/lib/demo/demo-store";
import { cn } from "@/lib/utils";

const MODULE_LABELS: Record<string, string> = {
  "Skill Profile": "Skill Profile",
  "Role Readiness": "Role Readiness",
  "Skill Gap": "Skill Gap",
  "Opportunity Match": "Opportunity Match",
  "Skill Passport": "Skill Passport",
  "Institution Insights": "Institution Insights",
  "Evidence Pipeline": "Evidence Pipeline",
  "Next Best Action": "Next Best Action",
  "Industry Feedback": "Industry Feedback",
  "Branch × Skill": "Branch × Skill",
  "Demand vs Supply": "Demand vs Supply",
  "Industry Signal": "Industry Signal",
  "Curriculum Alignment": "Curriculum Alignment",
  "Practical Exposure": "Practical Exposure",
  "Role Requirements": "Role Requirements",
  "Role Readiness Context": "Role Readiness Context",
  "Opportunity Match Context": "Opportunity Match Context",
  "Recommended Candidates Context": "Recommended Candidates Context",
  "Demo Control Panel": "Demo Control Panel",
  "Event Timeline": "Event Timeline",
};

export function SystemStatusBadge() {
  const isActive = useDemoStore((s) => s.isActive);
  const lastAction = useDemoStore((s) => s.lastAction);
  const lastActionTimestamp = useDemoStore((s) => s.lastActionTimestamp);
  const affectedModules = useDemoStore((s) => s.affectedModules);

  if (!isActive) return null;

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    } catch {
      return iso;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="fixed left-1/2 top-2 z-40 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-[var(--ss-border)] bg-white/95 px-3 py-1.5 shadow-soft backdrop-blur-xl">
          {/* Status dot */}
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--ss-teal-500)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--ss-teal-600)]" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-ink-soft)]">
            Skill Intelligence Engine
          </span>
          <span className="text-[10px] font-semibold text-[var(--ss-teal-600)]">Active</span>
          <span className="h-3 w-px bg-[var(--ss-border)]" />
          <span className="hidden items-center gap-1 text-[10px] text-[var(--ss-muted)] sm:flex">
            <Clock className="h-3 w-3" />
            {formatTime(lastActionTimestamp)}
          </span>
          <span className="hidden h-3 w-px bg-[var(--ss-border)] sm:block" />
          <span className="hidden max-w-[200px] truncate text-[10px] text-[var(--ss-muted)] sm:block">
            {lastAction ?? "Baseline"}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function SystemStatusFullPanel() {
  const isActive = useDemoStore((s) => s.isActive);
  const lastAction = useDemoStore((s) => s.lastAction);
  const lastActionTimestamp = useDemoStore((s) => s.lastActionTimestamp);
  const affectedModules = useDemoStore((s) => s.affectedModules);

  if (!isActive) return null;

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-xl border border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)]/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Cpu className="h-4 w-4 text-[var(--ss-teal-600)]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-teal-700)]">Skill Intelligence Engine</p>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-teal-600)] ring-1 ring-[var(--ss-teal-100)]">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-[var(--ss-teal-500)] opacity-60" />
            <span className="relative inline-flex h-1 w-1 rounded-full bg-[var(--ss-teal-600)]" />
          </span>
          Active
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-white px-2.5 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Last update</p>
          <p className="text-xs font-semibold text-[var(--ss-ink)]">{formatTime(lastActionTimestamp)}</p>
        </div>
        <div className="rounded-md bg-white px-2.5 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Latest event</p>
          <p className="truncate text-xs font-semibold text-[var(--ss-ink)]">{lastAction ?? "Baseline"}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Affected modules</p>
        <div className="flex flex-wrap gap-1">
          {affectedModules.length === 0 ? (
            <span className="text-[10px] text-[var(--ss-muted)]">None</span>
          ) : (
            affectedModules.map((m) => (
              <span key={m} className="inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--ss-teal-700)] ring-1 ring-[var(--ss-teal-100)]">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {MODULE_LABELS[m] ?? m}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
