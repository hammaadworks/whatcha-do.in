"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils"; // Added cn import

interface HeroVideoDialogProps {
  children: React.ReactNode;
  videoUrl: string;
  title: string;
  description?: string;
}

export function HeroVideoDialog({
  children,
  videoUrl,
  title,
  description,
}: HeroVideoDialogProps) {
  const embedUrl = React.useMemo(() => {
    // Extract video ID from YouTube URL and construct embed URL
    const videoIdMatch = videoUrl.match(
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }, [videoUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none bg-transparent">
        <DialogHeader className="p-4">
          <DialogTitle className="text-white text-lg">{title}</DialogTitle>
          {description && <DialogDescription className="text-gray-300">{description}</DialogDescription>}
        </DialogHeader>
        {embedUrl ? (
          <div className="relative" style={{ paddingBottom: "56.25%" /* 16:9 Aspect Ratio */ }}>
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              title={title}
              loading="lazy"
            ></iframe>
          </div>
        ) : (
          <div className="p-4 text-red-500">Invalid YouTube URL</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Optional: A button component to easily trigger the dialog
export const HeroVideoTriggerButton: React.FC<{
  videoUrl: string;
  title: string;
  description?: string;
  label?: string;
  className?: string;
}> = ({ videoUrl, title, description, label = "Watch Video", className }) => (
  <HeroVideoDialog videoUrl={videoUrl} title={title} description={description}>
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2", // Default button styles
        className
      )}
    >
      <PlayCircle className="mr-2 h-4 w-4" />
      {label}
    </button>
  </HeroVideoDialog>
);