"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SsEyebrow, SsSectionHeading, SsCard } from "@/components/ui/ss";
import { usePhase1 } from "@/lib/phase1-store";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
}

const FEATURES: Feature[] = [
  {
    title: "Evidence Over Claims",
    description:
      "Skills are supported by assessments, projects, certifications, internships and feedback—not self-reported claims.",
    icon: ShieldCheck,
    accent: "#0D9488",
    tint: "#CCFBF1",
  },
  {
    title: "Role-Specific Readiness",
    description:
      "Students understand exactly what they need for their target career—mapped against real industry requirements.",
    icon: Target,
    accent: "#2563EB",
    tint: "#DBEAFE",
  },
  {
    title: "Continuous Feedback",
    description:
      "Real-world experiences continuously strengthen the student's skill profile—every project, internship, and review feeds back in.",
    icon: TrendingUp,
    accent: "#EA580C",
    tint: "#FED7AA",
  },
];

export function WhySkillSetu() {
  const { openGate } = usePhase1();
  return (
    <section
      id="about"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SsEyebrow icon={Sparkles} tone="orange">Why SKILL SETU</SsEyebrow>
          <SsSectionHeading size="lg" className="mt-5">
            Not Just a Portal.
            <br />
            <span className="text-gradient-nbt">A Skill Intelligence Layer.</span>
          </SsSectionHeading>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <SsCard tone="lift" className="h-full p-6">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105"
                    style={{ backgroundColor: f.tint, color: f.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-[var(--ss-ink)]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ss-muted)]">
                    {f.description}
                  </p>
                </SsCard>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-base font-semibold text-[var(--ss-ink)] sm:text-lg">
            Build Skills. Create Evidence. Find Opportunity.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="navy" size="lg" className="h-11 gap-2 px-6" onClick={() => openGate("get-started")}>
              <Sparkles className="h-4 w-4" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 gap-2 px-6">
              <a href="#portals">Explore the Portals</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
