"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "@/lib/router";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { SkillLayerCard } from "@/components/site/skill-layer";
import { Portals } from "@/components/site/portals";
import { ClosedLoop } from "@/components/site/closed-loop";
import { WhySkillSetu } from "@/components/site/why-skillsetu";
import { Footer } from "@/components/site/footer";

// Code-split the authenticated app + login so the landing bundle stays light
// (avoids pulling the whole student portal into the initial compile).
const LoginView = dynamic(() => import("@/components/app/login-view").then((m) => m.LoginView), {
  ssr: false,
  loading: () => <FullPageLoader />,
});
const AppShell = dynamic(() => import("@/components/app/app-shell").then((m) => m.AppShell), {
  ssr: false,
  loading: () => <FullPageLoader />,
});

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ss-surface-2)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ss-border)] border-t-[var(--ss-blue-600)]" />
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ss-muted)]">Loading SKILL SETU…</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { route } = useRouter();

  useEffect(() => {
    if (route.startsWith("/app")) window.scrollTo(0, 0);
  }, [route]);

  if (route === "/login") {
    return <LoginView />;
  }

  if (route.startsWith("/app")) {
    return <AppShell />;
  }

  // Phase 1 landing (unchanged)
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <SkillLayerCard />
        <Portals />
        <ClosedLoop />
        <WhySkillSetu />
      </main>
      <Footer />
    </div>
  );
}
