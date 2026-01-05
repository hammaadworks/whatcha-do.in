import { BlurFade } from "@/components/ui/blur-fade";
import { CheckCircle, XCircle } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

export function StillUnsureSection() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-20">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight mb-6">
            <span className="text-primary">Still on the fence?</span> <br/> Good. Let's make this crystal clear.
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono">
            This isn't for everyone. It's for YOU if you're ready for real change.
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
                <span className="text-muted-foreground/50 mt-1">•</span> You're already a perfect, hyper-consistent cyborg. (Congrats? Maybe you need a hobby.)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> Procrastination? Overthinking? Hesitation? Never heard of 'em.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> Your memory is flawless, and you naturally celebrate every tiny win.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-1">•</span> You *love* complex, clunky, soul-crushing project management tools.
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
                <span className="text-primary mt-1">→</span> You're exhausted by the restart cycle, ready for real discipline & consistency.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You're an ambitious underachiever, overflowing with dreams but needing a system to actually *do the work*.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> Your brain sometimes jumps around (hello, ADHD fam!), and you need a tool that works WITH you, not against you.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span> You crave an identity forged in consistent action and are ready to be *amazed* by your own transformation.
              </li>
            </ul>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}