"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroVideoDialog } from "@/components/ui/HeroVideoDialog"; // Reusing the dialog component

interface ShortVideo {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string; // Optional custom thumbnail
}

const shortVideos: ShortVideo[] = [
  {
    title: "Quick Peek: Daily Habits",
    description: "See how effortlessly you can track and manage your daily habits.",
    videoUrl: "https://www.youtube.com/shorts/r5yn3RunfMk",
    thumbnailUrl: "/images/short_vid_thumb_1.jpg", // Placeholder thumbnail
  },
  {
    title: "Journaling in a Flash",
    description: "A 30-second dive into our powerful two-sided journal.",
    videoUrl: "https://www.youtube.com/watch?v=R-0aUl0iQBg", // Placeholder for IG or another short
    thumbnailUrl: "/images/short_vid_thumb_2.jpg", // Placeholder thumbnail
  },
  // Add more short videos here as they become available
];

export function ShortVideosSection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
      <div className="mb-16">
        <BlurFade delay={0.2} inView>
          <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            See whatcha-do.in in Action!
          </h2>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Quick glimpses into how our features empower your journey.
          </p>
        </BlurFade>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shortVideos.map((video, index) => (
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
                  backgroundImage: video.thumbnailUrl ? `url(${video.thumbnailUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!video.thumbnailUrl && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{video.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                  <PlayCircle className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </HeroVideoDialog>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
