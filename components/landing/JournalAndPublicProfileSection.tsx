"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { PulseBadge } from "@/components/shared/PulseBadge";

export function JournalAndPublicProfileSection() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <BlurFade delay={0.1} inView>
          <SparklesText>
            <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tight mb-6">
              Your Story, Your Rules:{" "}
              <span className="text-primary">
                Private Insights & Public Impact
              </span>
              .
            </h2>
          </SparklesText>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Every action you take, every habit you build, every target you hit
            can be a private reflection or a public declaration. Control what
            the world sees, build your legacy, and inspire others—all from one
            powerful platform.
          </p>
        </BlurFade>
      </div>

      <div className="mt-20 flex justify-center">
        <PulseBadge
          link="/me"
          bannerText="Start building your public legacy."
          badgeText="Create Profile"
        />
      </div>
    </section>
  );
}