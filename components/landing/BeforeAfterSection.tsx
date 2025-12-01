"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";

export function BeforeAfterSection() {
  return (
    <section className="py-24 px-4 w-full bg-background/80 backdrop-blur-sm border-t border-border/40">
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
                    <Terminal className="min-h-[300px] border-destructive/50 bg-destructive/10 shadow-lg">
                         <TypingAnimation delay={200}>&gt; run_old_system.sh</TypingAnimation>
                         <AnimatedSpan delay={800} className="text-red-500">
                            <span>ERROR: Goal (Big) out of scope. Exception: Overwhelmed.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={1800} className="text-red-500/80">
                            <span>WARNING: Streak-breaker detected. Vibe.exe terminated.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={2800} className="text-red-500/80">
                            <span>FAILURE: System too complex. User input: "Wait for perfect moment."</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={3800} className="text-red-500">
                            <span>CRITICAL: Procrastination loop initiated. Status: Stuck.</span>
                         </AnimatedSpan>
                         <TypingAnimation delay={4800} className="text-destructive font-bold">
                            &gt; System Halt. Identity: FRAGMENTED. _
                         </TypingAnimation>
                    </Terminal>
                </div>
            </BlurFade>

            {/* After Terminal */}
            <BlurFade delay={0.5} inView>
                <div className="space-y-4">
                     <h3 className="text-xl font-bold text-primary text-center">After</h3>
                    <Terminal className="min-h-[300px] border-primary/50 bg-primary/10 shadow-lg">
                         <TypingAnimation delay={200}>&gt; run_whatcha_doin.sh</TypingAnimation>
                         <AnimatedSpan delay={800} className="text-green-500">
                            <span>SUCCESS: tiny_habit.execute() -&gt; +10 Identity XP.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={1800} className="text-green-500">
                            <span>INFO: Two-Day Rule: Streak rescued. Consistency engine active.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={2800} className="text-blue-500">
                            <span>ACTION: chip.drag_drop_done() -&gt; Brain-friendly productivity.</span>
                         </AnimatedSpan>
                         <AnimatedSpan delay={3800} className="text-muted-foreground">
                            <span>LOG: auto_journal.update() -&gt; Growth documented.</span>
                         </AnimatedSpan>
                         <TypingAnimation delay={4800} className="text-primary font-bold">
                            &gt; System Optimized. Identity: DISCIPLINED. _
                         </TypingAnimation>
                    </Terminal>
                </div>
            </BlurFade>

        </div>
      </div>
    </section>
  );
}
