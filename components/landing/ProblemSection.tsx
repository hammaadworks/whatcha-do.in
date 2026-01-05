import { ActionChipsMockup } from "@/components/landing/ActionChipsMockup";
import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text"; // Add SparklesText import
import { MagicCard } from "@/components/ui/magic-card"; // Import MagicCard
import { PulseBadge } from "@/components/shared/PulseBadge"; // Import PulseBadge
import { Target } from "lucide-react"; // For target icon
import { UserCircle2 } from "lucide-react"; // For identity icon

export function ProblemSection() {
  return (
    <section className="py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Text Content & ActionChipsMockup */}
        <div className="space-y-10 order-2 lg:order-1">
          <BlurFade delay={0.1} inView>
            <SparklesText>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono tracking-tight leading-tight">
                {"You have the potential... but can't channelize it?"}
              </h2>
            </SparklesText>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p className="text-xl font-mono text-muted-foreground leading-relaxed">
              That gnawing sensation. That you're meant for more. You're "The
              Ambitious Underachiever," brimming with potential, overflowing
              with grand ideas, but perpetually caught in the undertow of
              procrastination, overwhelmed by the sheer magnitude of your
              dreams, haunted by the ghosts of broken streaks, or just
              struggling to <b><u>focus</u></b> amidst the noise.
            </p>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <ul className="space-y-6 font-mono text-lg">
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Need a system to break down dreams into{" "}
                <span className="text-primary">Actionable Steps</span>.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Struggle to define and embody your desired{" "}
                <span className="text-primary">Identity</span>.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Lack clarity on setting and tracking{" "}
                <span className="text-primary">Monthly Targets</span>.
              </li>
              <li className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors shadow-sm">
                <span className="text-primary font-bold text-2xl">→</span> Yearning for an identity forged in consistent action.
              </li>
            </ul>
          </BlurFade>
        </div>

        {/* Right Column - Visual Content for Identities & Targets */}
        <div className="relative h-full min-h-[400px] order-1 lg:order-2 flex flex-col items-center justify-center space-y-8">
          <BlurFade delay={0.3} inView className="w-full max-w-md">
            <ActionChipsMockup />
          </BlurFade>

          <BlurFade delay={0.4} inView className="w-full max-w-sm">
            <MagicCard className="flex flex-col items-center p-6 text-center shadow-lg">
              <UserCircle2 className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold font-mono mb-2">Define Your Identity</h3>
              <p className="text-muted-foreground">
                Become the person who <b><u>does</u></b> the work. Shape your future self with purpose.
              </p>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.3} inView className="w-full max-w-sm">
            <MagicCard className="flex flex-col items-center p-6 text-center shadow-lg">
              <Target className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold font-mono mb-2">Conquer Monthly Targets</h3>
              <p className="text-muted-foreground">
                Set clear, achievable goals and track your progress with precision.
              </p>
            </MagicCard>
          </BlurFade>
        </div>
      </div>
      
      {/* PulseBadge at the bottom */}
      <div className="mt-16 flex justify-center">
        <PulseBadge
          link="/me"
          bannerText="It's time to build your best self."
          badgeText="Start your journey!"
        />
      </div>
    </section>
  );
}
