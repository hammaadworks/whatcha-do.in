"use client";

import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function CTASection() {
  return (
    <section className="relative py-32 px-4 w-full overflow-hidden bg-background border-t border-border/40">
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto">
        
        <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
              It&apos;s <span className="text-primary">build-your-identity</span> o&apos;clock.
            </h2>
        </BlurFade>

        <BlurFade delay={0.4} inView>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                You&apos;ve imagined the best version of you long enough.<br/>
                Here&apos;s the simplest way to start — today, in the tiniest way.
            </p>
        </BlurFade>
        
        <BlurFade delay={0.6} inView>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Link href="/logins">
                    <ShimmerButton className="shadow-2xl" background="var(--primary)">
                        <span className="whitespace-pre-wrap text-center text-xl font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                            Start Building Your Identity
                        </span>
                    </ShimmerButton>
                </Link>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
                Identity is built daily. Today is ready when you are.
            </p>
        </BlurFade>

        <BlurFade delay={0.8} inView>
            <blockquote className="mt-12 border-l-4 border-primary pl-6 py-2 text-xl italic text-muted-foreground text-left max-w-lg mx-auto bg-secondary/20 rounded-r-lg">
                "A year from now, they'll ask how you did it. <br/>
                You'll say: <span className="text-primary font-bold">'I just didn't miss two days.'</span>"
            </blockquote>
        </BlurFade>
      </div>
    </section>
  );
}
