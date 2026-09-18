"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Section header used at the top of each dashboard tab
export function DashHeader({
  title,
  subtitle,
  icon: Icon,
  accent,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: (accent ?? "#0D9488") + "22", color: accent ?? "#0D9488" }}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Stat card
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "#0D9488",
  tint = "#CCFBF1",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: string;
  tint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>
        {Icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: tint, color: accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// Skill level bar (0-100)
export function SkillBar({
  label,
  level,
  target,
  accent = "#0D9488",
  showTarget = true,
  right,
}: {
  label: string;
  level: number;
  target?: number;
  accent?: string;
  showTarget?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          {right}
          <span className="font-semibold" style={{ color: accent }}>
            {level}
          </span>
          {target !== undefined && showTarget && <span>/ {target}</span>}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.min(100, level)}%`, backgroundColor: accent }}
        />
        {target !== undefined && showTarget && (
          <span
            className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-slate-400"
            style={{ left: `${Math.min(100, target)}%` }}
          />
        )}
      </div>
    </div>
  );
}

// Pill / tag
export function Pill({
  children,
  accent = "#0D9488",
  tint = "#CCFBF1",
  className,
}: {
  children: React.ReactNode;
  accent?: string;
  tint?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium", className)}
      style={{ backgroundColor: tint, color: accent }}
    >
      {children}
    </span>
  );
}

// Match score badge (0-100)
export function MatchBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#0D9488" : score >= 50 ? "#B45309" : "#BE123C";
  const tint = score >= 75 ? "#CCFBF1" : score >= 50 ? "#FEF3C7" : "#FFE4E6";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ backgroundColor: tint, color }}
    >
      {score}% match
    </span>
  );
}

// Card wrapper
export function DashCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <Icon className="h-6 w-6 text-slate-300" />
      <p className="mt-2 text-sm font-medium text-slate-500">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// Verified badge
export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified)
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
        self
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
      verified
    </span>
  );
}
