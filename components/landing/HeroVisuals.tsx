"use client";

import React from "react";
import { ActionItem } from "@/components/shared/ActionItem";
import { HabitChipPublic } from "@/components/habits/HabitChipPublic";
import { ActionNode, Habit } from "@/lib/supabase/types";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const mockActions: ActionNode[] = [
  {
    id: "1",
    description: "Build the greatest roller coaster",
    completed: false,
    children: [
      {
        id: "1-1",
        description: "Gather supplies",
        completed: true,
        children: [],
        is_public: true
      },
      {
        id: "1-2",
        description: "Design the loop-de-loop",
        completed: false,
        children: [],
        is_public: true
      }
    ],
    is_public: true
  },
  {
    id: "2",
    description: "Give Perry a bath",
    completed: false,
    children: [],
    is_public: true
  }
];

const mockHabits: Habit[] = [
  {
    id: "h1",
    user_id: "mock",
    name: "Seize the Day",
    is_public: true,
    current_streak: 104,
    last_streak: 104,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
<<<<<<< Updated upstream
||||||| Stash base
=======
    junked_at: null,
>>>>>>> Stashed changes
    pile_state: "today",
    goal_value: 1,
    goal_unit: "adventure",
    junked_at: null
  },
  {
    id: "h2",
    user_id: "mock",
    name: "Invent Something",
    is_public: true,
    current_streak: 12,
    last_streak: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
<<<<<<< Updated upstream
||||||| Stash base
=======
    junked_at: null,
>>>>>>> Stashed changes
    pile_state: "today",
    goal_value: 1,
    goal_unit: "invention",
    junked_at: null
  }
];

export function HeroVisuals({ className }: { className?: string }) {
  const [date, setDate] = React.useState("");

  React.useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className={cn("relative w-full max-w-[500px] mx-auto", className)}>
      {/* Main Card representing the Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <MagicCard 
          className="flex flex-col gap-6 p-6 border shadow-2xl bg-background/80 backdrop-blur-md"
          gradientColor="#FF6B6B20"
        >
          {/* Header Mockup */}
          <div className="flex items-center justify-between border-b pb-4 border-border/50">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold font-sans">Dashboard</h3>
              <p className="text-xs text-muted-foreground font-mono">Today, {date}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              P&F
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Current Mission</h4>
            <div className="space-y-2">
              {mockActions.map(action => (
                <div key={action.id} className="pointer-events-none">
                    <ActionItem 
                        action={action} 
                        level={0}
                        focusedActionId={null}
                        setFocusedActionId={() => {}}
                        flattenedActions={[]}
                        // Pass no-op handlers to prevent interaction but allow rendering
                        onActionToggled={() => {}}
                    />
                </div>
              ))}
            </div>
          </div>

          {/* Habits Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Identity Stack</h4>
            <div className="flex flex-wrap gap-2">
              {mockHabits.map(habit => (
                <div key={habit.id} className="pointer-events-none">
                    <HabitChipPublic habit={habit} disableClick />
                </div>
              ))}
            </div>
          </div>
        </MagicCard>
      </motion.div>

      {/* Decorative elements behind */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl z-0" />
    </div>
  );
}
