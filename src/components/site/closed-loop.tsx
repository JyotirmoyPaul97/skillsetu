"use client";

import { motion } from "framer-motion";
import {
  User, FileCheck2, Cpu, Briefcase, RefreshCw, BadgeCheck, BarChart3, Repeat, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SsEyebrow, SsSectionHeading } from "@/components/ui/ss";

interface LoopNode {
  label: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
}

// The closed loop: Student → Evidence → Skill Intelligence → Industry Opportunity
// → Feedback → Skill Passport → Institutional Insight → (back to Student)
const LOOP: LoopNode[] = [
  { label: "Student",            icon: User,        accent: "#0D9488", tint: "#CCFBF1" },
  { label: "Evidence",           icon: FileCheck2,  accent: "#2563EB", tint: "#DBEAFE" },
  { label: "Skill Intelligence", icon: Cpu,         accent: "#0F2547", tint: "#DBE7F5" },
  { label: "Industry Opportunity",icon: Briefcase,  accent: "#EA580C", tint: "#FED7AA" },
  { label: "Feedback",           icon: RefreshCw,   accent: "#0D9488", tint: "#CCFBF1" },
  { label: "Skill Passport",     icon: BadgeCheck,  accent: "#2563EB", tint: "#DBEAFE" },
  { label: "Institutional Insight", icon: BarChart3, accent: "#0F2547", tint: "#DBE7F5" },
];

export function ClosedLoop() {
  return (
    <section className="bg-[var(--ss-surface-2)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SsEyebrow icon={Repeat} tone="navy">The Closed Loop</SsEyebrow>
          <SsSectionHeading className="mt-5">
            Connected by{" "}
            <span className="text-gradient-nbt">Evidence.</span>
          </SsSectionHeading>
          <p className="mt-4 text-base text-[var(--ss-muted)] sm:text-lg">
            All four portals share one ecosystem—skills flow continuously from
            demonstration to intelligence to opportunity and back.
          </p>
        </div>

        {/* Loop visualization */}
        <div className="mt-12">
          {/* Desktop: horizontal row with curved return arrow */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="flex items-center justify-center gap-1.5">
                {LOOP.map((n, i) => (
                  <div key={n.label} className="flex items-center gap-1.5">
                    <LoopPill node={n} idx={i} />
                    {i < LOOP.length - 1 && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ss-faint)]" />
                    )}
                  </div>
                ))}
              </div>

              {/* Curved return arrow: last node → back to Student */}
              <svg
                className="pointer-events-none mx-auto mt-2 h-14 w-full max-w-4xl"
                viewBox="0 0 800 56"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M760 4 C 760 40, 600 52, 400 52 C 200 52, 40 40, 40 4"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 8"
                  className="dash-flow"
                />
                <path d="M34 10 L40 4 L46 10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>

              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ss-faint)]">
                <Repeat className="mr-1 inline h-3 w-3" />
                Loops back to Student
              </p>
            </div>
          </div>

          {/* Mobile: vertical stack with down-arrows + loop label */}
          <div className="md:hidden">
            <div className="flex flex-col items-center gap-2">
              {LOOP.map((n, i) => (
                <div key={n.label} className="flex flex-col items-center gap-2">
                  <LoopPill node={n} idx={i} />
                  {i < LOOP.length - 1 && (
                    <ArrowRight className="h-4 w-4 rotate-90 text-[var(--ss-faint)]" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ss-faint)]">
              <Repeat className="mr-1 inline h-3 w-3" />
              Loops back to Student
            </p>
          </div>
        </div>

        {/* Secondary statement */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-[var(--ss-muted)] sm:text-base">
          Every action in one portal strengthens the intelligence that powers the
          others—creating a continuously improving skill ecosystem.
        </p>
      </div>
    </section>
  );
}

function LoopPill({ node, idx }: { node: LoopNode; idx: number }) {
  const Icon = node.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
      className="flex items-center gap-2.5 rounded-full border border-[var(--ss-border)] bg-white px-3.5 py-2 shadow-soft"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: node.accent }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-semibold text-[var(--ss-ink)] sm:text-sm">
        {node.label}
      </span>
    </motion.div>
  );
}
