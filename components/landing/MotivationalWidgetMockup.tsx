"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"; // Import AnimatedShinyText

export function MotivationalWidgetMockup({ className }: { className?: string }) {
  const quote = "The journey of a thousand miles begins with a single step.";
  const author = "Lao Tzu";

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <MagicCard
        className="flex flex-col items-center justify-center shadow-lg p-8 text-center w-full max-w-xs mx-auto sm:p-8"
        gradientColor="#e5e7eb" // A light gray gradient for subtle effect
      >
        <AnimatedShinyText className="text-xl font-medium italic mb-4 break-words pl-4">
          "{quote}"
        </AnimatedShinyText>
        <p className="text-sm text-muted-foreground">- {author}</p>
      </MagicCard>
    </div>
  );
}
