import { BlurFade } from "@/components/ui/blur-fade";
import { Quote } from "lucide-react";
import { ConsistentIdentityMockup } from "@/components/landing/ConsistentIdentityMockup";

export function BackstorySection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Visual Content */}
        <div className="relative h-full min-h-[400px] flex items-center justify-center">
           <BlurFade delay={0.2} inView className="w-full max-w-md">
              <ConsistentIdentityMockup />
           </BlurFade>
        </div>

        {/* Text Content */}
        <div className="space-y-12">
          <BlurFade delay={0.3} inView>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Quote className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-mono font-bold tracking-wider uppercase text-muted-foreground">The Origin Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight">
              Born from an iconic question.
            </h2>
          </BlurFade>

          <BlurFade delay={0.5} inView>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <p className="text-2xl md:text-3xl font-serif italic text-foreground leading-relaxed">
                  Every episode, Isabella walks up with that curious smile and asks: <br />
                  <span className="text-primary font-bold">"Whatcha doin'?"</span>
                </p>
                
                <div className="w-16 h-1 bg-primary/20 rounded-full" />

                <div className="space-y-4 text-lg font-mono text-muted-foreground leading-relaxed">
                  <p>
                    Phineas always had an answer. Not because he was perfect, but because he always had <span className="text-foreground font-semibold underline decoration-wavy decoration-primary/30">something</span> cooking.
                  </p>
                  <p>
                    <span className="font-bold text-foreground">whatcha-do.in</span> captures that same spark: curious, creative, always building, even if it's tiny.
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.7} inView>
            <blockquote className="text-xl font-sans font-medium text-foreground/80 border-l-2 border-primary/50 pl-6">
              "Your life is a series. Your habits are the episodes. <br className="hidden md:block" /> 
              <span className="text-primary">Your identity is the arc.</span>"
            </blockquote>
          </BlurFade>
        </div>

      </div>
    </section>
  );
}
