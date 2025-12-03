import { BlurFade } from "@/components/ui/blur-fade";
import { CheckCircle, XCircle } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

export function StillUnsureSection() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-20">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight mb-6">
            Still wondering if it's for you?
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono">
            Let's be honest about who this is really for.
          </p>
        </BlurFade>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <BlurFade delay={0.4} inView className="h-full">
          <div className="relative h-full p-8 rounded-3xl border bg-muted/20 backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6 text-muted-foreground">
              <XCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">It's NOT for you if...</h3>
            </div>
            <ul className="space-y-4 font-mono text-sm md:text-base text-muted-foreground/80 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> You are already perfectly consistent with every goal.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> You never procrastinate, overthink, or hesitate.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> You have a photographic memory of your life's progress.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> You enjoy complex, bureaucratic project management tools.
              </li>
            </ul>
          </div>
        </BlurFade>

        <BlurFade delay={0.6} inView className="h-full">
          <div className="relative h-full p-8 rounded-3xl border bg-background shadow-2xl flex flex-col overflow-hidden group">
            <BorderBeam size={300} duration={12} delay={9} />
            <div className="flex items-center gap-3 mb-6 text-primary">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">It IS for you if...</h3>
            </div>
            <ul className="space-y-4 font-mono text-sm md:text-base text-foreground flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You have big ambitions but struggle with daily execution.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You get overwhelmed by "all or nothing" thinking.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You lose motivation the moment a streak breaks.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You want a tool that feels like a sidekick, not a boss.
              </li>
            </ul>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}