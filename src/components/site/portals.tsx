"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Factory,
  BookOpen,
  Building2,
  ArrowRight,
  Layers,
} from "lucide-react";
import { PORTALS, type PortalTheme } from "./theme";
import { cn } from "@/lib/utils";

function PortalIcon({ theme }: { theme: PortalTheme }) {
  const cls = "h-6 w-6";
  switch (theme.icon) {
    case "graduationCap":
      return <GraduationCap className={cls} />;
    case "factory":
      return <Factory className={cls} />;
    case "bookOpen":
      return <BookOpen className={cls} />;
    case "building2":
      return <Building2 className={cls} />;
  }
}

function PortalCard({ theme, idx }: { theme: PortalTheme; idx: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.22)]"
    >
      {/* Top: index + icon */}
      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: theme.tint,
            color: theme.accent,
            border: `1px solid ${theme.borderTint}`,
          }}
        >
          <PortalIcon theme={theme} />
        </span>
        <span className="text-xs font-light tracking-[0.2em] text-slate-300">
          {theme.index}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="mt-5 text-lg font-bold text-slate-900">{theme.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {theme.description}
      </p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {theme.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: theme.tint,
              color: theme.accent,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Enter link */}
      <div className="mt-6 flex-1" />
      <Link
        href={`#portal-${theme.key}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: theme.accent }}
      >
        Enter {theme.short} Portal
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Bottom accent bar */}
      <span
        className="absolute inset-x-6 bottom-0 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: theme.accent }}
      />
    </motion.article>
  );
}

export function Portals() {
  return (
    <section
      id="portals"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      {/* Heading block */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          <Layers className="h-3.5 w-3.5 text-teal-600" />
          Four Portals · One Ecosystem
        </span>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          One Ecosystem.{" "}
          <span className="text-gradient-it">Four Perspectives.</span>
        </h2>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">
          Every stakeholder sees the intelligence they need—while staying
          connected to the same skill ecosystem.
        </p>
      </div>

      {/* Cards grid */}
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PORTALS.map((p, i) => (
          <PortalCard key={p.key} theme={p} idx={i} />
        ))}
      </div>
    </section>
  );
}
