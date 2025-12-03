import { RetroGrid } from "@/components/ui/retro-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import Link from "next/link";
<<<<<<< Updated upstream
import { ShimmerButton } from "@/components/ui/shimmer-button";
||||||| Stash base
import { RainbowButton } from "@/components/ui/rainbow-button";
=======
import { ShimmerButton } from "@/components/ui/shimmer-button"; // Changed to ShimmerButton
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
>>>>>>> Stashed changes
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { HeroVisuals } from "@/components/landing/HeroVisuals";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 overflow-hidden pt-20 lg:pt-0">
      <RetroGrid className="z-0 opacity-40 dark:opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Text */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          
          {/* Pulsating Badge */}
          <BlurFade delay={0.1} inView>
            <Link href="/me">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-mono shadow-sm hover:bg-primary/15 transition-colors cursor-pointer">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                I know what we are gonna do today.
                <span className="text-xs font-mono text-primary-foreground bg-primary rounded-full px-2 py-0.5 ml-2">Beta</span>
              </div>
            </Link>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono tracking-tighter text-foreground leading-none">
              <span className="text-4xl md:text-5xl lg:text-6xl font-sans text-muted-foreground/80">So...</span><br/>
              whatcha doin?
            </h1>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="text-xl md:text-2xl font-mono text-muted-foreground max-w-xl leading-relaxed">
              Become the person you always kept imagining. <br />
              This app stacks up <span className="font-bold text-foreground underline decoration-primary/50 decoration-4 underline-offset-4">Identity × Discipline × Consistency</span>.
            </p>
          </BlurFade>

          <BlurFade delay={0.6} inView>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
<<<<<<< Updated upstream
              <Link href="/me">
                <ShimmerButton className="h-14 px-8 text-lg font-bold font-sans rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
                               background="var(--primary)"
                               shimmerColor="rgba(255, 255, 0.4)">
||||||| Stash base
              <RainbowButton className="h-14 px-8 text-lg font-bold font-sans rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95">
                <Link href="/logins">
=======
              <Link href="/logins">
                <ShimmerButton 
                  className="h-14 px-8 text-lg font-bold font-sans shadow-2xl transition-transform hover:scale-105 active:scale-95"
                  background="var(--primary)"
                  shimmerColor="var(--background)"
                >
>>>>>>> Stashed changes
                  Start Building Your Identity
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>

          <BlurFade delay={0.8} inView>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono opacity-80">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 dark:bg-gray-700" />
                ))}
              </div>
              <p>Joined by 1000+ ambitious builders</p>
            </div>
          </BlurFade>
        </div>

        {/* Right Column: Visuals */}
        <div className="relative lg:h-[600px] flex items-center justify-center">
          <BlurFade delay={0.5} inView className="w-full">
            <HeroVisuals />
          </BlurFade>
        </div>

      </div>
    </section>
  );
}
