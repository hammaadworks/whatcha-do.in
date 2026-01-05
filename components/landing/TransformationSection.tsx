import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { HabitShowcase } from "@/components/landing/HabitShowcase"; // Import the new component
import { PulseBadge } from "../shared/PulseBadge";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"; // Import AnimatedGridPattern

export function TransformationSection() {
    return (
        <section className="py-32 px-4 md:px-8 bg-background relative overflow-hidden">
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={10}
                repeatDelay={1}
                className="[mask-image:radial-gradient(ellipse_at_center,white,transparent)] z-0"
            />
            <div className="max-w-7xl mx-auto text-center space-y-12 z-10 relative">
                <BlurFade delay={0.1} inView>
                    <h2 className="text-5xl md:text-6xl font-bold font-mono tracking-tight text-foreground">
                        <SparklesText>Forge Your Identity</SparklesText>: the "Atomic Habits" way
                    </h2>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                    <p className="text-xl md:text-2xl font-mono text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        Inspired by James Clear's <a href="https://jamesclear.com/atomic-habits-summary" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary-foreground">"Atomic Habits"</a>, we've engineered a habit system that truly works.
                        Forget willpower; our app focuses on making habits inevitable by reducing friction and building
                        identity-based habits. We embrace the "Two-Day Rule"—never miss twice—to build resilience,
                        and visualize your progress with intuitive "Today", "Yesterday", and "Pile" boxes,
                        alongside robust streak calculations. This isn't just tracking; it's transforming.
                    </p>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                    <p className="text-2xl md:text-3xl font-bold font-sans text-primary leading-relaxed max-w-4xl mx-auto">
                        This isn't just a shift; it's a *revolution*. Prepare to be amazed at the identity you're about to forge.
                    </p>
                </BlurFade>

                {/* Habit Showcase Component */}
                <BlurFade delay={0.7} inView>
                    <HabitShowcase />
                </BlurFade>

                          <PulseBadge 
                          link={"/me"}
                          bannerText={"Start building your habits."}
                          badgeText={"Now"} />
            </div>
        </section>
    );
}
