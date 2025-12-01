import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { BackstorySection } from "@/components/landing/BackstorySection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { ScienceAndFeaturesSection } from "@/components/landing/ScienceAndFeaturesSection"; // NEW combined section
import { CTASection } from "@/components/landing/CTASection";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { cn } from "@/lib/utils";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "whatcha-doin",
  description: "The app that helps you become the person you keep imagining --- by stacking Identity × Discipline × Consistency, one tiny action at a time.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.1}
        flickerChance={0.1}
        height={800}
        width={800}
      />
      <div className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <BackstorySection />
        <BeforeAfterSection />
        <ScienceAndFeaturesSection /> {/* Use the new combined section */}
        <CTASection />
      </div>
    </div>
  );
}
