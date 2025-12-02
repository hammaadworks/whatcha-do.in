import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion"; // Assuming framer-motion is available

export function TwoDayRuleMockup({ className }: { className?: string }) {
  const days = [
    { label: "Day 1", status: "completed" },
    { label: "Day 2", status: "completed" },
    { label: "Day 3", status: "missed" },
    { label: "Day 4", status: "pending" },
  ];

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-lg shadow-lg p-4", className)}>
      <div>
        <h4 className="text-base font-semibold text-center mb-3">Unbreakable Consistency</h4>
        <div className="flex justify-center items-center space-x-2 mb-4">
          {days.map((day, index) => (
            <motion.div
              key={day.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex flex-col items-center p-1 rounded-md",
                day.status === "completed" && "text-green-500",
                day.status === "missed" && "text-red-500",
                day.status === "pending" && "text-muted-foreground"
              )}
            >
              {day.status === "completed" && <CheckCircle2 className="h-6 w-6" />}
              {day.status === "missed" && <XCircle className="h-6 w-6" />}
              {day.status === "pending" && <span className="h-6 w-6 border-2 border-dashed rounded-full flex items-center justify-center text-xs">?</span>}
              <span className="text-xs mt-1">{day.label}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Miss one day? No sweat. Miss two? Streak resets.
        </p>
      </div>
      <div className="flex justify-center mt-4">
        <span className="text-lg font-bold text-primary">Current Streak: 2 Days</span>
      </div>
    </div>
  );
}
