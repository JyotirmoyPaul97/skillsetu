"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Factory, BookOpen, Building2, X, Sparkles, ArrowRight, Lock, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhase1, type GateWhich } from "@/lib/phase1-store";
import { Logo } from "./logo";

const META: Record<Exclude<GateWhich, null>, { title: string; subtitle: string; portal?: string; accent: string; tint: string }> = {
  login:             { title: "Login to SKILL SETU", subtitle: "Authentication & session management arrive in Phase 2.", accent: "#0F2547", tint: "#DBE7F5" },
  "get-started":     { title: "Get Started", subtitle: "Account creation & onboarding arrive in Phase 2.", accent: "#0F2547", tint: "#DBE7F5" },
  "portal-student":     { title: "Student Portal", subtitle: "Student dashboards — Skill Passport, Career Readiness, Opportunities — arrive in Phase 2.", portal: "Student", accent: "#0D9488", tint: "#CCFBF1" },
  "portal-industry":    { title: "Industry Portal", subtitle: "Industry dashboards — Talent Discovery, AI Team Builder — arrive in Phase 2.", portal: "Industry", accent: "#EA580C", tint: "#FED7AA" },
  "portal-academia":    { title: "Academia Portal", subtitle: "Academia dashboards — Curriculum Alignment, Collaborations — arrive in Phase 2.", portal: "Academia", accent: "#2563EB", tint: "#DBEAFE" },
  "portal-institution": { title: "Institution Portal", subtitle: "Institution dashboards — Skill Intelligence, Placement Insights — arrive in Phase 2.", portal: "Institution", accent: "#0F2547", tint: "#DBE7F5" },
};

const PORTAL_ICON = { Student: GraduationCap, Industry: Factory, Academia: BookOpen, Institution: Building2 };

export function PhaseGate() {
  const { gate, closeGate } = usePhase1();
  // close on Escape
  useEffect(() => {
    if (!gate) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeGate(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [gate, closeGate]);

  const meta = gate ? META[gate] : null;

  return (
    <AnimatePresence>
      {gate && meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1628]/60 p-4 backdrop-blur-sm"
          onClick={closeGate}
          role="dialog"
          aria-modal="true"
          aria-label={meta.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop"
          >
            {/* top accent strip */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${meta.accent}, var(--ss-blue-600), var(--ss-teal-600))` }} />

            <button
              onClick={closeGate}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8 text-center">
              <span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: meta.tint, color: meta.accent }}
              >
                {meta.portal ? (
                  (() => { const I = PORTAL_ICON[meta.portal as keyof typeof PORTAL_ICON]; return <I className="h-6 w-6" />; })()
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </span>

              <h3 className="mt-5 text-xl font-bold text-[var(--ss-ink)]">{meta.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--ss-muted)]">
                {meta.subtitle}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--ss-line)] bg-[var(--ss-surface-2)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ss-muted)]">
                <Layers className="h-3.5 w-3.5 text-[var(--ss-blue-600)]" />
                Phase 2 · Portals &amp; Auth
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button onClick={closeGate} className="h-10 w-full gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Back to landing
                </Button>
                <a
                  href="#how-it-works"
                  onClick={closeGate}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--ss-blue-600)] hover:underline"
                >
                  Explore the ecosystem first
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-6 py-3">
              <div className="flex items-center justify-center">
                <Logo size={26} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
