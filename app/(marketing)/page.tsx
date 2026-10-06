import Hero from "@/components/landing/Hero";
import How from "@/components/landing/How";
import Kinetic from "@/components/landing/Kinetic";
import Problem from "@/components/landing/Problem";
import RevealObserver from "@/components/landing/RevealObserver";
import { FeaturesSection, FinalCta, Pricing } from "@/components/landing/Sections";
import SiteShell from "@/components/landing/SiteShell";
import Statement from "@/components/landing/Statement";
import Why from "@/components/landing/Why";

export default function LandingPage() {
  return (
    <SiteShell>
      <main id="top">
        <Hero />
        <Kinetic />
        <Statement />
        <Problem />
        <FeaturesSection />
        <Why />
        <How />
        <Pricing />
        <FinalCta />
      </main>
      <RevealObserver />
    </SiteShell>
  );
}
