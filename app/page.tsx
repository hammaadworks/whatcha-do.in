import { CTASection } from "@/components/landing/CTASection";
import { FeaturesShowcaseSection } from "@/components/landing/FeaturesShowcaseSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { PWASection } from "@/components/landing/PWASection"; // Import PWASection
import { ShortVideosSection } from "@/components/landing/ShortVideosSection"; // New import
import { StillUnsureSection } from "@/components/landing/StillUnsureSection";
import { TransformationSection } from "@/components/landing/TransformationSection"; // New import
import { SparklesText } from "@/components/ui/sparkles-text";
import { TUTORIAL_VID } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "whatcha-do.in",
  description:
    "The app that helps you become the person you keep imagining --- by stacking Identity x Discipline x Consistency, one tiny action at a time.",
};

/**
 * The main Landing Page for the application (Root Route).
 * Composes various marketing sections to introduce the product.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <div className="relative z-10 flex flex-col gap-0 mb-2">
        <HeroSection />
        {/* New Hero Video Section */}
        <section className="py-16 px-4 md:px-8 bg-background text-foreground relative mb-2">
          <div className="max-w-4xl mx-auto text-center">
            <SparklesText>
            <h2 className="text-4xl md:text-5xl font-bold font-mono mb-8">
              Walkthrough: Your Journey Starts Here
            </h2></SparklesText>
            <p className="text-lg md:text-xl font-mono text-muted-foreground mb-12">
              Watch a comprehensive tutorial to understand how whatcha-do.in
              empowers you to build unshakable discipline and achieve your
              goals.
            </p>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-primary/50">
              <iframe
                src={`https://www.youtube.com/embed/${
                  TUTORIAL_VID.split("v=")[1].split("&")[0]
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                title="whatcha-do.in: Official Walkthrough"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>
        <TransformationSection />
        <ProblemSection />
        <FeaturesShowcaseSection />
        <PWASection /> 
        <ShortVideosSection />
        <StillUnsureSection />
        <CTASection />
      </div>
    </div>
  );
}
