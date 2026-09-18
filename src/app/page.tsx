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

// Code-split the authenticated portals + login so the landing bundle stays light.
const LoginView = dynamic(() => import("@/components/app/login-view").then((m) => m.LoginView), {
  ssr: false,
  loading: () => <FullPageLoader />,
});
const AppShell = dynamic(() => import("@/components/app/app-shell").then((m) => m.AppShell), {
  ssr: false,
  loading: () => <FullPageLoader />,
});
const IndustryShell = dynamic(() => import("@/components/app/industry/industry-shell").then((m) => m.IndustryShell), {
  ssr: false,
  loading: () => <FullPageLoader />,
});
const AcademiaShell = dynamic(() => import("@/components/app/academia/academia-shell").then((m) => m.AcademiaShell), {
  ssr: false,
  loading: () => <FullPageLoader />,
});
const InstitutionShell = dynamic(() => import("@/components/app/institution/institution-shell").then((m) => m.InstitutionShell), {
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
    if (route.startsWith("/app") || route.startsWith("/industry") || route.startsWith("/academia") || route.startsWith("/institution")) window.scrollTo(0, 0);
  }, [route]);

  if (route === "/login") {
    return <LoginView />;
  }

  if (route.startsWith("/app")) {
    return <AppShell />;
  }

  if (route.startsWith("/industry")) {
    return <IndustryShell />;
  }

  if (route.startsWith("/academia")) {
    return <AcademiaShell />;
  }

  if (route.startsWith("/institution")) {
    return <InstitutionShell />;
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
