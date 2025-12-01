"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";

export function BeforeAfterSection() {
  return (
    <section className="py-24 px-4 w-full bg-secondary/20 border-t border-border/40">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <BlurFade delay={0.2} inView>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your identity shift <span className="text-primary">starts small.</span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
             <p className="text-xl text-muted-foreground">
               You go from &quot;trying to be disciplined&quot; to <span className="text-foreground font-bold italic">being</span> a disciplined person.
             </p>
          </BlurFade>
        </div>

        {/* Comparison Terminals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Before Terminal */}
            <BlurFade delay={0.4} inView>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-destructive text-center">Before</h3>
                    <Terminal className="min-h-[300px] border-destructive/30 bg-destructive/5 shadow-lg">
                         <AnimatedSpan delay={500} className="text-destructive">
                            <span>✖ [ERROR] Process &apos;Overthinking&apos; caused loop timeout.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={1500} className="text-destructive/80">
                            <span>⚠ [WARN] Streak broke at day 3. Momentum lost.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={2500} className="text-destructive/80">
                            <span>⚠ [WARN] Goal buffer overflow: &quot;Big Goals&quot; too large for memory.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={3500} className="text-muted-foreground">
                            <span>&gt; System crash. Rebooting in procrastination mode...</span>
                         </AnimatedSpan>
                    </Terminal>
                </div>
            </BlurFade>

            {/* After Terminal */}
            <BlurFade delay={0.5} inView>
                <div className="space-y-4">
                     <h3 className="text-xl font-bold text-primary text-center">After</h3>
                    <Terminal className="min-h-[300px] border-primary/30 bg-primary/5 shadow-lg">
                         <AnimatedSpan delay={500} className="text-green-500">
                            <span>✔ [SUCCESS] Tiny habit executed (+10 Identity XP).</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={1500} className="text-green-500">
                            <span>✔ [INFO] Two-Day Rule active: Streak preserved.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={2500} className="text-green-500">
                            <span>✔ [SUCCESS] Action Chip deployed. Visual clarity: 100%.</span>
                         </AnimatedSpan>
                         <TypingAnimation delay={3500} className="text-primary font-bold">
                            &gt; Auto-journaling growth... Done.
                         </TypingAnimation>
                    </Terminal>
                </div>
            </BlurFade>

        </div>
      </div>
    </section>
  );
}
