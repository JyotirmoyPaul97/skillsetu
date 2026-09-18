import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { SkillLayerCard } from "@/components/site/skill-layer";
import { Portals } from "@/components/site/portals";
import { ClosedLoop } from "@/components/site/closed-loop";
import { WhySkillSetu } from "@/components/site/why-skillsetu";
import { CtaSection } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";

export default function Home() {
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
    </div>
  );
}
