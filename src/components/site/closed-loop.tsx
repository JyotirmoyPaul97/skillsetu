"use client";

import { motion } from "framer-motion";
import {
  User,
  FileCheck2,
  Brain,
  Briefcase,
  RefreshCw,
  BadgeCheck,
  LineChart,
  ArrowRight,
  Repeat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FlowNode {
  label: string;
  icon: LucideIcon;
  accent?: string; // optional per-node accent override
}

const TOP_ROW: FlowNode[] = [
  { label: "Student", icon: User, accent: "#0D9488" },
  { label: "Evidence", icon: FileCheck2, accent: "#0EA5E9" },
  { label: "Skill Intelligence", icon: Brain, accent: "#6D28D9" },
  { label: "Industry Opportunity", icon: Briefcase, accent: "#B45309" },
  { label: "Feedback", icon: RefreshCw, accent: "#BE123C" },
];

const BOTTOM_ROW: FlowNode[] = [
  { label: "Skill Passport", icon: BadgeCheck, accent: "#0D9488" },
  { label: "Institutional Insight", icon: LineChart, accent: "#6D28D9" },
];

function NodePill({ node, idx }: { node: FlowNode; idx: number }) {
  const Icon = node.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
      className="relative z-10 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: node.accent ?? "#0F172A" }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-semibold text-slate-800 sm:text-sm">
        {node.label}
      </span>
    </motion.div>
  );
}

export function ClosedLoop() {
  return (
    <section className="bg-slate-50/70 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            <Repeat className="h-3.5 w-3.5 text-violet-600" />
            The Closed Loop
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Connected by{" "}
            <span className="text-gradient-it">Evidence.</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            All four portals share one ecosystem—skills flow continuously from
            demonstration to intelligence to opportunity and back.
          </p>
        </div>

        {/* Top flow row */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-2">
          {TOP_ROW.map((n, i) => (
            <div key={n.label} className="flex items-center gap-2 sm:gap-2">
              <NodePill node={n} idx={i} />
              {i < TOP_ROW.length - 1 && (
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Branch lines (decorative) */}
        <div className="relative mx-auto mt-8 hidden h-12 w-full max-w-3xl items-start justify-center sm:flex">
          <svg
            className="h-full w-full"
            viewBox="0 0 600 48"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* from "Skill Intelligence" (centre-top) down to a hub, then split to bottom pills */}
            <path
              d="M300 0 L300 24"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <path
              d="M300 24 L150 48"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              className="dash-flow"
            />
            <path
              d="M300 24 L450 48"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              className="dash-flow"
            />
          </svg>
        </div>

        {/* Bottom secondary row */}
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          {BOTTOM_ROW.map((n, i) => (
            <NodePill key={n.label} node={n} idx={i + 5} />
          ))}
        </div>

        {/* Caption */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
          Every action in one portal strengthens the intelligence that powers the
          others—creating a continuously improving skill ecosystem.
        </p>
      </div>
    </section>
  );
}
