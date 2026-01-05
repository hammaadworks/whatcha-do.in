import {BlurFade} from "@/components/ui/blur-fade"; // Re-added import
import Link from "next/link";
import {PrimaryCtaButton} from "@/components/ui/primary-cta-button"; // Changed to PrimaryCtaButton
import { HeroVideoTriggerButton } from "@/components/ui/HeroVideoDialog"; // New Import
import {HeroVisuals} from "@/components/landing/HeroVisuals";
import {RetroGrid} from "@/components/ui/retro-grid.tsx";
const SEE_HOW_VID = "https://www.youtube.com/shorts/8LoehKZvbNc"
const TUTORIAL_VID = "https://www.youtube.com/watch?v=R-0aUl0iQBg&list=PLWI_DJgO8kW8xVD0N4LyAFd6kAzJEbacx"
export function HeroSection() {
    return (<section
            className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 overflow-hidden pt-20 lg:pt-0">
            <RetroGrid className="z-0 opacity-40 dark:opacity-20"/>

            <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* Left Column: Text */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">

                    {/* Pulsating Badge */}
                    <BlurFade delay={0.1} inView>
                        <Link href="/me">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-mono shadow-sm hover:bg-primary/15 transition-colors cursor-pointer">
                <span className="relative flex h-2 w-2">
                  <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                                Build Your Identity. One Day At A Time.
                                <span
                                    className="text-xs font-mono text-primary-foreground bg-primary rounded-full px-2 py-0.5 ml-2">Alpha</span>
                                <span 
                                    className="ml-1 inline-block"
                                    style={{
                                        animation: "moveRightFade 1.5s ease-in-out infinite"
                                    }}
                                >
                                    &gt;
                                </span>
                            </div>
                        </Link>
                    </BlurFade>

                    <BlurFade delay={0.2} inView>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-mono tracking-tighter text-foreground leading-none">
                            Stop Dreaming. Start Doing.<br/>
                            <span className="text-4xl md:text-5xl lg:text-6xl font-sans text-muted-foreground/80">So <span className="tracking-widest">...</span></span> whatcha doin?
                        </h1>
                    </BlurFade>

                    <BlurFade delay={0.4} inView>
                        <p className="text-xl md:text-2xl font-mono text-muted-foreground max-w-xl leading-relaxed">
                            Reclaim your narrative, build your empire. <br/>
                            <span className="font-bold text-foreground underline decoration-primary/50 decoration-4 underline-offset-4">whatcha-do.in</span> is the crucible for **unshakable discipline, consistent action**, and transforming dreams into undeniable reality, even when your brain tries to ghost you.
                        </p>
                    </BlurFade>
                    <BlurFade delay={0.6} inView>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                            <Link href="/me">
                                <PrimaryCtaButton
                                    className="h-14 px-8 text-lg font-bold font-sans shadow-2xl transition-transform hover:scale-105 active:scale-95"
                                >
                                    Your Empire Awaits. Build It.
                                </PrimaryCtaButton>
                            </Link>
                            <HeroVideoTriggerButton
                                videoUrl={SEE_HOW_VID}
                                title="whatcha-do.in: Official Walkthrough"
                                description="Get a complete overview of whatcha-do.in and how it helps you build your identity, discipline, and achieve your dreams."
                                label="See How"
                                className="h-14 px-8 text-lg font-bold font-sans shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-transparent border border-primary text-primary hover:bg-primary/10"
                            />
                        </div>
                    </BlurFade>

                    <BlurFade delay={0.8} inView>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono opacity-80">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (<div key={i}
                                                             className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 dark:bg-gray-700"/>))}
                            </div>
                            <p>Joined by many ambitious underachievers, just like you. Your glow-up starts now!</p>
                        </div>
                    </BlurFade>
                </div>

                {/* Right Column: Visuals */}
                <div className="relative lg:h-[600px] flex items-center justify-center">
                    <BlurFade delay={0.5} inView className="w-full">
                        <HeroVisuals/>
                    </BlurFade>
                </div>

            </div>
        </section>);
}
