import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AUTHOR_NAME, AUTHOR_TWITTER_HANDLE } from "@/lib/constants";

export function ProfileMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-full flex flex-col bg-background rounded-lg shadow-lg overflow-hidden p-2", className)}>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-600 h-1/4 flex items-center justify-center relative rounded-t-md">
        <h3 className="relative z-10 text-white text-base font-bold">whatcha-do.in</h3>
      </div>

      {/* Profile Info */}
      <div className="flex-1 p-2 -mt-8 relative z-20 flex flex-col items-center">
        <Avatar className="w-16 h-16 border-2 border-background shadow-md">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h4 className="text-base font-semibold mt-1">{AUTHOR_NAME}</h4>
        <p className="text-xs text-muted-foreground">{AUTHOR_TWITTER_HANDLE}</p>
        <p className="text-center text-xs mt-1 max-w-xs px-1">
          Building habits, tracking progress, and becoming unstoppable.
        </p>

        {/* Streaks and Habits */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-center w-full px-2">
          <div>
            <p className="text-xl font-bold text-primary">42</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Active Habits</p>
          </div>
        </div>

        {/* Habit Progress */}
        <div className="mt-3 space-y-2 w-full px-2">
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs px-1 py-0.5">Read 30 min</Badge>
            <Progress value={70} className="flex-grow h-1.5" />
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs px-1 py-0.5">Drink 8 glasses</Badge>
            <Progress value={90} className="flex-grow h-1.5" />
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs px-1 py-0.5">Exercise</Badge>
            <Progress value={40} className="flex-grow h-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
