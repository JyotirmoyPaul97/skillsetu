"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";

export function Hero() {
  const { navigate } = useRouter();
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[94vh] items-center justify-center overflow-hidden"
    >
      {/* Background workspace photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero/workspace.jpg"
          alt="Modern campus workspace with laptop, books, notebook, coffee and greenery"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Navy overlay for text readability (master spec: subtle dark/neutral overlay) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/55 via-[#0a1628]/35 to-[#0a1628]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,22,40,0.55)_100%)]" />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pt-28 pb-20 text-center sm:px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#5eead4]" />
            AI-Powered Skill Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
          className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          From Skill Claims
          <br />
          to{" "}
          <span className="relative whitespace-nowrap">
            <span className="text-gradient-light">Skill Evidence.</span>
            <svg
              className="absolute -bottom-2 left-0 h-2.5 w-full text-[#5eead4]/70"
              viewBox="0 0 200 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M2 6 C 50 2, 150 2, 198 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl"
        >
          Measure what students can actually demonstrate, understand what industry
          requires, and turn skill gaps into meaningful opportunities.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            variant="navy"
            size="lg"
            onClick={() => navigate("/login")}
            className="h-11 gap-2 px-6"
          >
            Explore the Ecosystem
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 gap-2 border-white/30 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20"
          >
            <a href="#how-it-works">
              <Play className="h-4 w-4 text-[#5eead4]" />
              How It Works
            </a>
          </Button>
        </motion.div>

        {/* Evidence principle strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#5eead4]" />
          Evidence, not claims
        </motion.div>
      </div>
    </section>
  );
}
