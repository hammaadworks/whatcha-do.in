"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-8 pb-32 px-4 md:pt-12">
      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start text-left space-y-8">
            <BlurFade delay={0.2} inView>
                <Link href="/me">
                    <div className="group inline-flex items-center rounded-full border border-border bg-background/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary/50 hover:border-primary/50">
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            I know what we&apos;re gonna do today
                            <span className="hidden sm:inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                                beta v1
                            </span>
                            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                    </div>
                </Link>
            </BlurFade>

            <BlurFade delay={0.4} inView>
                <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-7xl md:text-8xl">
                    &quot;So... <br/>
                    <span className="text-primary">whatcha doin&apos;?&quot;</span>
                </h1>
            </BlurFade>

            <BlurFade delay={0.6} inView>
                <div className="space-y-4 max-w-xl">
                    <p className="text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
                        The app that helps you become the person you keep imagining — by
                        stacking <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-extrabold">Identity × Discipline × Consistency</span>,
                        one tiny action at a time.
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.8} inView>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <Link href="/me">
                        <ShimmerButton className="shadow-2xl" background="var(--primary)">
                            <span className="whitespace-pre-wrap text-center text-base font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                Start Your Identity Run
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
            </BlurFade>
            
            <BlurFade delay={1.0} inView>
                 <blockquote className="border-l-2 border-primary pl-4 text-sm text-muted-foreground italic">
                    &quot;Small actions, done consistently, turn ambition into identity.&quot;
                </blockquote>
            </BlurFade>
        </div>

        {/* Right Column: Interactive Terminal */}
        <div className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-0">
             <BlurFade delay={0.6} inView className="w-full">
                 <Terminal className="min-h-[350px] shadow-2xl border-border/50 bg-card/80 backdrop-blur-md">
                    <TypingAnimation delay={500}>&gt; checking_status...</TypingAnimation>
                    
                    <AnimatedSpan delay={1200} className="text-foreground">
                      <span>[HABIT] "Gym" | Status: MISSED (Yesterday)</span>
                    </AnimatedSpan>
                    
                    <AnimatedSpan delay={2000} className="text-amber-500 font-bold">
                      <span>⚠ WARNING: Two-Day Rule Active!</span>
                    </AnimatedSpan>

                    <TypingAnimation delay={3000}>
                       &gt; completing_habit "Gym" --intensity=100%
                    </TypingAnimation>

                    <AnimatedSpan delay={4000} className="text-green-500">
                      <span>✔ SAVED. Streak: 12 Days (Rescued)</span>
                    </AnimatedSpan>

                    <TypingAnimation delay={5000} className="text-primary font-bold">
                       &gt; Identity: UPGRADING... _
                    </TypingAnimation>
                 </Terminal>
            </BlurFade>
        </div>

      </div>

      <RetroGrid className="opacity-30" />
    </section>
  );
}