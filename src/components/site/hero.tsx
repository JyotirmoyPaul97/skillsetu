"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export function Hero() {
  const { setView } = useApp();
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[92vh] items-center justify-center overflow-hidden"
    >
      {/* Background workspace photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero/workspace.jpg"
          alt="Bright modern workspace with laptop, plants and notebooks by a window"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Readability overlays: soft white wash + vignette + bottom fade into page bg */}
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(255,255,255,0.55)_100%)]" />
      </div>

      {/* Centered hero content */}
      <div className="mx-auto w-full max-w-4xl px-4 pt-28 pb-20 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            AI-Powered Skill Intelligence
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
          className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          From Skill Claims
          <br />
          to{" "}
          <span className="relative whitespace-nowrap">
            <span className="text-gradient-it">Skill Evidence.</span>
            <svg
              className="absolute -bottom-2 left-0 h-2.5 w-full text-teal-500/60"
              viewBox="0 0 200 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 6 C 50 2, 150 2, 198 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl"
        >
          Measure what students can actually demonstrate, understand what
          industry requires, and turn skill gaps into meaningful opportunities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            onClick={() => setView("register")}
            className="h-11 gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 hover:shadow-xl"
          >
            Explore the Ecosystem
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-slate-300 bg-white/80 px-6 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white"
          >
            <a href="#how-it-works">
              <Play className="h-4 w-4 text-teal-600" />
              How It Works
            </a>
          </Button>
        </motion.div>

        {/* tiny stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"
        >
          <span>Evidence</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>Skills</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>Match</span>
        </motion.div>
      </div>
    </section>
  );
}
