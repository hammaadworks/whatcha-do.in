"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Move, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ActionChipsMockup({ className }: { className?: string }) {
  const chips = [
    { id: 1, text: "Meditate 10 min", completed: true },
    { id: 2, text: "Read 20 pages", completed: false },
    { id: 3, text: "Workout", completed: false },
    { id: 4, text: "Learn something new", completed: false },
  ];

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-2xl shadow-xl p-6 border border-border/50", className)}>
      <div>
        <h4 className="text-lg font-bold text-center mb-6 font-sans">Your Daily Actions</h4>
        <div className="space-y-3">
          {chips.map((chip) => (
            <motion.div
              key={chip.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-sm font-mono",
                chip.completed
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-foreground group transition-colors cursor-grab hover:border-primary/50"
              )}
              whileHover={{ scale: chip.completed ? 1 : 1.02, boxShadow: chip.completed ? "none" : "0px 4px 12px rgba(0,0,0,0.05)" }}
              whileTap={{ scale: chip.completed ? 1 : 0.98 }}
              drag={!chip.completed} 
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <span className={cn("flex-grow", chip.completed && "line-through opacity-70")}>{chip.text}</span>
              {chip.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Move className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-center text-xs text-muted-foreground font-mono">
          Drag, drop, and complete your way to consistency.
        </p>
      </div>
    </div>
  );
}