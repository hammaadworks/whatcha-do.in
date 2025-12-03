import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { CalendarDays, MousePointerClick, Sliders, Rss, User, Quote } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TwoDayRuleMockup } from "@/components/landing/TwoDayRuleMockup";
import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";
import { IntensitySliderMockup } from "@/components/landing/IntensitySliderMockup";
import { AutoJournalFeedMockup } from "@/components/landing/AutoJournalFeedMockup";
import { ProfileMockup } from "@/components/landing/ProfileMockup";
import { MotivationalWidgetMockup } from "@/components/landing/MotivationalWidgetMockup";

const features = [
  {
    Icon: CalendarDays,
    name: "Two-Day Rule",
    description: "Miss one day? Cool. Miss two? Streak resets — sustainably.",
    href: "#",
    cta: "See how",
    background: <TwoDayRuleMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: MousePointerClick,
    name: "Action Chips",
    description: "Drag. Drop. Done. Brain-friendly productivity.",
    href: "#",
    cta: "Try it",
    background: <ActionChipsMockup />,
    className: "col-span-3 md:col-span-2",
  },
  {
    Icon: Sliders,
    name: "Intensity Slider",
    description: "100% and 20% both count. Effort matters.",
    href: "#",
    cta: "Adjust now",
    background: <IntensitySliderMockup />,
    className: "col-span-3 md:col-span-2",
  },
  {
    Icon: Rss,
    name: "Auto-Journal Feed",
    description: "Your growth, captured seamlessly.",
    href: "#",
    cta: "View feed",
    background: <AutoJournalFeedMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: User,
    name: "Public Profile",
    description: "Your \"Life Resume\" — streaks, habits, reflections.",
    href: "#",
    cta: "View demo",
    background: <ProfileMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: Quote,
    name: "Motivational Widget",
    description: "Quotes that actually hit.",
    href: "#",
    cta: "Get inspired",
    background: <MotivationalWidgetMockup />,
    className: "col-span-3 md:col-span-2",
  },
];

export function FeaturesShowcaseSection() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight mb-6">
            Your identity-building toolkit.
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Everything you need to turn ambitions into identity, one day at a time.
          </p>
        </BlurFade>
      </div>
      <BlurFade delay={0.6} inView>
        <BentoGrid>
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </BlurFade>
    </section>
  );
}