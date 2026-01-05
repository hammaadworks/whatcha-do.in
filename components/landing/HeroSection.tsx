import { HeroVisuals } from "@/components/landing/HeroVisuals";
import { HeroVideoTriggerButton } from "@/components/shared/HeroVideoDialog"; // New Import
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BlurFade } from "@/components/ui/blur-fade"; // Re-added import
import { PrimaryCtaButton } from "@/components/ui/primary-cta-button"; // Changed to PrimaryCtaButton
import { RetroGrid } from "@/components/ui/retro-grid.tsx";
import { IDENTITY_COLORS, SEE_HOW_VID } from "@/lib/constants";
import Link from "next/link";
import { PulseBadge } from "../shared/PulseBadge";

// Helper function to generate a random 5-letter string
const generateRandomInitials = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  return characters.charAt(Math.floor(Math.random() * charactersLength));;
};

// Helper function to get a random color class from IDENTITY_COLORS
const getRandomColorClass = () => {
  return IDENTITY_COLORS[Math.floor(Math.random() * IDENTITY_COLORS.length)];
};

// Function to generate an array of random avatars
const generateRandomAvatars = (count: number) => {
  const avatars = [];
  for (let i = 0; i < count; i++) {
    avatars.push({
      initials: generateRandomInitials(),
      color: getRandomColorClass(),
    });
  }
  return avatars;
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 overflow-hidden pt-20 lg:pt-0">
      <RetroGrid className="z-0 opacity-40 dark:opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left Column: Text */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">

          <PulseBadge 
          link={"/me"}
          bannerText={"Build Your Identity. One Day At A Time."}
          badgeText={"Alpha"} />

          <BlurFade delay={0.2} inView>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-mono tracking-tighter text-foreground leading-none">
              Stop Dreaming. Start Doing.
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl font-sans text-muted-foreground/80">
                So <span className="tracking-widest">...</span>
              </span>{" "}
              whatcha doin?
            </h1>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="text-xl md:text-2xl font-mono text-muted-foreground max-w-xl leading-relaxed">
              Reclaim your narrative, build your empire. <br />
              <span className="font-bold text-foreground underline decoration-primary/50 decoration-4 underline-offset-4">
                whatcha-do.in
              </span>{" "}
              is the crucible for **unshakable discipline, consistent action**,
              and transforming dreams into undeniable reality, even when your
              brain tries to ghost you.
            </p>
          </BlurFade>
          <BlurFade delay={0.6} inView>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            
              <HeroVideoTriggerButton
                videoUrl={SEE_HOW_VID}
                title="whatcha-do.in: Official Walkthrough"
                description="Get a complete overview of whatcha-do.in and how it helps you build your identity, discipline, and achieve your dreams."
                label="See How"
                className="h-14 px-8 text-lg font-bold font-sans shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-transparent border border-primary text-primary hover:bg-primary/10"
              />

              <Link href="/me">
                <PrimaryCtaButton className="h-14 px-8 text-lg font-bold font-sans shadow-2xl transition-transform hover:scale-105 active:scale-95">
                  Your Empire Awaits. Build It.
                </PrimaryCtaButton>
              </Link>

            </div>
          </BlurFade>

          <BlurFade delay={0.8} inView>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono opacity-90">
              <div className="flex -space-x-2">
                {generateRandomAvatars(5).map((avatar, index) => (
                  <Avatar
                    key={index}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarFallback className={"text-white"}>
                      {avatar.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>

              <p>
                Joined by many ambitious underachievers, just like you. Your
                glow-up starts now!
              </p>
            </div>
          </BlurFade>
        </div>

        {/* Right Column: Visuals */}
        <div className="relative lg:h-[600px] flex items-center justify-center">
          <BlurFade delay={0.5} inView className="w-full">
            <HeroVisuals />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
