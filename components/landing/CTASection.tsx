import { BlurFade } from "@/components/ui/blur-fade";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CoolMode } from "@/components/ui/cool-mode";

export function CTASection() {
  return (
    <section className="py-40 px-4 md:px-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        <BlurFade delay={0.2} inView>
          <h2 className="text-5xl md:text-7xl font-bold font-sans tracking-tighter leading-tight">
            It's <span className="text-primary">build-your-identity</span> o'clock.
          </h2>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <p className="text-xl md:text-3xl font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            You&apos;ve imagined the best version of you long enough. <br />
            Here&apos;s the simplest way to start — today, in the tiniest way.
          </p>
          <p className="mt-8 text-2xl md:text-3xl font-sans font-bold text-foreground">
            Identity is built daily. <br />
            Today is ready when you are.
          </p>
        </BlurFade>

        <BlurFade delay={0.6} inView>
          <div className="flex justify-center pt-8">
            <CoolMode>
<<<<<<< Updated upstream
              <Link href="/me">
                <ShimmerButton className="h-16 px-12 text-xl font-bold font-sans rounded-full shadow-2xl hover:scale-105 transition-transform duration-300"
                               background="var(--primary)"
                               shimmerColor="rgba(255, 255, 0.4)">
||||||| Stash base
              <RainbowButton className="h-16 px-12 text-xl font-bold font-sans rounded-full shadow-2xl hover:scale-105 transition-transform duration-300">
                <Link href="/logins">
=======
              <Link href="/logins">
                <ShimmerButton 
                  className="h-16 px-12 text-xl font-bold font-sans shadow-2xl hover:scale-105 transition-transform duration-300"
                  background="var(--primary)"
                  shimmerColor="var(--background)"
                >
>>>>>>> Stashed changes
                  Start Building Your Identity
                </ShimmerButton>
              </Link>
            </CoolMode>
          </div>
        </BlurFade>

        <BlurFade delay={0.8} inView>
          <blockquote className="text-xl md:text-2xl font-mono italic opacity-60 mt-16 max-w-2xl mx-auto">
              &apos;&apos;A year from now, they&apos;ll ask how you did it. <br />
            You&apos;ll say: &apos;I just didn&apos;t miss two days.&apos;&apos;&apos;
          </blockquote>
        </BlurFade>
      </div>
    </section>
  );
}