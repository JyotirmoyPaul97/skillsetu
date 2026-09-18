"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Factory, BookOpen, Building2, Cpu, ArrowRight,
} from "lucide-react";
import { PORTALS, type PortalTheme } from "./theme";
import { SsCard, SsBadge } from "@/components/ui/ss";

const SATELLITES: { theme: PortalTheme; pos: string; delay: number }[] = [
  { theme: PORTALS[0], pos: "top-[10%] left-[8%]", delay: 0.15 },   // Student (teal)
  { theme: PORTALS[1], pos: "top-[10%] right-[8%]", delay: 0.23 },  // Industry (orange)
  { theme: PORTALS[2], pos: "bottom-[10%] left-[8%]", delay: 0.31 },// Academia (blue)
  { theme: PORTALS[3], pos: "bottom-[10%] right-[8%]", delay: 0.39 },// Institution (navy)
];

const ICON = { student: GraduationCap, industry: Factory, academia: BookOpen, institution: Building2 } as const;

export function SkillLayerCard() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 mx-auto -mt-24 w-full max-w-5xl px-4 pb-4 sm:-mt-28 sm:px-6 lg:px-8"
    >
      {/* Section heading band */}
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ss-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-ink-soft)] shadow-xs">
          <Cpu className="h-3.5 w-3.5 text-[var(--ss-blue-600)]" />
          Skill Intelligence Layer
        </span>
        <p className="mt-3 text-sm text-[var(--ss-muted)] sm:text-base">
          One platform. Four portals. One connected ecosystem.
        </p>
      </div>

      {/* The mock "engine" card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop"
      >
        {/* Mock-window header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="pulse-ring absolute inset-0 rounded-full text-[var(--ss-teal-600)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--ss-teal-600)]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ss-ink-soft)]">
              Skill Intelligence Engine
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ss-faint)] sm:inline">
              Evidence · Skills · Match
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ss-faint)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ss-faint)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ss-faint)]" />
          </div>
        </div>

        {/* Diagram region */}
        <div className="bg-dot-grid relative aspect-[16/10] w-full bg-white px-6 py-8 sm:aspect-[16/9] sm:px-10 sm:py-10">
          {/* Decorative concentric rings */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--ss-border)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--ss-border)]" />

          {/* SVG connectors */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 62"
            preserveAspectRatio="none"
            fill="none"
          >
            <line x1="50" y1="31" x2="16" y2="10" stroke="#CBD5E1" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="84" y2="10" stroke="#CBD5E1" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="16" y2="52" stroke="#CBD5E1" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="84" y2="52" stroke="#CBD5E1" strokeWidth="0.4" className="dash-flow" />
          </svg>

          {/* Central SKILL SETU INTELLIGENCE ENGINE node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="glow-conic absolute -inset-7 rounded-full opacity-70 blur-md" />
              <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] text-center text-white shadow-pop ring-1 ring-black/10 sm:h-32 sm:w-32">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#5eead4]">Skill Setu</span>
                <span className="mt-0.5 text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] sm:text-[11px]">
                  Intelligence
                  <br />Engine
                </span>
                <span className="mt-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-white/55">
                  Evidence · Skills · Match
                </span>
              </div>
            </div>
          </div>

          {/* Satellites */}
          {SATELLITES.map(({ theme, pos, delay }) => {
            const Icon = ICON[theme.key];
            return (
              <motion.div
                key={theme.key}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay }}
                className={`float-y absolute ${pos} flex flex-col items-center gap-1.5`}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border shadow-soft sm:h-16 sm:w-16"
                  style={{ backgroundColor: theme.tint, borderColor: theme.borderTint, color: theme.accent }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                  style={{ color: theme.accent }}
                >
                  {theme.short}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom flow strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--ss-border)] bg-white px-5 py-4 text-[11px] font-medium text-[var(--ss-muted)] sm:text-xs">
          {["Skills", "Evidence", "Intelligence", "Opportunity", "Feedback", "Growth"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="font-semibold text-[var(--ss-ink-soft)]">{step}</span>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--ss-faint)]" />}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Portals legend chips */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {PORTALS.map((p) => (
          <SsBadge
            key={p.key}
            tone={p.key as any}
            className="text-[11px]"
          >
            {p.short}
          </SsBadge>
        ))}
        <SsBadge tone="neutral" className="text-[11px]">
          4 portals · 1 ecosystem
        </SsBadge>
      </div>
    </section>
  );
}
