import { BlurFade } from "@/components/ui/blur-fade";
import { Check, X } from "lucide-react";

export function BeforeAfterSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0.2} inView className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight">
            Your identity shift starts small.
          </h2>
        </BlurFade>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <BlurFade delay={0.4} inView className="h-full">
            <div className="h-full bg-background p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-2xl font-bold font-sans mb-8 text-muted-foreground">Before</h3>
              <ul className="space-y-6 font-mono text-lg text-muted-foreground/80">
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 shrink-0">
                    <X className="w-5 h-5" />
                  </div>
                  Overthinking → no action
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 shrink-0">
                    <X className="w-5 h-5" />
                  </div>
                  Streak breaks → momentum gone
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 shrink-0">
                    <X className="w-5 h-5" />
                  </div>
                  Big goals → burnout
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 shrink-0">
                    <X className="w-5 h-5" />
                  </div>
                  Productivity apps → too complex
                </li>
              </ul>
            </div>
          </BlurFade>

          <BlurFade delay={0.6} inView className="h-full">
            <div className="h-full bg-background p-10 rounded-3xl border-2 border-primary/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
              <h3 className="text-2xl font-bold font-sans mb-8 text-foreground">After</h3>
              <ul className="space-y-6 font-mono text-lg">
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  Tiny habits → daily identity XP
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  Two-Day Rule → consistency made human
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  Action chips → calm visual clarity
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  Journaling → auto-documented growth
                </li>
              </ul>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.8} inView className="mt-20 text-center">
          <p className="text-2xl md:text-3xl font-sans font-bold text-primary max-w-3xl mx-auto leading-tight">
            You go from "trying to be disciplined" to <em>being</em> a disciplined person.
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
