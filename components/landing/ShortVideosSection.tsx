"use client";

import { HeroVideoDialog } from "@/components/shared/HeroVideoDialog"; // Reusing the dialog component
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"; // Import AnimatedGridPattern
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import Link from "next/link"; // Import Link for external playlist

interface ShortVideo {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string; // Optional custom thumbnail
}

const carousel_vids: ShortVideo[] = [
  {
    title: "How I Built It: Part 1",
    description: "The beginning of the whatcha-do.in journey.",
    videoUrl: "https://www.youtube.com/watch?v=Y12dZgGMC2w",
    thumbnailUrl: "/images/short_vid_thumb_1.jpg", // Placeholder thumbnail
  },
  {
    title: "Using whatcha-do.in: Daily Flow",
    description: "A quick look at how I use the app daily.",
    videoUrl: "https://www.youtube.com/shorts/ZKOxGyLIKWI",
    thumbnailUrl: "/images/short_vid_thumb_2.jpg", // Placeholder thumbnail
  },
  // Add more short videos here as they become available
];

const playlist = "https://www.youtube.com/watch?v=lKb_fXQMLa4&list=RDlKb_fXQMLa4&start_radio=1";

export function ShortVideosSection() {
  return (
    <section className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="relative z-10"> {/* Content wrapper for z-index */}
        <div className="mb-16">
          <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4">
              My Journey & Your Testimonials
            </h2>
          </BlurFade>
          <BlurFade delay={0.4} inView>
            <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
              Discover the story behind whatcha-do.in, how I use it daily, and
              hear inspiring testimonials from our community.
            </p>
          </BlurFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {carousel_vids.map((video, index) => (
            <BlurFade key={index} delay={0.1 * index} inView>
              <HeroVideoDialog
                videoUrl={video.videoUrl}
                title={video.title}
                description={video.description}
              >
                <div
                  className={cn(
                    "relative w-full h-48 md:h-64 rounded-lg overflow-hidden cursor-pointer group",
                    "bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center",
                    "hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg"
                  )}
                  style={{
                    backgroundImage: video.thumbnailUrl
                      ? `url(${video.thumbnailUrl})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!video.thumbnailUrl && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {video.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                    <PlayCircle className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </HeroVideoDialog>
            </BlurFade>
          ))}

          {/* Playlist Link Card */}
          <BlurFade delay={0.1 * carousel_vids.length} inView>
            <Link href={playlist} target="_blank" rel="noopener noreferrer">
              <div
                className={cn(
                  "relative w-full h-48 md:h-64 rounded-lg overflow-hidden cursor-pointer group",
                  "bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center p-4",
                  "hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg"
                )}
              >
                <PlayCircle className="h-16 w-16 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-lg md:text-xl font-bold font-sans">
                  Watch the Full Playlist!
                </span>
                <p className="text-white/80 text-sm mt-1">
                  More videos on YouTube
                </p>
              </div>
            </Link>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
