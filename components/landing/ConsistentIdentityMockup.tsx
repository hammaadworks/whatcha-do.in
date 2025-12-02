import React from "react";
import { cn } from "@/lib/utils";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { User, CheckCircle, Flame, Target } from "lucide-react";

export function ConsistentIdentityMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center bg-card rounded-lg shadow-lg", className)}>
      <h4 className="text-base font-semibold text-center mb-4 relative z-20">Your Consistent Identity</h4>
      
      {/* Central Icon */}
      <div className="relative z-10 flex items-center justify-center mb-4">
        <User className="h-10 w-10 text-primary" />
      </div>

      {/* Orbiting Circles */}
      <div className="relative w-full h-40 flex items-center justify-center">
        <OrbitingCircles
          className="size-8 border-none items-center justify-center bg-accent text-accent-foreground"
          duration={20}
          delay={20}
          radius={60}
          path={false}
        >
          <CheckCircle className="h-4 w-4" />
        </OrbitingCircles>
        <OrbitingCircles
          className="size-8 border-none items-center justify-center bg-accent text-accent-foreground"
          duration={20}
          delay={10}
          radius={60}
          path={false}
          reverse
        >
          <Flame className="h-4 w-4" />
        </OrbitingCircles>
        <OrbitingCircles
          className="size-8 border-none items-center justify-center bg-accent text-accent-foreground"
          duration={20}
          delay={0}
          radius={60}
          path={false}
        >
          <Target className="h-4 w-4" />
        </OrbitingCircles>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Every action builds towards the person you envision.
      </p>
    </div>
  );
}
