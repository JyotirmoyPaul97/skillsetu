"use client";

/**
 * SKILL SETU — Phase 10 Demo Control Panel.
 *
 * Floating action button + slide-out panel with the 5 demo controls
 * (§24 Fast Demo Controls):
 *   Start Demo · Reset Demo · Generate Evidence · Verify Evidence · Submit Feedback
 *
 * Professional design — not a toy (§2 "Do NOT make it look like a toy").
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Play, RotateCcw, FilePlus, ShieldCheck, MessageSquare,
  X, ChevronRight, Clock, Activity,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useDemoStore } from "@/lib/demo/demo-store";
import { DemoEngine } from "@/lib/demo/demo-engine";
import { useIntelligence } from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import { SsDataSourceLabel } from "@/components/ui/ss-intelligence";
import { EventTimelineDrawer } from "./event-timeline";

export function DemoControlPanel() {
  const [open, setOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { navigate } = useRouter();
  const isActive = useDemoStore((s) => s.isActive);
  const events = useDemoStore((s) => s.events);
  const lastAction = useDemoStore((s) => s.lastAction);
  const newEvidenceId = useDemoStore((s) => s.newEvidenceId);

  // S042 readiness for the demo case summary
  const competencies = useIntelligence((s) => s.competencies);
  const mlScore = competencies["machine-learning"]?.competencyScore ?? 43;
  const statsScore = competencies["statistics"]?.competencyScore ?? 51;
  const pyScore = competencies["python"]?.competencyScore ?? 82;

  // Readiness = Σ(comp × weight) / Σ(weight) — Data Scientist weights
  const readiness = Math.round(
    (pyScore * 0.25 + (competencies["sql"]?.competencyScore ?? 64) * 0.15 +
      statsScore * 0.20 + mlScore * 0.30 +
      (competencies["problem-solving"]?.competencyScore ?? 75) * 0.10) / 1.00
  );

  // Avoid SSR hydration mismatch — useDemoStore reads from localStorage
  if (!mounted) {
    return null;
  }

  const handleStart = () => {
    DemoEngine.startDemo();
    navigate("/app/dashboard");
  };

  const handleReset = () => {
    if (confirm("Reset the entire demo to baseline state? All evidence, feedback, and timeline events will be cleared.")) {
      DemoEngine.resetDemo();
    }
  };

  const handleGenerate = () => {
    DemoEngine.generateNewEvidence();
    navigate("/app/passport");
  };

  const handleVerify = () => {
    DemoEngine.verifyEvidence();
    navigate("/app/dashboard");
  };

  const handleFeedback = () => {
    DemoEngine.submitIndustryFeedback();
    navigate("/industry/feedback");
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 280 }}
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-pop transition-all hover:scale-105",
          isActive
            ? "bg-gradient-to-br from-[var(--ss-navy-900)] to-[var(--ss-navy-800)] text-white ring-2 ring-[var(--ss-blue-500)]"
            : "bg-gradient-to-br from-[var(--ss-orange-500)] to-[var(--ss-orange-600)] text-white"
        )}
        aria-label="Evaluator Demo"
        title="Evaluator Demo Mode"
      >
        <Sparkles className="h-5 w-5" />
        {isActive && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-[var(--ss-teal-500)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ss-teal-500)]" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed bottom-20 right-5 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--ss-border)] bg-gradient-to-r from-[var(--ss-navy-900)] to-[var(--ss-navy-800)] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Evaluator Demo Mode</p>
                  <p className="text-sm font-bold">SKILL SETU Intelligence Loop</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Demo Case Summary (§2) */}
            <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Demo Case</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-[var(--ss-muted)]">Student</p>
                  <p className="font-bold text-[var(--ss-ink)]">S042 · Aarav Sharma</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--ss-muted)]">Branch</p>
                  <p className="font-bold text-[var(--ss-ink)]">AI & Data Science</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--ss-muted)]">Target Role</p>
                  <p className="font-bold text-[var(--ss-ink)]">Data Scientist</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--ss-muted)]">Role Readiness</p>
                  <p className="font-bold text-[var(--ss-teal-600)]">{readiness}%</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                <span className="rounded bg-[var(--ss-surface-3)] px-1.5 py-0.5 font-medium text-[var(--ss-ink-soft)]">Py {pyScore}</span>
                <span className="rounded bg-[var(--ss-surface-3)] px-1.5 py-0.5 font-medium text-[var(--ss-ink-soft)]">SQL {competencies["sql"]?.competencyScore ?? 64}</span>
                <span className="rounded bg-[var(--ss-surface-3)] px-1.5 py-0.5 font-medium text-[var(--ss-ink-soft)]">Stats {statsScore}</span>
                <span className="rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-700">ML {mlScore}</span>
                <span className="rounded bg-[var(--ss-surface-3)] px-1.5 py-0.5 font-medium text-[var(--ss-ink-soft)]">PS {competencies["problem-solving"]?.competencyScore ?? 75}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">Critical gap: ML</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Supporting gap: Stats</span>
              </div>
              <div className="mt-2">
                <SsDataSourceLabel source="demo" />
              </div>
            </div>

            {/* Action buttons (§24) */}
            <div className="space-y-1.5 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Fast Demo Controls</p>

              <DemoActionButton
                icon={Play}
                label={isActive ? "Demo Active — Continue" : "Start Demo"}
                description="Activate demo mode + load S042 baseline"
                tone={isActive ? "teal" : "navy"}
                onClick={handleStart}
              />

              <DemoActionButton
                icon={FilePlus}
                label="Generate New Evidence"
                description="S042 completes Customer Churn Prediction project (Submitted)"
                tone="blue"
                onClick={handleGenerate}
                disabled={!isActive}
              />

              <DemoActionButton
                icon={ShieldCheck}
                label="Verify / Evaluate Evidence"
                description="Project evidence Submitted → Verified; ML competency recalculated"
                tone="teal"
                onClick={handleVerify}
                disabled={!isActive || !newEvidenceId}
              />

              <DemoActionButton
                icon={MessageSquare}
                label="Submit Industry Feedback"
                description="Industry evaluates S042's project (Technical 4/5, Strong)"
                tone="orange"
                onClick={handleFeedback}
                disabled={!isActive || !newEvidenceId}
              />

              <DemoActionButton
                icon={RotateCcw}
                label="Reset Demo"
                description="Restore baseline state — clear all evidence + feedback + timeline"
                tone="neutral"
                onClick={handleReset}
                disabled={!isActive}
              />
            </div>

            {/* Last action + Event Timeline toggle */}
            <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2.5">
              {lastAction && (
                <div className="mb-2 flex items-start gap-1.5 text-[11px]">
                  <Activity className="mt-0.5 h-3 w-3 shrink-0 text-[var(--ss-teal-600)]" />
                  <p className="text-[var(--ss-ink-soft)]">
                    <span className="font-semibold">Last action:</span> {lastAction}
                  </p>
                </div>
              )}
              <button
                onClick={() => setTimelineOpen(true)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--ss-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--ss-ink)] hover:bg-[var(--ss-surface-2)]"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[var(--ss-blue-600)]" />
                  Event Timeline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--ss-blue-600)]">{events.length}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--ss-muted)]" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Timeline slide-in */}
      <EventTimelineDrawer open={timelineOpen} onClose={() => setTimelineOpen(false)} />
    </>
  );
}

function DemoActionButton({
  icon: Icon,
  label,
  description,
  tone,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  tone: "navy" | "blue" | "teal" | "orange" | "neutral";
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneMap = {
    navy: "border-[var(--ss-navy-800)] bg-[var(--ss-navy-50,#DBE7F5)] text-[var(--ss-navy-900)]",
    blue: "border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]",
    teal: "border-[var(--ss-teal-600)] bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]",
    orange: "border-[var(--ss-orange-600)] bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]",
    neutral: "border-[var(--ss-border)] bg-white text-[var(--ss-ink-soft)]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-all",
        toneMap[tone],
        disabled && "cursor-not-allowed opacity-50 hover:bg-inherit",
        !disabled && "hover:shadow-soft"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-[10px] text-[var(--ss-muted)]">{description}</p>
      </div>
    </button>
  );
}
