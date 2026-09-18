"use client";

/**
 * SKILL SETU — Phase 9 intelligence primitives.
 *
 * Visual vocabulary shared by Industry / Academia / Institution portals.
 * Each portal has a UNIQUE information hierarchy but shares these primitives
 * so the design system stays unified (master spec §64: "All still use the same
 * SKILL SETU design system").
 *
 * Principles:
 *  - Rules calculate. These components only DISPLAY computed values.
 *  - No fake statistics. Every number must come from a service/hook.
 *  - Honest status labels on every insight (DEMO DATA / IMPLEMENTED / PROTOTYPE).
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Sparkles, Info,
  CheckCircle2, XCircle, AlertCircle, ChevronRight, X,
  Database, FlaskConical, Map as MapIcon, Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// SsDemandBadge — pill that labels demand level for a skill/role
// ============================================================
const demandVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap",
  {
    variants: {
      level: {
        High:      "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)] ring-1 ring-[var(--ss-orange-100)]",
        Medium:    "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)] ring-1 ring-[var(--ss-blue-100)]",
        Low:       "bg-[var(--ss-surface-3)] text-[var(--ss-muted)] ring-1 ring-[var(--ss-border)]",
        Emerging:  "bg-purple-50 text-purple-600 ring-1 ring-purple-100",
        Critical:  "bg-red-50 text-red-600 ring-1 ring-red-100",
      },
    },
    defaultVariants: { level: "Low" },
  },
);

export function SsDemandBadge({
  level,
  className,
  children,
}: {
  level: "High" | "Medium" | "Low" | "Emerging" | "Critical";
  className?: string;
  children?: React.ReactNode;
}) {
  const Icon = level === "Emerging" ? Sparkles : level === "Critical" || level === "High" ? TrendingUp : level === "Medium" ? Info : TrendingDown;
  return (
    <span className={cn(demandVariants({ level }), className)}>
      <Icon className="h-3 w-3" />
      {children ?? level} {level === "Emerging" ? "" : level === "Critical" ? "GAP" : "DEMAND"}
    </span>
  );
}

// ============================================================
// SsPriorityPill — priority chip for interventions
// ============================================================
const priorityVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
  {
    variants: {
      priority: {
        Critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
        High:     "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)] ring-1 ring-[var(--ss-orange-100)]",
        Medium:   "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        Low:      "bg-[var(--ss-surface-3)] text-[var(--ss-muted)] ring-1 ring-[var(--ss-border)]",
      },
    },
    defaultVariants: { priority: "Low" },
  },
);

export function SsPriorityPill({
  priority,
  className,
}: {
  priority: "Critical" | "High" | "Medium" | "Low";
  className?: string;
}) {
  return <span className={cn(priorityVariants({ priority }), className)}>{priority}</span>;
}

// ============================================================
// SsCoverageBar — supply vs demand bar
//   - track = demand (full bar background)
//   - fill  = supply (overlay)
//   - marker = required level (vertical line)
// ============================================================
export function SsCoverageBar({
  label,
  demand,
  supply,
  required,
  suffix = "",
  className,
}: {
  label: string;
  demand: number;   // 0–100
  supply: number;  // 0–100
  required?: number;
  suffix?: string;
  className?: string;
}) {
  const gap = Math.max(0, demand - supply);
  const gapTone = gap >= 30 ? "text-red-600" : gap >= 15 ? "text-[var(--ss-orange-600)]" : "text-[var(--ss-teal-600)]";
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-[var(--ss-ink-soft)]">{label}</span>
        <span className={cn("font-semibold tabular-nums", gapTone)}>
          {supply}{suffix} / {demand}{suffix} {gap > 0 && <span className="text-[var(--ss-muted)]">· gap {gap}</span>}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--ss-orange-100)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--ss-blue-600)] transition-all duration-500"
          style={{ width: `${Math.min(100, supply)}%` }}
        />
        {required !== undefined && (
          <span
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-[var(--ss-navy-900)]"
            style={{ left: `${Math.min(100, required)}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SsPipeline — horizontal flow of stages with active highlight
// ============================================================
export function SsPipeline({
  stages,
  activeIndex,
  completedUntil,
  className,
}: {
  stages: { key: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  activeIndex?: number;
  completedUntil?: number;  // index of last completed stage (exclusive)
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-stretch gap-1", className)}>
      {stages.map((stage, idx) => {
        const Icon = stage.icon;
        const isCompleted = completedUntil !== undefined && idx < completedUntil;
        const isActive = activeIndex === idx;
        return (
          <React.Fragment key={stage.key}>
            <div
              className={cn(
                "flex min-w-[110px] flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center",
                isActive
                  ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]"
                  : isCompleted
                    ? "border-[var(--ss-teal-100)] bg-[var(--ss-teal-50)]"
                    : "border-[var(--ss-border)] bg-white",
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-[var(--ss-blue-600)] text-white"
                      : isCompleted
                        ? "bg-[var(--ss-teal-600)] text-white"
                        : "bg-[var(--ss-surface-3)] text-[var(--ss-muted)]",
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                </span>
              )}
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.08em] leading-tight",
                  isActive ? "text-[var(--ss-blue-600)]" : isCompleted ? "text-[var(--ss-teal-600)]" : "text-[var(--ss-muted)]",
                )}
              >
                {stage.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <ChevronRight className="mt-3 h-3.5 w-3.5 shrink-0 text-[var(--ss-faint)]" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================
// SsAlignmentChain — vertical chain diagram
// Industry Demand → Skill → Curriculum → Competency → Evidence → Status
// ============================================================
export function SsAlignmentChain({
  rows,
  className,
}: {
  rows: {
    label: string;
    value: string;
    tone?: "demand" | "skill" | "coverage" | "competency" | "evidence" | "status";
  }[];
  className?: string;
}) {
  const toneColor: Record<string, string> = {
    demand:      "border-l-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]",
    skill:       "border-l-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]",
    coverage:    "border-l-[var(--ss-blue-500)] bg-[var(--ss-blue-50)]",
    competency:  "border-l-[var(--ss-teal-600)] bg-[var(--ss-teal-50)]",
    evidence:    "border-l-[var(--ss-teal-500)] bg-[var(--ss-teal-50)]",
    status:      "border-l-[var(--ss-navy-900)] bg-[var(--ss-surface-3)]",
  };
  return (
    <div className={cn("flex flex-col", className)}>
      {rows.map((row, idx) => (
        <div key={idx} className="relative">
          <div className={cn("rounded-md border border-[var(--ss-border)] border-l-4 px-3 py-2", toneColor[row.tone ?? "skill"])}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">{row.label}</p>
            <p className="text-sm font-semibold text-[var(--ss-ink)]">{row.value}</p>
          </div>
          {idx < rows.length - 1 && (
            <div className="my-0.5 ml-4 h-3 w-0.5 bg-[var(--ss-faint)]" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SsHeatmap — branch × skill matrix
// ============================================================
export function SsHeatmap({
  rows,        // labels for Y axis (e.g., departments)
  cols,        // labels for X axis (e.g., skills)
  cells,       // map "y|x" → { value: number, label?: string }
  onCellClick,
  className,
  threshold = (v: number) => (v >= 75 ? "bg-[var(--ss-teal-100)] text-[var(--ss-teal-700)]"
    : v >= 60 ? "bg-[var(--ss-blue-50)] text-[var(--ss-blue-700)]"
    : v >= 40 ? "bg-amber-50 text-amber-800"
    : v >= 1 ? "bg-red-50 text-red-700"
    : "bg-[var(--ss-surface-3)] text-[var(--ss-muted)]"),
}: {
  rows: string[];
  cols: string[];
  cells: Record<string, { value: number; label?: string }>;
  onCellClick?: (y: number, x: number, value: number) => void;
  className?: string;
  threshold?: (v: number) => string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-[var(--ss-border)] bg-white", className)}>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left font-semibold text-[var(--ss-muted)]" />
            {cols.map((c) => (
              <th key={c} className="px-2 py-1.5 text-center font-semibold text-[var(--ss-muted)] whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowLabel, y) => (
            <tr key={rowLabel}>
              <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left font-semibold text-[var(--ss-ink-soft)] whitespace-nowrap">{rowLabel}</td>
              {cols.map((colLabel, x) => {
                const cell = cells[`${y}|${x}`];
                const v = cell?.value ?? 0;
                return (
                  <td key={colLabel} className="p-0.5">
                    <button
                      type="button"
                      disabled={!onCellClick}
                      onClick={() => onCellClick?.(y, x, v)}
                      className={cn(
                        "h-9 min-w-[44px] rounded-md text-center font-semibold tabular-nums transition-colors",
                        threshold(v),
                        onCellClick && "cursor-pointer hover:ring-2 hover:ring-[var(--ss-blue-600)]",
                      )}
                    >
                      {cell?.label ?? (v > 0 ? v : "—")}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// SsAlertPill — institutional intelligence alert chip
// ============================================================
const alertVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
  {
    variants: {
      tone: {
        critical:  "bg-red-50 text-red-700 ring-1 ring-red-200",
        warning:   "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)] ring-1 ring-[var(--ss-orange-100)]",
        info:      "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)] ring-1 ring-[var(--ss-blue-100)]",
        emerging:  "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

export function SsAlertPill({
  tone,
  label,
  className,
}: {
  tone: "critical" | "warning" | "info" | "emerging";
  label: string;
  className?: string;
}) {
  const Icon = tone === "critical" ? AlertTriangle : tone === "warning" ? AlertCircle : tone === "emerging" ? Sparkles : Info;
  return (
    <span className={cn(alertVariants({ tone }), className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ============================================================
// SsWhyCard — explainability factor list (used in Why? modals)
// ============================================================
export function SsWhyFactor({
  ok,
  label,
  detail,
}: {
  ok: "pass" | "warn" | "fail";
  label: string;
  detail?: string;
}) {
  const Icon = ok === "pass" ? CheckCircle2 : ok === "warn" ? AlertCircle : XCircle;
  const tone = ok === "pass" ? "text-[var(--ss-teal-600)]" : ok === "warn" ? "text-[var(--ss-orange-600)]" : "text-red-600";
  return (
    <div className="flex items-start gap-2 rounded-md border border-[var(--ss-border)] bg-white px-3 py-2">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--ss-ink)]">{label}</p>
        {detail && <p className="text-[11px] text-[var(--ss-muted)]">{detail}</p>}
      </div>
    </div>
  );
}

// ============================================================
// SsWhyModal — modal wrapper for "Why?" explainability
// ============================================================
export function SsWhyModal({
  open,
  onClose,
  title,
  subtitle,
  factors,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  factors?: { ok: "pass" | "warn" | "fail"; label: string; detail?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--ss-border)] px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ss-blue-600)]">Explainability</p>
                <h3 className="mt-0.5 text-lg font-bold text-[var(--ss-ink)]">{title}</h3>
                {subtitle && <p className="text-xs text-[var(--ss-muted)]">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {factors && (
                <div className="mb-4 space-y-1.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Contributing factors</p>
                  {factors.map((f, i) => <SsWhyFactor key={i} {...f} />)}
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// SsDataSourceLabel — honest data-source label
// ============================================================
export function SsDataSourceLabel({
  source,
  className,
}: {
  source: "platform" | "demo" | "curriculum" | "prototype" | "future";
  className?: string;
}) {
  const map = {
    platform:    { label: "Based on platform data", icon: Database, tone: "text-[var(--ss-teal-600)]" },
    demo:        { label: "DEMO DATA", icon: FlaskConical, tone: "text-[var(--ss-orange-600)]" },
    curriculum:  { label: "Based on current curriculum mappings", icon: MapIcon, tone: "text-[var(--ss-blue-600)]" },
    prototype:   { label: "PROTOTYPE", icon: Sparkles, tone: "text-purple-600" },
    future:      { label: "FUTURE INTEGRATION", icon: Plug, tone: "text-[var(--ss-muted)]" },
  } as const;
  const m = map[source];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em]", m.tone, className)}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

// ============================================================
// SsIntelligenceAssistant — collapsible panel with suggested questions
// (Phase 9 §57–§60 — AI explains; rules already calculated the numbers)
// ============================================================
export function SsIntelligenceAssistant({
  questions,
  title = "Ask the intelligence layer",
  tone = "blue",
  onAsk,
  answered,
}: {
  questions: { id: string; label: string }[];
  title?: string;
  tone?: "blue" | "orange" | "teal" | "navy";
  onAsk?: (questionId: string) => void;
  answered?: Record<string, React.ReactNode>;
}) {
  const [open, setOpen] = useStateSsr(false);
  const toneRing = {
    blue: "ring-[var(--ss-blue-100)]",
    orange: "ring-[var(--ss-orange-100)]",
    teal: "ring-[var(--ss-teal-100)]",
    navy: "ring-[var(--ss-border)]",
  }[tone];
  return (
    <div className={cn("rounded-xl border border-[var(--ss-border)] bg-white p-3 shadow-soft ring-1", toneRing)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          tone === "blue" && "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]",
          tone === "orange" && "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]",
          tone === "teal" && "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]",
          tone === "navy" && "bg-[var(--ss-surface-3)] text-[var(--ss-navy-800)]",
        )}>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Intelligence Assistant</span>
          <span className="block text-sm font-semibold text-[var(--ss-ink)]">{title}</span>
        </span>
        <ChevronRight className={cn("h-4 w-4 text-[var(--ss-faint)] transition-transform", open && "rotate-90")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-[var(--ss-border)] pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Suggested questions</p>
              {questions.map((q) => (
                <div key={q.id} className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] p-2">
                  <button
                    type="button"
                    onClick={() => onAsk?.(q.id)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="text-xs font-medium text-[var(--ss-ink-soft)]">{q.label}</span>
                    {onAsk && <span className="text-[10px] font-bold uppercase text-[var(--ss-blue-600)]">Ask →</span>}
                  </button>
                  {answered?.[q.id] && (
                    <div className="mt-2 rounded-md border border-[var(--ss-blue-100)] bg-[var(--ss-blue-50)] p-2 text-[11px] text-[var(--ss-ink-soft)]">
                      {answered[q.id]}
                    </div>
                  )}
                </div>
              ))}
              <p className="pt-1 text-[10px] text-[var(--ss-faint)]">
                Answers are derived from platform data using deterministic rules. AI explains; it does not invent numbers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// tiny SSR-safe useState to keep file self-contained
function useStateSsr<T>(initial: T): [T, (v: T) => void] {
  const [v, setV] = React.useState<T>(initial);
  return [v, setV];
}

// ============================================================
// SsMatrixCellDetail — slide-in panel for matrix cell details
// ============================================================
export function SsMatrixCellDetail({
  open,
  onClose,
  title,
  rows,
  action,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  action?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-[var(--ss-border)] bg-white shadow-pop"
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-[var(--ss-border)] bg-white px-4 py-3">
            <p className="text-sm font-bold text-[var(--ss-ink)]">{title}</p>
            <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 p-4">
            {rows.map((r, i) => (
              <div key={i} className="rounded-md border border-[var(--ss-border)] bg-white px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">{r.label}</p>
                <p className="mt-0.5 text-sm text-[var(--ss-ink)]">{r.value}</p>
              </div>
            ))}
            {action && <div className="pt-2">{action}</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// SsWorkflowBanner — small banner stating the portal's primary workflow
// ============================================================
export function SsWorkflowBanner({
  steps,
  tone = "blue",
  className,
}: {
  steps: string[];
  tone?: "blue" | "orange" | "teal" | "navy";
  className?: string;
}) {
  const toneColor = {
    blue: "text-[var(--ss-blue-600)]",
    orange: "text-[var(--ss-orange-600)]",
    teal: "text-[var(--ss-teal-600)]",
    navy: "text-[var(--ss-navy-800)]",
  }[tone];
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]", toneColor, className)}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <span>{s}</span>
          {i < steps.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================
// SsEmptyState — Phase 9 §76 spec-exact empty-state messages per portal
//   Industry:  "No evidence-backed candidates match the current filters."
//   Academia:  "No current alignment gaps require attention."
//   Institution: "No intervention has been created for the selected gap."
// ============================================================
export function SsEmptyState({
  icon: Icon,
  title,
  hint,
  tone = "neutral",
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  tone?: "industry" | "academia" | "institution" | "neutral";
  className?: string;
}) {
  const toneColor = {
    industry: "text-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]",
    academia: "text-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]",
    institution: "text-[var(--ss-navy-800)] bg-[var(--ss-surface-3)]",
    neutral: "text-[var(--ss-muted)] bg-[var(--ss-surface-2)]",
  }[tone];
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--ss-border)] px-6 py-10 text-center", className)}>
      {Icon && (
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", toneColor)}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-semibold text-[var(--ss-ink-soft)]">{title}</p>
      {hint && <p className="text-xs text-[var(--ss-muted)]">{hint}</p>}
    </div>
  );
}

// ============================================================
// SsLoadingState — Phase 9 §77 spec-exact loading messages per portal
//   Industry:   "Loading talent..." / "Calculating candidate match..." / "Loading evidence..."
//   Academia:   "Loading industry signals..." / "Calculating alignment..." / "Finding mentors..."
//   Institution: "Aggregating skills..." / "Calculating demand/supply..." / "Preparing intervention insights..."
// ============================================================
export function SsLoadingState({
  message,
  tone = "neutral",
  className,
}: {
  message: string;
  tone?: "industry" | "academia" | "institution" | "neutral";
  className?: string;
}) {
  const spinnerColor = {
    industry: "border-t-[var(--ss-orange-600)]",
    academia: "border-t-[var(--ss-blue-600)]",
    institution: "border-t-[var(--ss-navy-800)]",
    neutral: "border-t-[var(--ss-muted)]",
  }[tone];
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--ss-border)] bg-white px-6 py-8 text-center", className)}>
      <div className={cn("h-5 w-5 animate-spin rounded-full border-2 border-[var(--ss-border)]", spinnerColor)} />
      <p className="text-xs font-medium text-[var(--ss-muted)]">{message}</p>
    </div>
  );
}

// ============================================================
// SsErrorState — Phase 9 §78 spec error-state handling
//   No data / Unauthorized / Invalid filter / Calculation failure
//   Missing curriculum mapping / Missing opportunity data / Invalid department
// ============================================================
export function SsErrorState({
  variant = "no-data",
  title,
  detail,
  className,
}: {
  variant?: "no-data" | "unauthorized" | "invalid-filter" | "calc-failure" | "missing-curriculum" | "missing-opportunity" | "invalid-department" | "generic";
  title?: string;
  detail?: string;
  className?: string;
}) {
  const map = {
    "no-data":              { icon: AlertCircle,  tone: "text-[var(--ss-muted)]",         defaultTitle: "No data available",          defaultDetail: "There is no platform data to display here yet." },
    "unauthorized":         { icon: AlertTriangle, tone: "text-red-600",                   defaultTitle: "Unauthorized",              defaultDetail: "You do not have access to view this information." },
    "invalid-filter":      { icon: AlertCircle,  tone: "text-[var(--ss-orange-600)]",     defaultTitle: "Invalid filter",            defaultDetail: "One or more selected filters are invalid. Adjust and retry." },
    "calc-failure":        { icon: AlertTriangle, tone: "text-red-600",                   defaultTitle: "Calculation failure",       defaultDetail: "An intelligence calculation could not be completed. Refresh to retry." },
    "missing-curriculum":   { icon: AlertCircle,  tone: "text-[var(--ss-blue-600)]",      defaultTitle: "Missing curriculum mapping", defaultDetail: "No curriculum coverage data exists for this skill yet." },
    "missing-opportunity":  { icon: AlertCircle,  tone: "text-[var(--ss-orange-600)]",     defaultTitle: "Missing opportunity data",   defaultDetail: "The selected opportunity could not be found in platform records." },
    "invalid-department":   { icon: AlertCircle,  tone: "text-[var(--ss-orange-600)]",     defaultTitle: "Invalid department",        defaultDetail: "The selected department does not match any institutional records." },
    "generic":             { icon: Info,           tone: "text-[var(--ss-muted)]",         defaultTitle: "Something went wrong",      defaultDetail: "An unexpected issue occurred. Please retry." },
  } as const;
  const m = map[variant];
  const Icon = m.icon;
  return (
    <div className={cn("flex flex-col items-start gap-2 rounded-lg border border-red-100 bg-red-50/50 px-4 py-3", className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", m.tone)} />
        <p className="text-sm font-semibold text-[var(--ss-ink)]">{title ?? m.defaultTitle}</p>
      </div>
      <p className="text-xs text-[var(--ss-muted)]">{detail ?? m.defaultDetail}</p>
    </div>
  );
}

export type { VariantProps };
