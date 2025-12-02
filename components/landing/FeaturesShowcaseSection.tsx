"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { CalendarDays, LayoutGrid, Sliders, BookOpen, User, Lightbulb, CheckCircle } from "lucide-react"; // Added CheckCircle
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";

import { Safari } from "@/components/ui/safari";
import { ProfileMockup } from "@/components/landing/ProfileMockup";
import { TwoDayRuleMockup } from "@/components/landing/TwoDayRuleMockup";
import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";
import { IntensitySliderMockup } from "@/components/landing/IntensitySliderMockup";
import { AutoJournalFeedMockup } from "@/components/landing/AutoJournalFeedMockup";
import { MotivationalWidgetMockup } from "@/components/landing/MotivationalWidgetMockup";
import { ConsistentIdentityMockup } from "@/components/landing/ConsistentIdentityMockup";

// Combined items for the Features Showcase
const showcaseItems = [
    {
      title: "Public Profile: Your Answer to 'Whatcha Doin'?'",
      description: "Stop being stunned. Share your personalized profile link (`yourdomain.com/[username]`) to proudly display your streaks, habits, and progress. It's your living proof.",
      icon: <User className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2 lg:col-span-3 bg-card border-border/50 lg:min-h-[18rem]", // Prominent placement
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <Safari className="w-full h-full">
                <ProfileMockup />
              </Safari>
          </div>
      ),
    },
    {
      title: "Two-Day Rule: Unbreakable Consistency",
      description: "Leverage Micro-Commitments & Positive Urgency. Miss one day? Cool. Miss two? Streak resets — sustainably. No pressure, just progress.",
      icon: <CalendarDays className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1 lg:col-span-2 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <TwoDayRuleMockup />
          </div>
      ),
    },
    {
      title: "Action Chips: Brain-Friendly Productivity",
      description: "Drag. Drop. Done. Visualize your progress and manage tasks effortlessly. It's Identity Anchoring in action.",
      icon: <LayoutGrid className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1 lg:col-span-1 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <ActionChipsMockup />
          </div>
      ),
    },
    {
      title: "Intensity Slider: Effort, Not Perfection",
      description: "Track your effort (100% and 20% both count!) with Intensity Logging. Every action, no matter how small, reinforces your identity.",
      icon: <Sliders className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2 lg:col-span-1 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <IntensitySliderMockup />
          </div>
      ),
    },
    {
      title: "Auto-Journal Feed: Your Story Writes Itself",
      description: "Seamlessly capture your growth and reflections with Automatic Journaling. Your daily actions become a documented journey of becoming.",
      icon: <BookOpen className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1 lg:col-span-2 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <AutoJournalFeedMockup />
          </div>
      ),
    },
    {
      title: "Motivational Widget: Daily Fuel for Identity",
      description: "Quotes that actually hit, delivered when you need them most. Anchor your identity with consistent positive reinforcement.",
      icon: <Lightbulb className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1 lg:col-span-1 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <MotivationalWidgetMockup />
          </div>
      ),
    },
    {
      title: "Your Consistent Identity",
      description: "Every action, every streak, every reflection builds towards the person you envision. whatcha-doin is your daily architect.",
      icon: <CheckCircle className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2 lg:col-span-3 bg-card border-border/50 lg:min-h-[12rem]",
      header: (
          <div className="flex flex-1 w-full h-full rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border">
              <ConsistentIdentityMockup />
          </div>
      ),
    },
]

export function FeaturesShowcaseSection() {
  return (
    <section className="py-24 px-4 w-full bg-background/80 backdrop-blur-sm border-t border-border/40">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Main Section Header */}
        <BlurFade delay={0.2} inView>
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                    What&apos;s Cooking: <br className="sm:hidden" />
                    Build Your Answer to &apos;Whatcha Doin&apos;?&apos;
                </h2>
                <p className="text-lg text-muted-foreground">
                    Discover the powerful features and the science behind how whatcha-doin helps you become unstoppable.
                </p>
            </div>
        </BlurFade>

        {/* Features Showcase Grid */}
        <BlurFade delay={0.4} inView>
            <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[16rem]"> {/* Adjust row height for features */}
            {showcaseItems.map((item, i) => (
                <BentoGridItem
                key={item.title}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={cn("lg:min-h-[12rem]", item.className)} // Ensure min-height to prevent squishing
                />
            ))}
            </BentoGrid>
        </BlurFade>

        {/* Final CTA/Quote is handled in CTASection now */}
      </div>
    </section>
  );
}