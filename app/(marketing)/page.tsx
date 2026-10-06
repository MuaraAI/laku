import { BrandProvider } from "@/components/landing/BrandDialog";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import How from "@/components/landing/How";
import Kinetic from "@/components/landing/Kinetic";
import Problem from "@/components/landing/Problem";
import RevealObserver from "@/components/landing/RevealObserver";
import { FeaturesSection, FinalCta, Footer, Pricing } from "@/components/landing/Sections";
import Statement from "@/components/landing/Statement";
import Why from "@/components/landing/Why";
import { LakuSprite } from "@/components/landing/primitives";

export default function LandingPage() {
  return (
    <BrandProvider>
      <LakuSprite />
      <Header />
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
      <Footer />
      <RevealObserver />
    </BrandProvider>
  );
}
