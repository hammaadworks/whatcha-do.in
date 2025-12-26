import { BlurFade } from "@/components/ui/blur-fade";
import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";

export function ProblemSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <div className="space-y-10 order-2 lg:order-1">
          <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans tracking-tight leading-tight">
              For the <span className="text-primary">Lazy Ambitious Underachiever</span>
            </h2>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="text-xl font-mono text-muted-foreground leading-relaxed">
              Because ambitions isn't your problem — your system routine is. <br />
              You're not unmotivated nor lazy. You just lack discipline and a clear path. You're just stuck in the loop:
            </p>
          </BlurFade>

          <BlurFade delay={0.6} inView>
            <ul className="space-y-6 font-mono text-lg">
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Big goals → overwhelming
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> One broken streak → vibe gone
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Too many distractions → no emotional connection
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Waiting for the sweet perfect moment → it never starts.
              </li>
            </ul>
          </BlurFade>

          <BlurFade delay={0.8} inView>
            <div className="p-8 border-l-4 border-primary bg-background/80 backdrop-blur-sm rounded-r-xl shadow-md">
              <p className="text-xl font-sans font-bold">
                whatcha-do.in resets the whole game by helping you build <span className="text-primary">identity</span> with <em>discipline</em> and <em>consistency</em>.
              </p>
            </div>
          </BlurFade>
        </div>

        {/* Visual Content */}
        <div className="relative h-full min-h-[400px] flex items-center justify-center order-1 lg:order-2">
          <BlurFade delay={0.5} inView className="w-full max-w-md">
             <ActionChipsMockup />
          </BlurFade>
        </div>

      </div>
    </section>
  );
}