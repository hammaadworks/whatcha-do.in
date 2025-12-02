import React from "react";
import { cn } from "@/lib/utils";
import { Move, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion"; // Import motion from framer-motion

export function ActionChipsMockup({ className }: { className?: string }) {
  const chips = [
    { id: 1, text: "Meditate 10 min", completed: true },
    { id: 2, text: "Read 20 pages", completed: false },
    { id: 3, text: "Workout", completed: false },
    { id: 4, text: "Learn something new", completed: false },
  ];

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-lg shadow-lg p-4", className)}>
      <div>
        <h4 className="text-base font-semibold text-center mb-3">Your Daily Actions</h4>
        <div className="space-y-2">
          {chips.map((chip) => (
            <motion.div
              key={chip.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md border text-sm",
                chip.completed
                  ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                  : "bg-background border-border text-foreground group transition-colors cursor-grab"
              )}
              whileHover={{ scale: chip.completed ? 1 : 1.02, boxShadow: chip.completed ? "none" : "0px 4px 8px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: chip.completed ? 1 : 0.98 }}
              drag={!chip.completed} // Only allow drag if not completed
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Constrain drag to parent (no actual drag functionality here, just visual)
            >
              <span className={cn("flex-grow", chip.completed && "line-through text-muted-foreground")}>{chip.text}</span>
              {chip.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Move className="h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Drag, drop, and complete your way to consistency.
      </p>
    </div>
  );
}
