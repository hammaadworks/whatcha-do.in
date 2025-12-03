import { BlurFade } from "@/components/ui/blur-fade";
import { IconCloud } from "@/components/ui/icon-cloud";
import { BrainCircuit, Sparkles, Bot, LineChart, Zap } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

const aiFeatures = [
  {
    title: "Smart Habit Stacking",
    description: "AI analyzes your routine and suggests the perfect time slots for new habits.",
    icon: <BrainCircuit className="w-6 h-6" />,
  },
  {
    title: "Mood-based Adjustments",
    description: "Feeling low? Your AI coach automatically adjusts your daily load.",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    title: "Deep Insight Reporting",
    description: "Get weekly breakdowns of your identity shift, not just checkboxes.",
    icon: <LineChart className="w-6 h-6" />,
  },
  {
    title: "24/7 Accountability",
    description: "A gentle nudge when you need it, a hype man when you win.",
    icon: <Bot className="w-6 h-6" />,
  },
];

export function AISection() {
  return (
    <section className="py-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="space-y-10">
            <BlurFade delay={0.2} inView>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold font-mono uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Coming Soon
              </div>
            </BlurFade>
            
            <BlurFade delay={0.3} inView>
              <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight leading-tight">
                Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">AI Identity Coach</span>.
              </h2>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <p className="text-xl text-muted-foreground font-mono leading-relaxed">
                It's not just about tracking. It's about evolving. Our AI engine learns your patterns to help you build consistency without the burnout.
              </p>
            </BlurFade>

            <div className="grid sm:grid-cols-2 gap-4">
              {aiFeatures.map((feature, i) => (
                <BlurFade key={i} delay={0.5 + (i * 0.1)} inView>
                  <MagicCard className="p-4 h-full border border-border/50 bg-background/50" gradientColor="#D8B4FE20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-bold font-sans text-base mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{feature.description}</p>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          </div>

          {/* Right: Visuals (Icon Cloud) */}
          <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center">
             <BlurFade delay={0.6} inView className="w-full h-full flex items-center justify-center">
                <div className="relative w-full max-w-lg aspect-square bg-gradient-to-b from-background/0 to-background/80 rounded-full flex items-center justify-center">
                   <IconCloud 
                     iconSlugs={[
                       "openai", "vercel", "react", "typescript", "javascript", "nextdotjs", 
                       "tailwindcss", "nodedotjs", "supabase", "postgresql", "git", "github", 
                       "visualstudiocode", "figma", "framer", "auth0", "stripe", "docker"
                     ]} 
                   />
                   {/* Central AI Core */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 bg-foreground rounded-full flex items-center justify-center shadow-2xl z-10">
                        <Bot className="w-12 h-12 text-background" />
                      </div>
                      <div className="absolute w-32 h-32 bg-purple-500/30 rounded-full animate-pulse z-0" />
                   </div>
                </div>
             </BlurFade>
          </div>

        </div>
      </div>
    </section>
  );
}
