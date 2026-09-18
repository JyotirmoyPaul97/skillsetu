import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { SkillLayerCard } from "@/components/site/skill-layer";
import { Portals } from "@/components/site/portals";
import { ClosedLoop } from "@/components/site/closed-loop";
import { WhySkillSetu } from "@/components/site/why-skillsetu";
import { Footer } from "@/components/site/footer";
import { PhaseGate } from "@/components/site/phase-gate";

export default function Home() {
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

      {/* Phase 2 gate modal — shown when Login / Get Started / Enter X Portal clicked */}
      <PhaseGate />
    </div>
  );
}
