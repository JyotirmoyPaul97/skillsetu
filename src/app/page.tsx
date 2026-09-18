"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { SkillLayerCard } from "@/components/site/skill-layer";
import { Portals } from "@/components/site/portals";
import { ClosedLoop } from "@/components/site/closed-loop";
import { WhySkillSetu } from "@/components/site/why-skillsetu";
import { CtaSection } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { AuthScreen } from "@/components/app/auth-screen";
import { AppShell } from "@/components/app/app-shell";
import { LogoMark } from "@/components/site/logo";

export default function Home() {
  const { user, loadingUser, view, fetchUser } = useApp();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Splash while we resolve the session on first load
  if (loadingUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <LogoMark size={48} />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-500" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            SKILL SETU · loading ecosystem
          </p>
        </motion.div>
      </div>
    );
  }

  // Authenticated → app shell
  if (user && view !== "landing") {
    return (
      <>
        <AppShell />
        <AnimatePresence>
          {(view === "login" || view === "register") && <AuthScreen />}
        </AnimatePresence>
      </>
    );
  }

  // Public landing
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <SkillLayerCard />
        <Portals />
        <div id="closed-loop" className="scroll-mt-20">
          <ClosedLoop />
        </div>
        <WhySkillSetu />
        <CtaSection />
      </main>
      <Footer />

      {/* Auth overlay */}
      <AnimatePresence>
        {(view === "login" || view === "register") && <AuthScreen />}
      </AnimatePresence>
    </div>
  );
}
