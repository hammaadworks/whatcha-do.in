import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { TransformationSection } from "@/components/landing/TransformationSection"; // New import
import { FeaturesShowcaseSection } from "@/components/landing/FeaturesShowcaseSection";
import { ShortVideosSection } from "@/components/landing/ShortVideosSection"; // New import
import { PWASection } from "@/components/landing/PWASection"; // Import PWASection
import { TechStackSection } from "@/components/landing/TechStackSection"; // New import
import { StillUnsureSection } from "@/components/landing/StillUnsureSection";
import { CTASection } from "@/components/landing/CTASection";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "whatcha-do.in",
  description: "The app that helps you become the person you keep imagining --- by stacking Identity × Discipline × Consistency, one tiny action at a time.",
};

/**
 * The main Landing Page for the application (Root Route).
 * Composes various marketing sections to introduce the product.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <div className="relative z-10 flex flex-col gap-0">
        <HeroSection />
        <ProblemSection />
        <TransformationSection /> {/* New section */}
        <FeaturesShowcaseSection />
        <ShortVideosSection /> {/* New section */}
        <PWASection /> {/* Render the PWASection here */}
        <TechStackSection /> {/* New section */}
        <StillUnsureSection />
        <CTASection />
      </div>
    </div>
  );
}
