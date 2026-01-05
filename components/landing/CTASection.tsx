import {BlurFade} from "@/components/ui/blur-fade";
import Link from "next/link";
import {PrimaryCtaButton} from "@/components/ui/primary-cta-button";
import {CoolMode} from "@/components/ui/cool-mode";
import {SparklesText} from "@/components/ui/sparkles-text"; // Add SparklesText import
import {PulseBadge} from "@/components/shared/PulseBadge"; // Add PulseBadge import

export function CTASection() {
    return (<section className="py-40 px-4 md:px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"/>

            <div className="max-w-4xl mx-auto relative z-10 space-y-12">
                <BlurFade delay={0.1} inView>
                    <SparklesText>
                        <h2 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter leading-tight">
                            Your Journey Awaits: <span className="text-primary">Stop Hesitating. Start Dominating.</span>
                        </h2>
                    </SparklesText>
                </BlurFade>

                <BlurFade delay={0.2} inView>
                    <p className="text-xl md:text-3xl font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        You&apos;ve spent enough time dreaming. The best version of you is waiting. <br/>
                        Here&apos;s the simplest, most exhilarating way to start — right now, today. Don't wait.
                    </p>
                    <p className="mt-8 text-2xl md:text-3xl font-mono font-bold text-foreground">
                        Identity is built daily. <br/>
                        Prepare to be <b><u>amazed</u></b> by who you become.
                    </p>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                    <div className="flex justify-center pt-8">
                        <CoolMode>
                            <PulseBadge
                                link="/me"
                                bannerText="Your Empire Awaits. Build It."
                                badgeText="Reclaim Yourself"
                            />
                        </CoolMode>
                    </div>
                </BlurFade>

                <BlurFade delay={0.4} inView>
                    <blockquote className="text-xl md:text-2xl font-mono italic opacity-60 mt-16 max-w-2xl mx-auto">
                        &apos;&apos;A year from now, they&apos;ll ask how you did it. <br/>
                        You&apos;ll say: &apos;I just didn&apos;t miss two days.&apos;&apos;&apos;
                    </blockquote>
                </BlurFade>
            </div>
        </section>);
}