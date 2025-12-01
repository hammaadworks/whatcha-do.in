"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { Anchor, Zap, Timer, Activity, BookOpen, CalendarDays, LayoutGrid, Sliders, User, Quote, Lightbulb } from "lucide-react";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";

// --- Psychology Items (from old PsychologySection.tsx) ---
const psychologyItems = [
  {
    title: "Identity Anchoring",
    description: "You align each habit with the identity you want.",
    icon: <Anchor className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2 bg-card border-border/50",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4 overflow-hidden">
        <div className="bg-background rounded-lg border border-border p-4 shadow-sm w-full max-w-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              U
            </div>
            <div className="space-y-1">
              <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-secondary/50 p-2 rounded">
            identity: <span className="text-primary">"Writer"</span>;<br />
            action: <span className="text-foreground">"Write 500 words"</span>;
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Micro-Commitments",
    description: "Tiny actions create compounding momentum.",
    icon: <Zap className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1 bg-card border-border/50",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-sm",
                i < 10 ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
              )}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Positive Urgency",
    description: "Yesterday fades at midnight --- alive, rhythmic, motivating.",
    icon: <Timer className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1 bg-card border-border/50",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-red-500/20 opacity-50 animate-pulse" />
        <div className="font-mono text-2xl font-bold text-foreground z-10">
          23:59:59
        </div>
      </div>
    ),
  },
  {
    title: "Intensity Logging",
    description: "Track effort, not perfection. 100% and 20% both count.",
    icon: <Activity className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2 bg-card border-border/50",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
        <div className="w-full max-w-xs space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className="h-2 w-full bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[75%] rounded-full" />
          </div>
          <div className="flex justify-center">
            <span className="px-2 py-1 bg-background border border-border rounded text-xs font-bold text-primary">
              75% Intensity
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Automatic Journaling",
    description: "Your story writes itself. Your growth, captured seamlessly.",
    icon: <BookOpen className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-3 bg-card border-border/50",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border p-6 items-center justify-start overflow-hidden">
        <Terminal className="w-full h-full bg-background border-border shadow-sm text-xs md:text-sm">
          <AnimatedSpan delay={0} className="text-green-500">
            <span>✔ Action &apos;Read 10 pages&apos; completed.</span>
          </AnimatedSpan>
          <TypingAnimation delay={1000} className="text-muted-foreground">
            &gt; Appending to Daily Journal: "Focused reading session. Felt productive."
          </TypingAnimation>
        </Terminal>
      </div>
    ),
  },
];

// --- Features Items (from old FeaturesSection.tsx) ---
const featuresItems = [
  {
    title: "Two-Day Rule",
    description: "Miss one day? Cool. Miss two? Streak resets — sustainably.",
    icon: <CalendarDays className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-2 bg-card border-border/50",
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <CalendarDays className="w-16 h-16 text-primary" />
        </div>
    ),
  },
  {
    title: "Action Chips",
    description: "Drag. Drop. Done. Brain-friendly productivity.",
    icon: <LayoutGrid className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-1 bg-card border-border/50",
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <LayoutGrid className="w-16 h-16 text-primary" />
        </div>
    ),
  },
  {
    title: "Intensity Slider",
    description: "100% and 20% both count. Effort matters.",
    icon: <Sliders className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-1 bg-card border-border/50",
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <Sliders className="w-16 h-16 text-primary" />
        </div>
    ),
  },
  {
    title: "Auto-Journal Feed",
    description: "Your growth, captured seamlessly.",
    icon: <BookOpen className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-2 bg-card border-border/50",
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <BookOpen className="w-16 h-16 text-primary" />
        </div>
    ),
  },
  {
    title: "Public Profile",
    description: "Your 'Life Resume' — streaks, habits, reflections.",
    icon: <User className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-1 bg-card border-border/50",
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <User className="w-16 h-16 text-primary" />
        </div>
    ),
  },
  {
    title: "Motivational Widget",
    description: "Quotes that actually hit.",
    icon: <Lightbulb className="h-4 w-4 text-neutral-500" />,
    className: "lg:col-span-2 bg-card border-border/50", // Made this wider to break the grid pattern
    header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border items-center justify-center p-4">
            <Lightbulb className="w-16 h-16 text-primary" />
        </div>
    ),
  },
];

export function ScienceAndFeaturesSection() {
  return (
    <section className="py-24 px-4 w-full bg-background border-t border-border/40">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Main Section Header */}
        <BlurFade delay={0.2} inView>
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                    How <span className="text-primary">whatcha-doin</span> Works: <br className="sm:hidden" />
                    Science &amp; System.
                </h2>
                <p className="text-lg text-muted-foreground">
                    Discover the psychological foundations and powerful tools that make consistent identity building effortless.
                </p>
            </div>
        </BlurFade>

        {/* Psychology Section Content */}
        <BlurFade delay={0.4} inView>
            <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    The Science Behind Why It Works
                </h3>
            </div>
            <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] mb-16">
            {psychologyItems.map((item, i) => (
                <BentoGridItem
                key={item.title}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className}
                />
            ))}
            </BentoGrid>
        </BlurFade>

        {/* Features Section Content */}
        <BlurFade delay={0.6} inView>
            <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Your Identity-Building Toolkit
                </h3>
            </div>
            <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[16rem]"> {/* Adjust row height for features */}
            {featuresItems.map((feature, i) => (
                <BentoGridItem
                key={feature.title}
                title={feature.title}
                description={feature.description}
                header={feature.header}
                icon={feature.icon}
                className={cn("lg:min-h-[12rem]", feature.className)} // Ensure min-height to prevent squishing
                />
            ))}
            </BentoGrid>
        </BlurFade>

        {/* Overall Quote */}
        <BlurFade delay={0.8} inView>
             <div className="text-center mt-12 relative">
                <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl mx-auto border-l-2 border-primary pl-4">
                    &quot;You are what you repeatedly do. We help you make that your superpower.&quot;
                </p>
             </div>
         </BlurFade>
      </div>
    </section>
  );
}
