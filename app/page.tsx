import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { BackstorySection } from "@/components/landing/BackstorySection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { PsychologySection } from "@/components/landing/PsychologySection";
import { AISection } from "@/components/landing/AISection";
import { FeaturesShowcaseSection } from "@/components/landing/FeaturesShowcaseSection";
import { StillUnsureSection } from "@/components/landing/StillUnsureSection";
import { CTASection } from "@/components/landing/CTASection";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "whatcha-doin",
  description: "The app that helps you become the person you keep imagining --- by stacking Identity × Discipline × Consistency, one tiny action at a time.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <div className="relative z-10 flex flex-col gap-0">
        <HeroSection />
        <ProblemSection />
        <BackstorySection />
        <BeforeAfterSection />
        <PsychologySection />
        <AISection />
        <FeaturesShowcaseSection />
        <StillUnsureSection />
        <CTASection />
      </div>
    </div>
  );
}
