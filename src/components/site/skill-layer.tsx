"use client";

import { motion } from "framer-motion";
import { GraduationCap, Factory, BookOpen, Building2, MoreHorizontal } from "lucide-react";
import { PORTALS, PORTAL_BY_KEY } from "./theme";

/**
 * Skill Intelligence Layer card — overlaps the hero, mimics a "software mockup"
 * window with a header bar (status dot + title + ellipsis) and a central network
 * diagram: a dark central "SKILL SETU INTELLIGENCE" node with the four portal
 * satellites arranged around it, connected by animated dashed lines.
 */
export function SkillLayerCard() {
  // Satellite positions (percent of diagram area)
  const satellites = [
    { ...PORTAL_BY_KEY.student, pos: "top-[8%] left-[8%]" },
    { ...PORTAL_BY_KEY.industry, pos: "top-[8%] right-[8%]" },
    { ...PORTAL_BY_KEY.academia, pos: "bottom-[8%] left-[8%]" },
    { ...PORTAL_BY_KEY.institution, pos: "bottom-[8%] right-[8%]" },
  ];

  const IconFor = ({ icon }: { icon: (typeof PORTALS)[number]["icon"] }) => {
    const cls = "h-4 w-4";
    switch (icon) {
      case "graduationCap":
        return <GraduationCap className={cls} />;
      case "factory":
        return <Factory className={cls} />;
      case "bookOpen":
        return <BookOpen className={cls} />;
      case "building2":
        return <Building2 className={cls} />;
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative z-10 mx-auto -mt-24 w-full max-w-5xl px-4 sm:-mt-32 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)]"
      >
        {/* Card title bar (mock software window) */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="pulse-ring absolute inset-0 rounded-full text-teal-500" />
              <span className="h-2 w-2 rounded-full bg-teal-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700">
              Skill Intelligence Layer
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:inline">
              SKILL SETU · INTELLIGENCE
            </span>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Diagram region */}
        <div className="bg-dot-grid relative aspect-[16/10] w-full bg-white px-6 py-10 sm:aspect-[16/9] sm:px-10">
          {/* Decorative concentric rings */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70" />

          {/* SVG connectors (behind nodes) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 62"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* center to each corner-ish satellite */}
            <line x1="50" y1="31" x2="14" y2="9"  stroke="#E2E8F0" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="86" y2="9"  stroke="#E2E8F0" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="14" y2="53" stroke="#E2E8F0" strokeWidth="0.4" className="dash-flow" />
            <line x1="50" y1="31" x2="86" y2="53" stroke="#E2E8F0" strokeWidth="0.4" className="dash-flow" />
          </svg>

          {/* Central intelligence node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* conic glow behind */}
              <div className="glow-conic absolute -inset-6 rounded-full opacity-60 blur-md" />
              <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-900 text-center text-white shadow-xl ring-1 ring-black/10 sm:h-32 sm:w-32">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-teal-300">
                  Skill Setu
                </span>
                <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs">
                  Intelligence
                </span>
                <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-white/50">
                  Evidence · Skills · Match
                </span>
              </div>
            </div>
          </div>

          {/* Satellites */}
          {satellites.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              className={`float-y absolute ${s.pos} flex flex-col items-center gap-1.5`}
              style={{ animationDelay: `${i * 0.7}s` }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border shadow-sm sm:h-16 sm:w-16"
                style={{
                  backgroundColor: s.tint,
                  borderColor: s.borderTint,
                  color: s.accent,
                }}
              >
                <IconFor icon={s.icon} />
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                style={{ color: s.accent }}
              >
                {s.short}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom strip — process flow */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/80 bg-white px-5 py-4 text-[11px] font-medium text-slate-500 sm:text-xs">
          {["Skills", "Evidence", "Intelligence", "Opportunity", "Feedback", "Growth"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{step}</span>
                {i < arr.length - 1 && (
                  <span className="text-slate-300">→</span>
                )}
              </span>
            ),
          )}
        </div>
      </motion.div>

      {/* One ecosystem caption */}
      <p className="mt-6 text-center text-sm text-slate-500">
        One platform. Four portals. One connected ecosystem.
      </p>
    </section>
  );
}
