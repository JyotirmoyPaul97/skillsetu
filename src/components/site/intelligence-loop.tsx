"use client";

/**
 * SKILL SETU — Phase 11 §92 Final Visual Summary.
 *
 * The complete 11-node SKILL SETU intelligence loop, displayed prominently
 * on the landing page. Reinforces the core product principle:
 *   "EVIDENCE, NOT CLAIMS."
 *
 * Final message (§92):
 *   "SKILL SETU does not just connect people.
 *    It creates the intelligence layer that makes those connections meaningful."
 */

import { motion } from "framer-motion";
import {
  Briefcase, FileCheck2, Cpu, Gauge, AlertTriangle, Compass,
  Target, FilePlus, MessageSquare, BadgeCheck, BarChart3, Repeat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SsEyebrow, SsSectionHeading } from "@/components/ui/ss";

interface LoopNode {
  label: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
}

// The complete 11-node intelligence loop per §92
const LOOP: LoopNode[] = [
  { label: "Industry Demand",        icon: Briefcase,      accent: "#EA580C", tint: "#FED7AA" },
  { label: "Student Evidence",       icon: FileCheck2,     accent: "#0D9488", tint: "#CCFBF1" },
  { label: "Skill Intelligence",     icon: Cpu,            accent: "#0F2547", tint: "#DBE7F5" },
  { label: "Role Readiness",         icon: Gauge,          accent: "#2563EB", tint: "#DBEAFE" },
  { label: "Skill Gap",              icon: AlertTriangle, accent: "#EA580C", tint: "#FED7AA" },
  { label: "Next Best Action",       icon: Compass,        accent: "#0D9488", tint: "#CCFBF1" },
  { label: "Opportunity",            icon: Target,         accent: "#EA580C", tint: "#FED7AA" },
  { label: "New Evidence",           icon: FilePlus,       accent: "#0D9488", tint: "#CCFBF1" },
  { label: "Feedback",               icon: MessageSquare,  accent: "#2563EB", tint: "#DBEAFE" },
  { label: "Skill Passport",         icon: BadgeCheck,     accent: "#0F2547", tint: "#DBE7F5" },
  { label: "Academia + Institution", icon: BarChart3,      accent: "#0F2547", tint: "#DBE7F5" },
];

export function IntelligenceLoop() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--ss-navy-950)] via-[var(--ss-navy-900)] to-[var(--ss-navy-950)] py-20 text-white sm:py-28">
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SsEyebrow icon={Repeat} tone="navy" className="border-white/15 bg-white/5 text-white/80">
            §92 · The Complete Intelligence Loop
          </SsEyebrow>
          <SsSectionHeading className="mt-5 text-white" size="md">
            From Demand to Evidence to{" "}
            <span className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">
              Continuous Growth
            </span>
            .
          </SsSectionHeading>
          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            Eleven connected stages. One shared intelligence layer. Every action in any portal
            strengthens the evidence that powers the others — turning skill claims into verified,
            opportunity-creating skill intelligence.
          </p>
        </div>

        {/* Loop visualization — 11 nodes */}
        <div className="mt-12">
          {/* Desktop: wraps 2 rows of pills with continuous flow */}
          <div className="hidden md:block">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {LOOP.map((n, i) => (
                <div key={n.label} className="flex items-center gap-1.5">
                  <LoopPill node={n} idx={i} />
                  {i < LOOP.length - 1 && (
                    <span className="text-white/40">↓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="md:hidden">
            <div className="flex flex-col items-center gap-2">
              {LOOP.map((n, i) => (
                <div key={n.label} className="flex flex-col items-center gap-2">
                  <LoopPill node={n} idx={i} />
                  {i < LOOP.length - 1 && (
                    <span className="text-white/40">↓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continuous growth indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 rounded-full border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-4 py-2"
        >
          <Repeat className="h-4 w-4 text-[#14B8A6]" />
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#14B8A6]">
            Continuous Growth
          </span>
        </motion.div>

        {/* Final statement (§92) */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-12 max-w-3xl border-l-2 border-[#14B8A6] pl-6 text-center sm:text-left"
        >
          <p className="text-lg font-bold leading-snug text-white sm:text-xl">
            "SKILL SETU does not just connect people.
            <br className="hidden sm:block" />
            <span className="text-[#14B8A6]">
              It creates the intelligence layer that makes those connections meaningful.
            </span>
            "
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/50">
            — Phase 11 Master Production Build · SIH 2026
          </p>
        </motion.blockquote>

        {/* Architecture proof points */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "ONE PRODUCT", value: "4 portals" },
            { label: "ONE DATABASE", value: "SQLite + Prisma" },
            { label: "ONE ENGINE", value: "Skill Intelligence" },
            { label: "ONE SOURCE OF TRUTH", value: "Evidence" },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                {p.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{p.value}</p>
            </div>
          ))}
        </div>
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
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: node.accent }}
      >
        <Icon className="h-3 w-3" />
      </span>
      <span className="text-xs font-semibold text-white sm:text-sm">
        {node.label}
      </span>
    </motion.div>
  );
}
