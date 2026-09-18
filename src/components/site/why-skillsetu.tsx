"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, TrendingUp, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    title: "Evidence Over Claims",
    description:
      "Skills are supported by assessments, projects, certifications, internships and feedback—not self-reported claims.",
    icon: ShieldCheck,
    tint: "#CCFBF1",
    accent: "#0D9488",
  },
  {
    title: "Role-Specific Readiness",
    description:
      "Students understand exactly what they need for their target career—mapped against real industry requirements.",
    icon: Target,
    tint: "#FEF3C7",
    accent: "#B45309",
  },
  {
    title: "Continuous Feedback",
    description:
      "Real-world experiences continuously strengthen the student's skill profile—every project, internship, and review feeds back in.",
    icon: TrendingUp,
    tint: "#EDE9FE",
    accent: "#6D28D9",
  },
];

export function WhySkillSetu() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            Why SKILL SETU
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Not Just a Portal.
            <br />
            <span className="text-gradient-it">A Skill Intelligence Layer.</span>
          </h2>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.22)]"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: f.tint, color: f.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
