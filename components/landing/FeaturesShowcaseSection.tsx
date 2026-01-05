import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";
import { AutoJournalFeedMockup } from "@/components/landing/AutoJournalFeedMockup";
import { IntensitySliderMockup } from "@/components/landing/IntensitySliderMockup";
import { MotivationalWidgetMockup } from "@/components/landing/MotivationalWidgetMockup";
import { ProfileMockup } from "@/components/landing/ProfileMockup";
import { TwoDayRuleMockup } from "@/components/landing/TwoDayRuleMockup";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid.tsx";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  CalendarDays,
  Lightbulb,
  MousePointerClick,
  Rss,
  Sliders,
  User,
} from "lucide-react";

const features = [
  {
    Icon: CalendarDays,
    name: "The True Two-Day Rule: Your Streak Protector",
    description:
      "Life's messy, we get it. Miss a day? No sweat! Our empathetic system safeguards your hard-earned consistency. Only TWO consecutive misses reset your streak, making discipline ADHD-friendly and celebrating your real resilience. Keep that momentum, always!",
    href: "#",
    cta: "Never Break Your Flow",
    background: <TwoDayRuleMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: MousePointerClick,
    name: "Intelligent Actions (Todos): Your Dream-Building Blueprint",
    description:
      "Master your chaos, build your dreams. Our intelligent notepad helps you organize tasks with surgical precision , unlimited deep nesting, fluid prioritization, and next-day clearing for laser-sharp focus. Say goodbye to mental clutter, hello to laser-sharp focus, perfect for crushing goals even if your brain runs 1000mph.",
    href: "#",
    cta: "Start Crushing Goals",
    background: <ActionChipsMockup />,
    className: "col-span-3 md:col-span-2",
  },
  {
    Icon: Sliders,
    name: "Atomic Habits to Goals: Build Your Dream Identity",
    description:
      "From '10 Pushups' to 'Launching a Startup' , whatcha-do.in molds to YOUR ambition. Set quantitative goals, effortlessly upgrade or downgrade without losing your consistent streak, and log mood/progress. Every small win is a celebration, a brick in your dream identity!",
    href: "#",
    cta: "Start Building Identity",
    background: <IntensitySliderMockup />,
    className: "col-span-3 md:col-span-2",
  },
  {
    Icon: Rss,
    name: "The Two-Sided Journal: Your Legacy. Unfiltered or Public.",
    description:
      "Your sacred space: a Private Sanctuary for unfiltered thoughts & raw reflections. Your stage: a Public Declaration, where every completed habit, action, and conquered target is seamlessly logged. Build in public, celebrate every win, and watch your dream identity unfold in real-time. This isn't just journaling; it's building your future self.",
    href: "#",
    cta: "Journal Your Ascent",
    background: <AutoJournalFeedMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: User,
    name: "Your Public Profile: Flex Your Journey",
    description:
      "Your whatcha-do.in/[username] profile isn't just a page; it's a living testament, proof, and evolving masterpiece of your consistent action and growth. Inspire your circle, celebrate your wins loudly, and show the world the dream identity you're actively building!",
    href: "#",
    cta: "Inspire & Be Inspired",
    background: <ProfileMockup />,
    className: "col-span-3 md:col-span-1",
  },
  {
    Icon: Lightbulb, // Changed icon to Lightbulb
    name: "Designed for Laser Focus & Epic Flow",
    description:
      "Ever felt your brain scattered? Not anymore. Our 'Positive Urgency' UI uses subtle cues to guide you, while 'Keyboard-First Design' unlocks blistering speed. This elegantly curated environment *demands* consistent action, cultivates deep focus, and helps ambitious minds (especially ADHD brains!) work on their dreams without distractions. Get ready for epic flow states.",
    href: "#",
    cta: "Unlock Your Focus",
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
            Ignite Your Potential:{" "}
            <span className="text-primary">
              Engineering Human Transformation
            </span>
            .
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            We&#39;ve meticulously engineered every pixel and line of code to
            obliterate friction, eradicate stress, and supercharge your pure
            productivity.
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
