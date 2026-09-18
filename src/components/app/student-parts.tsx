"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check, Info, AlertTriangle, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SsBadge, SsStat } from "@/components/ui/ss";
import { ROLES, type EvidenceRow, type Verification, type AppStatus } from "@/lib/student-data";
import { useStudentState } from "@/lib/student-state";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";

// ─── Page header ────────────────────────────────────────────────
export function DashHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "#0F2547",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--ss-border)] pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: accent + "18", color: accent }}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold text-[var(--ss-ink)] sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--ss-muted)]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Demo / status badges (spec §42) ────────────────────────────
export function DemoBadge({ children = "DEMO DATA", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]", className)}>
      <Info className="h-2.5 w-2.5" />
      {children}
    </span>
  );
}

export function CalcBadge({ children = "Calculated", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded bg-[var(--ss-blue-50)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ss-blue-600)]", className)}>
      {children}
    </span>
  );
}

export function MatchBadge({ score, className }: { score: number; className?: string }) {
  const color = score >= 80 ? "#0D9488" : score >= 60 ? "#2563EB" : "#EA580C";
  const tint = score >= 80 ? "#CCFBF1" : score >= 60 ? "#DBEAFE" : "#FED7AA";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", className)} style={{ backgroundColor: tint, color }}>
      {score}% match
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const map = { High: ["#FEE2E2", "#BE123C"], Medium: ["#FEF3C7", "#B45309"], Low: ["#DCFCE7", "#15803D"] };
  const [bg, fg] = map[priority];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: bg, color: fg }}>
      {priority === "High" && <AlertTriangle className="h-2.5 w-2.5" />}
      {priority} priority
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: "High" | "Moderate" | "Limited" | "None" }) {
  const map: Record<string, [string, string]> = {
    High: ["#CCFBF1", "#0D9488"],
    Moderate: ["#DBEAFE", "#2563EB"],
    Limited: ["#FED7AA", "#EA580C"],
    None: ["#F1F5F9", "#64748B"],
  };
  const [bg, fg] = map[level];
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: bg, color: fg }}>
      {level}
    </span>
  );
}

export function EvidenceStatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    "Submitted": ["#F1F5F9", "#475569"],
    "Pending Evaluation": ["#FEF3C7", "#B45309"],
    "Evaluated": ["#DBEAFE", "#2563EB"],
    "Verified": ["#CCFBF1", "#0D9488"],
  };
  const [bg, fg] = map[status] ?? ["#F1F5F9", "#475569"];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: bg, color: fg }}>
      {status === "Verified" && <Check className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}

export function VerificationBadge({ v }: { v: Verification }) {
  if (v === "Verified")
    return <SsBadge tone="teal" className="text-[10px]"><Check className="h-2.5 w-2.5" /> Verified</SsBadge>;
  return <SsBadge tone="orange" className="text-[10px]">Pending</SsBadge>;
}

// ─── Empty state (spec §38) ─────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--ss-border)] bg-[var(--ss-surface-2)]/60 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
        <Icon className="h-5 w-5 text-[var(--ss-faint)]" />
      </span>
      <p className="mt-3 text-sm font-semibold text-[var(--ss-ink-soft)]">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-[var(--ss-muted)]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Modal (centered, motion) ──────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const widthClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1628]/55 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn("relative w-full overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop", widthClass)}
          >
            {title && (
              <div className="flex items-start justify-between gap-3 border-b border-[var(--ss-border)] px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--ss-ink)]">{title}</h3>
                  {subtitle && <p className="mt-0.5 text-xs text-[var(--ss-muted)]">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto scroll-slim px-5 py-4">{children}</div>
            {footer && <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Drawer (right slide-in, motion) ────────────────────────────
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-end bg-[#0a1628]/55 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col border-l border-[var(--ss-border)] bg-white shadow-pop"
          >
            {title && (
              <div className="flex items-start justify-between gap-3 border-b border-[var(--ss-border)] px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--ss-ink)]">{title}</h3>
                  {subtitle && <p className="mt-0.5 text-xs text-[var(--ss-muted)]">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Evidence drawer (spec §15) ─────────────────────────────────
export function EvidenceDetailDrawer({ evidence, open, onClose }: { evidence: EvidenceRow | null; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Evidence Details" subtitle={evidence?.source}>
      {evidence && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <EvidenceStatusBadge status={evidence.status} />
            <VerificationBadge v={evidence.verification} />
            <DemoBadge />
          </div>
          <Field label="Skill" value={evidence.skill} />
          <Field label="Source" value={evidence.source} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" value={evidence.date} />
            <Field label="Time" value={evidence.time} />
          </div>
          {evidence.score !== null && <Field label="Score" value={`${evidence.score} / 100`} />}
          <Field label="Status" value={evidence.status} />
          <Field label="Verification" value={evidence.verification} />
          <Field label="Description" value={evidence.description} />
          {evidence.reference && <Field label="Reference" value={evidence.reference} />}
          <div className="rounded-lg border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] p-3 text-[11px] leading-relaxed text-[var(--ss-muted)]">
            <Info className="mr-1 inline h-3 w-3" />
            Submitted evidence is <b>not</b> automatically verified. Verification requires a faculty/industry review step.
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ─── Role selector (spec §8, §24) ───────────────────────────────
export function RoleSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentRole, setRole } = useStudentState();
  const { navigate } = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Select Target Role" subtitle="Drives your role readiness & gap analysis (frontend config)" size="lg">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {ROLES.map((r) => {
          const active = r.name === currentRole;
          return (
            <button
              key={r.name}
              onClick={() => { setRole(r.name); onClose(); }}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                active ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-50)] ring-1 ring-[var(--ss-blue-600)]/30" : "border-[var(--ss-border)] hover:border-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]",
              )}
            >
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", active ? "border-[var(--ss-blue-600)] bg-[var(--ss-blue-600)] text-white" : "border-[var(--ss-line)]")}>
                {active && <Check className="h-3 w-3" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--ss-ink)]">{r.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-[var(--ss-muted)]">{r.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.keySkills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-[var(--ss-surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ss-muted)]">{s}</span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-[var(--ss-muted)]">
        For this phase, changing the role updates the displayed configuration only. The full calculation backend arrives in a later phase.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="navy" onClick={() => { onClose(); navigate("/app/dashboard"); }}>Apply</Button>
      </div>
    </Modal>
  );
}

// ─── Application timeline (spec §17) ───────────────────────────
export function ApplicationTimeline({ timeline, current }: { timeline: AppStatus[]; current: AppStatus }) {
  const currentIndex = timeline.indexOf(current);
  return (
    <div className="flex items-center gap-1.5">
      {timeline.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              active ? "bg-[var(--ss-blue-600)] text-white" : done ? "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]" : "bg-[var(--ss-surface-3)] text-[var(--ss-faint)]",
            )}>
              {(done || active) && <Check className="h-2.5 w-2.5" />}
              {step}
            </div>
            {i < timeline.length - 1 && <ChevronRight className="h-3 w-3 text-[var(--ss-faint)]" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field (label + value) ─────────────────────────────────────
export function Field({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ss-faint)]">{label}</p>
      <p className="mt-0.5 text-sm text-[var(--ss-ink)]">{value ?? children}</p>
    </div>
  );
}

export { SsStat };
