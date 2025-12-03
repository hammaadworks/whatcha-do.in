import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Brain, Zap, Clock, Activity, BookOpen } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";

const features = [
  {
    Icon: Brain,
    name: "Identity Anchoring",
    description: "You align each habit with the identity you want.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: Zap,
    name: "Micro-Commitments",
    description: "Tiny actions create compounding momentum.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Clock,
    name: "Positive Urgency",
    description: "Yesterday fades at midnight — alive, rhythmic, motivating.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Activity,
    name: "Intensity Logging",
    description: "Track effort, not perfection.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: BookOpen,
    name: "Automatic Journaling",
    description: "Your story writes itself.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "col-span-3",
  },
];

export function PsychologySection() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight">
            The science behind why it works.
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono">
            "You are what you repeatedly do. We help you make that your superpower."
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