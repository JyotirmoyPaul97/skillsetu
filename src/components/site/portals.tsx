"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Factory, BookOpen, Building2, ArrowRight, Layers,
} from "lucide-react";
import { PORTALS, type PortalTheme } from "./theme";
import { SsEyebrow, SsSectionHeading, SsBadge } from "@/components/ui/ss";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

const ICON = { student: GraduationCap, industry: Factory, academia: BookOpen, institution: Building2 } as const;

function PortalCard({ theme, idx }: { theme: PortalTheme; idx: number }) {
  const { navigate } = useRouter();
  const Icon = ICON[theme.key];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: idx * 0.08 }}
      className="group relative flex flex-col rounded-2xl border border-[var(--ss-border)] bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* icon + index */}
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: theme.tint, color: theme.accent, border: `1px solid ${theme.borderTint}` }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span className="text-xs font-light tracking-[0.22em] text-[var(--ss-faint)]">
          {theme.index}
        </span>
      </div>

      {/* title + description */}
      <h3 className="mt-5 text-lg font-bold text-[var(--ss-ink)]">{theme.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ss-muted)]">
        {theme.description}
      </p>

      {/* tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {theme.tags.map((tag) => (
          <SsBadge
            key={tag}
            tone={theme.key as any}
            className="text-[11px]"
          >
            {tag}
          </SsBadge>
        ))}
      </div>

      {/* enter CTA */}
      <div className="flex-1" />
      <button
        onClick={() => navigate("/login")}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: theme.accent }}
      >
        Enter {theme.short} Portal
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* hover accent bar */}
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
      <div className="mx-auto max-w-2xl text-center">
        <SsEyebrow icon={Layers} tone="blue">Four Portals · One Ecosystem</SsEyebrow>
        <SsSectionHeading className="mt-5">
          One Ecosystem.{" "}
          <span className="text-gradient-nbt">Four Perspectives.</span>
        </SsSectionHeading>
        <p className="mt-4 text-base text-[var(--ss-muted)] sm:text-lg">
          Every stakeholder sees the intelligence they need—while staying
          connected to the same skill ecosystem.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PORTALS.map((p, i) => (
          <PortalCard key={p.key} theme={p} idx={i} />
        ))}
      </div>
    </section>
  );
}
