import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function TransformationSection() {
    return (
        <section className="py-32 px-4 md:px-8 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center space-y-12">
                <BlurFade delay={0.1} inView>
                    <h2 className="text-5xl md:text-6xl font-bold font-mono tracking-tight text-foreground">
                        <SparklesText>Forge Your Identity</SparklesText>: The Whatcha-do.in Difference
                    </h2>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                    <p className="text-xl md:text-2xl font-mono text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        We don't just understand the psychology of consistency; we've{" "}
                        <span className="font-bold text-foreground">engineered it into every pixel and line of code</span>.{" "}
                        whatcha-do.in is meticulously designed to obliterate friction, eradicate stress, and supercharge your pure productivity, fundamentally revolutionizing your entire approach to personal growth. Say goodbye to analysis paralysis, say hello to doing the work.
                    </p>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                    <p className="text-2xl md:text-3xl font-bold font-sans text-primary leading-relaxed max-w-4xl mx-auto">
                        This isn't just a shift; it's a *revolution*. Prepare to be amazed at the identity you're about to forge.
                    </p>
                </BlurFade>

                <BlurFade delay={0.7} inView>
                    <Link href="/features" className="inline-flex h-9 w-fit items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 shadow-md transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700 dark:focus:ring-offset-neutral-900">
                        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 dark:text-neutral-400 dark:hover:text-neutral-100">
                            <span>Learn more about our unique approach</span>
                            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                        </AnimatedShinyText>
                    </Link>
                </BlurFade>
            </div>
        </section>
    );
}
