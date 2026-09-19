"use client";

/**
 * SKILL SETU — Phase 11 System Architecture Badge.
 *
 * Small indicator in the landing page header showing the current data mode:
 *  - DEMO MODE: localStorage Zustand stores (Phase 3-10)
 *  - PRODUCTION MODE: API + Prisma + SQLite (Phase 11)
 *
 * Allows the evaluator to toggle between modes to see the architecture.
 * Persists choice to localStorage.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Server, ChevronDown, X, CheckCircle2, Cpu } from "lucide-react";
import { useApiMode, useIsProductionMode } from "@/lib/api-mode";
import { cn } from "@/lib/utils";
import { SsDataSourceLabel } from "@/components/ui/ss-intelligence";

export function SystemArchitectureBadge() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const isProduction = useIsProductionMode();
  const { toggle } = useApiMode();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-all",
          isProduction
            ? "border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)] text-[var(--ss-teal-700)]"
            : "border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-700)]"
        )}
        title="System Architecture Mode"
      >
        {isProduction ? (
          <Server className="h-3 w-3" />
        ) : (
          <Database className="h-3 w-3" />
        )}
        {isProduction ? "Production API" : "Demo Mode"}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="absolute right-0 top-10 z-50 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--ss-border)] bg-white shadow-pop"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-[var(--ss-navy-800)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">
                  System Architecture
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-0.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-3)]">
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Current mode */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Current Mode</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  isProduction ? "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]" : "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]"
                )}>
                  {isProduction ? <Server className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--ss-ink)]">
                    {isProduction ? "Production API" : "Demo Mode"}
                  </p>
                  <p className="text-[10px] text-[var(--ss-muted)]">
                    {isProduction
                      ? "Real backend · Prisma + SQLite · API routes"
                      : "localStorage Zustand stores · PROTOTYPE"}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle */}
            <div className="border-t border-[var(--ss-border)] px-3 py-3">
              <button
                onClick={() => { toggle(); setOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-all",
                  isProduction
                    ? "border-[var(--ss-orange-100)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-700)] hover:shadow-soft"
                    : "border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)] text-[var(--ss-teal-700)] hover:shadow-soft"
                )}
              >
                <div>
                  <p className="text-xs font-bold">
                    Switch to {isProduction ? "Demo Mode" : "Production API"}
                  </p>
                  <p className="text-[10px] text-[var(--ss-muted)]">
                    {isProduction
                      ? "Use localStorage Zustand stores (no backend)"
                      : "Use real API routes + Prisma + SQLite"}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {/* Architecture details */}
            <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2.5">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Stack</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">Frontend:</span> Next.js 16
                </div>
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">Backend:</span> API Routes
                </div>
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">ORM:</span> Prisma
                </div>
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">DB:</span> SQLite
                </div>
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">Auth:</span> bcrypt + Cookie
                </div>
                <div className="rounded bg-white px-1.5 py-0.5 text-[var(--ss-ink-soft)]">
                  <span className="font-bold">RBAC:</span> 5 roles
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] text-[var(--ss-muted)]">Data source</span>
                {isProduction ? <SsDataSourceLabel source="platform" /> : <SsDataSourceLabel source="demo" />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
