"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Check, X, Zap, AlertTriangle, Layers, PlayCircle } from "lucide-react";

const problems = [
  {
    icon: Layers,
    title: "Big goals → Overwhelming",
    description: "Big goals → overwhelming", // Matching copy strictly
  },
  {
    icon: Zap,
    title: "One broken streak → vibe gone",
    description: "One broken streak → vibe gone",
  },
  {
    icon: X,
    title: "Too many apps → no emotional connection",
    description: "Too many apps → no emotional connection",
  },
  {
    icon: PlayCircle,
    title: "Waiting for the perfect moment → never starts",
    description: "Waiting for the perfect moment → never starts",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 px-4 w-full bg-background relative overflow-hidden border-t border-border/40">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <BlurFade delay={0.2} inView>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Ambition isn&apos;t your problem — <br />
              <span className="text-primary">your system is.</span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You&apos;re not unmotivated. You&apos;re just stuck in the &quot;ambitious underachiever&quot; loop:
            </p>
          </BlurFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((item, idx) => (
            <BlurFade key={idx} delay={0.4 + idx * 0.1} inView>
              <div className="flex items-center space-x-4 p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {item.title}
                  </h3>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.8} inView>
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <p className="text-2xl font-medium text-foreground">
              whatcha-doin resets the whole game by helping you build <span className="text-primary font-bold">identity</span>, not pressure.
            </p>
            <blockquote className="border-l-4 border-primary pl-6 py-2 text-lg italic text-muted-foreground text-left mx-auto max-w-xl bg-secondary/10 rounded-r-lg">
              &quot;Identity drives habits. Habits drive identity. We make the loop work for you.&quot;
            </blockquote>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
