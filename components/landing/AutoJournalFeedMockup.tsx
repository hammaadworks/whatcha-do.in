"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available

interface AutoJournalFeedMockupProps {
  className?: string;
  title: string;
  mockContent: string;
  isPublic: boolean;
}

interface JournalEntry {
  id: number;
  icon: string;
  activity: string;
  timestamp: string;
}

const privateJournalEntries: JournalEntry[] = [
  { id: 1, icon: "💭", activity: "Reflected on today's challenges.", timestamp: "Just now" },
  { id: 2, icon: "🚧", activity: "Struggled with procrastination on Project X. Need a new strategy.", timestamp: "1 hour ago" },
  { id: 3, icon: "💡", activity: "Brainstormed new ideas for a personal project. Feeling inspired.", timestamp: "Yesterday" },
  { id: 4, icon: "🤷‍♂️", activity: "Questioned my commitment to habit Y. Re-evaluated my 'why'.", timestamp: "2 days ago" },
  { id: 5, icon: "😅", activity: "Survived another intense workout. Proud of the effort.", timestamp: "3 days ago" },
];

const publicJournalEntries: JournalEntry[] = [
  { id: 1, icon: "✅", activity: "Completed critical task for Project Alpha.", timestamp: "Just now" },
  { id: 2, icon: "🚀", activity: "Launched new feature for product beta.", timestamp: "1 hour ago" },
  { id: 3, icon: "📚", activity: "Finished reading 'The Obstacle Is The Way'.", timestamp: "Yesterday" },
  { id: 4, icon: "🏋️", activity: "Hit a new personal record in deadlifts.", timestamp: "2 days ago" },
  { id: 5, icon: "🤝", activity: "Collaborated on a successful team initiative.", timestamp: "3 days ago" },
];

export function AutoJournalFeedMockup({ className, title, mockContent, isPublic }: AutoJournalFeedMockupProps) {
  const entries = isPublic ? publicJournalEntries : privateJournalEntries;
  const footerText = isPublic
    ? "Your curated story, shared with the world."
    : "Your raw, unedited thoughts and progress.";

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-lg shadow-lg p-4", className)}>
      <div>
        <h4 className="text-base font-semibold font-mono text-center mb-3">{title}</h4>
        <ScrollArea className="h-40 w-full rounded-md border p-2">
          <AnimatedList delay={100}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <span className="text-lg">{entry.icon}</span>
                <div>
                  <p className="text-sm font-medium font-mono">{entry.activity}</p>
                  <p className="text-xs font-mono text-muted-foreground">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
          {/* Display mockContent below the animated list, for more free-form thoughts */}
          <p className="text-sm font-mono text-muted-foreground mt-4 p-2 border-t border-dashed border-border">
            {mockContent}
          </p>
        </ScrollArea>
      </div>
      <p className="text-center text-xs font-mono text-muted-foreground mt-4">
        {footerText}
      </p>
    </div>
  );
}

