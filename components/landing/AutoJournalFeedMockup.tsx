import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available

interface JournalEntry {
  id: number;
  icon: string;
  activity: string;
  timestamp: string;
}

const journalEntries: JournalEntry[] = [
  {
    id: 1,
    icon: "🏃‍♂️",
    activity: "Completed a 30-min run.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    icon: "📚",
    activity: "Read 'Atomic Habits' for 15 minutes.",
    timestamp: "Yesterday",
  },
  {
    id: 3,
    icon: "🧘‍♀️",
    activity: "Meditated for 10 minutes.",
    timestamp: "2 days ago",
  },
  {
    id: 4,
    icon: "💧",
    activity: "Drank 8 glasses of water.",
    timestamp: "3 days ago",
  },
  {
    id: 5,
    icon: "📝",
    activity: "Jotted down thoughts on today's progress.",
    timestamp: "4 days ago",
  },
  {
    id: 6,
    icon: "💡",
    activity: "Brainstormed new ideas for a project.",
    timestamp: "5 days ago",
  },
];

export function AutoJournalFeedMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-lg shadow-lg p-4", className)}>
      <div>
        <h4 className="text-base font-semibold text-center mb-3">Your Daily Journal Feed</h4>
        <ScrollArea className="h-40 w-full rounded-md border p-2">
          <AnimatedList delay={100}>
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <span className="text-lg">{entry.icon}</span>
                <div>
                  <p className="text-sm font-medium">{entry.activity}</p>
                  <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
        </ScrollArea>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Your journey, effortlessly documented.
      </p>
    </div>
  );
}
