"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section
      id="get-started"
      className="relative isolate overflow-hidden bg-slate-900 py-20 text-center sm:py-28"
    >
      {/* Decorative layers */}
      <div className="bg-dot-grid-dark absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl px-4 sm:px-6"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Build Skills · Create Evidence · Find Opportunity
        </span>

        <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          SKILL SETU brings students, industry, academia and institutions into
          one{" "}
          <span className="text-gradient-it">connected skill ecosystem.</span>
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          From Skill Claims to Skill Evidence. AI-Powered Skill Intelligence &
          Academia–Industry Ecosystem.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:shadow-xl"
          >
            <Link href="#portals">
              Explore the Ecosystem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
          >
            <Link href="#get-started">
              <Sparkles className="h-4 w-4 text-teal-300" />
              Get Started
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
