"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ============================================================
   SKILL SETU design-system primitives
   Premium SaaS · rounded cards · soft shadows · navy/blue/teal/orange
   ============================================================ */

// ─── Card ────────────────────────────────────────────────────────
const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      tone: {
        flat: "border-[var(--ss-border)]",
        soft: "border-[var(--ss-border)] shadow-soft",
        lift: "border-[var(--ss-border)] shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        pop: "border-[var(--ss-border)] shadow-pop",
      },
    },
    defaultVariants: { tone: "soft" },
  },
);

function SsCard({
  className,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ tone }), className)} {...props} />;
}

// ─── Badge / Pill ────────────────────────────────────────────────
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        navy:    "bg-[var(--ss-navy-900)] text-white",
        blue:    "bg-[var(--ss-blue-50)] text-[var(--ss-blue-600)]",
        teal:    "bg-[var(--ss-teal-50)] text-[var(--ss-teal-600)]",
        orange:  "bg-[var(--ss-orange-50)] text-[var(--ss-orange-600)]",
        neutral: "bg-[var(--ss-surface-3)] text-[var(--ss-muted)]",
        outline: "border border-[var(--ss-border)] bg-white text-[var(--ss-ink-soft)]",
        student:     "bg-[var(--ss-portal-student-tint)] text-[var(--ss-portal-student)]",
        industry:    "bg-[var(--ss-portal-industry-tint)] text-[var(--ss-portal-industry)]",
        academia:    "bg-[var(--ss-portal-academia-tint)] text-[var(--ss-portal-academia)]",
        institution: "bg-[var(--ss-portal-institution-tint)] text-[var(--ss-portal-institution)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

function SsBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

// ─── Eyebrow (small uppercase label above headings) ─────────────
function SsEyebrow({
  children,
  className,
  icon: Icon,
  tone = "blue",
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "teal" | "orange" | "navy" | "neutral";
}) {
  const colorMap: Record<string, string> = {
    blue: "text-[var(--ss-blue-600)]",
    teal: "text-[var(--ss-teal-600)]",
    orange: "text-[var(--ss-orange-600)]",
    navy: "text-[var(--ss-navy-800)]",
    neutral: "text-[var(--ss-muted)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--ss-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ss-ink-soft)] shadow-xs",
        className,
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5", colorMap[tone])} />}
      {children}
    </span>
  );
}

// ─── Section heading ────────────────────────────────────────────
function SsSectionHeading({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <h2
      className={cn(
        "font-extrabold tracking-tight text-[var(--ss-ink)]",
        size === "lg" && "text-3xl sm:text-4xl md:text-5xl leading-[1.08]",
        size === "md" && "text-2xl sm:text-3xl md:text-4xl leading-[1.1]",
        size === "sm" && "text-xl sm:text-2xl leading-tight",
        className,
      )}
    >
      {children}
    </h2>
  );
}

// ─── Section wrapper (consistent vertical rhythm) ───────────────
function SsSection({
  children,
  className,
  id,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "light" | "tint" | "navy";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        tone === "light" && "bg-white",
        tone === "tint" && "bg-[var(--ss-surface-2)]",
        tone === "navy" && "bg-navy-gradient text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ─── Stat tile (KPI) ────────────────────────────────────────────
function SsStat({
  label,
  value,
  sub,
  icon: Icon,
  tone = "navy",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "navy" | "blue" | "teal" | "orange";
}) {
  const colorMap: Record<string, { bg: string; fg: string }> = {
    navy:   { bg: "var(--ss-surface-3)", fg: "var(--ss-navy-900)" },
    blue:   { bg: "var(--ss-blue-50)",  fg: "var(--ss-blue-600)" },
    teal:   { bg: "var(--ss-teal-50)",  fg: "var(--ss-teal-600)" },
    orange: { bg: "var(--ss-orange-50)",fg: "var(--ss-orange-600)" },
  };
  const c = colorMap[tone];
  return (
    <div className="rounded-xl border border-[var(--ss-border)] bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-muted)]">
          {label}
        </span>
        {Icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: c.bg, color: c.fg }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--ss-ink)]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--ss-muted)]">{sub}</p>}
    </div>
  );
}

// ─── Skill bar (progress with optional target marker) ───────────
function SsSkillBar({
  label,
  level,
  target,
  accent = "var(--ss-teal-600)",
  right,
}: {
  label: string;
  level: number;
  target?: number;
  accent?: string;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--ss-ink-soft)]">{label}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--ss-muted)]">
          {right}
          <span className="font-semibold" style={{ color: accent }}>{level}</span>
          {target !== undefined && <span>/ {target}</span>}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--ss-surface-3)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, level)}%`, backgroundColor: accent }}
        />
        {target !== undefined && (
          <span
            className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--ss-faint)]"
            style={{ left: `${Math.min(100, target)}%` }}
          />
        )}
      </div>
    </div>
  );
}

export {
  SsCard, cardVariants,
  SsBadge, badgeVariants,
  SsEyebrow,
  SsSectionHeading,
  SsSection,
  SsStat,
  SsSkillBar,
};
