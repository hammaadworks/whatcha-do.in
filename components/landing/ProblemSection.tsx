import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";
import { BlurFade } from "@/components/ui/blur-fade";

export function ProblemSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <div className="space-y-10 order-2 lg:order-1">
          <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans tracking-tight leading-tight">
              Have potential... but cant channelize?
            </h2>
          </BlurFade>
          {/* Visual Content */}
          <div className="relative h-full min-h-[400px] flex items-center justify-center">
            <BlurFade delay={0.5} inView className="w-full max-w-md">
              <ActionChipsMockup />
            </BlurFade>
          </div>

          <BlurFade delay={0.4} inView>
            <p className="text-xl font-mono text-muted-foreground leading-relaxed">
              That gnawing sensation. That you're meant for more. You're "The
              Ambitious Underachiever" , brimming with potential, overflowing
              with grand ideas, but perpetually caught in the undertow of
              procrastination, overwhelmed by the sheer magnitude of your
              dreams, haunted by the ghosts of broken streaks, or just
              struggling to *focus* amidst the noise.
            </p>
          </BlurFade>

          <BlurFade delay={0.6} inView>
            <ul className="space-y-6 font-mono text-lg">
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Every
                tool feels rigid & judgmental.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span>{" "}
                Overwhelmed by the sheer magnitude of dreams.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span>{" "}
                Haunted by the ghosts of broken streaks.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span>{" "}
                Yearning for an identity forged in consistent action.
              </li>
            </ul>
          </BlurFade>

          <BlurFade delay={0.8} inView>
            <div className="p-8 border-l-4 border-primary bg-background/80 backdrop-blur-sm rounded-r-xl shadow-md">
              <p className="text-xl font-sans font-bold">
                <span className="text-primary">Enough is enough!</span>{" "}
                <span className="text-foreground">
                  This isn't just another app;
                </span>{" "}
                it's *your* crucible where aspirations transform into unshakable
                reality.{" "}
                <span className="text-primary">Seriously, it's time.</span>
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
