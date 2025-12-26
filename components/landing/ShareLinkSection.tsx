"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Safari } from "@/components/ui/safari";

import { DOMAIN_URL } from "@/lib/constants";

// ... (other imports)

export function ShareLinkSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-background">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight">
            Don&apos;t just say it. <span className="text-primary">Show it.</span>
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-xl md:text-2xl font-mono text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Next time someone asks &quot;whatcha doin?&quot;, don&apos;t be dumbstruck. Just share your whatcha-do.in link and let your consistency do the talking.
          </p>
        </BlurFade>
        <BlurFade delay={0.6} inView>
          <div className="relative">
            <Safari url={`${DOMAIN_URL}/your_username`} imageSrc="/images/phineas-ferb.png" />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
