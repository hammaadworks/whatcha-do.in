import React from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

export function IntensitySliderMockup({ className }: { className?: string }) {
  const [value, setValue] = React.useState(50);

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between bg-card rounded-lg shadow-lg p-4", className)}>
      <div>
        <h4 className="text-base font-semibold text-center mb-3">Effort Level: <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, ease: "easeInOut" }} className="text-primary">{value}%</motion.span></h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <Slider
            defaultValue={[value]}
            max={100}
            step={1}
            onValueChange={(val: number[]) => setValue(val[0])}
            className="flex-grow [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-green-400 [&>span:first-child]:to-red-500" // Add gradient to track
            disabled
          />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Every effort counts, from 20% to 100%.
      </p>
    </div>
  );
}
