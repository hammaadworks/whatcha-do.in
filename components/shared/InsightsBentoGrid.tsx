"use client";

import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { insights } from "@/lib/supabase/insights";

const layouts = [
  [
    { colSpan: "md:col-span-2" }, { colSpan: "md:col-span-1" },
    { colSpan: "md:col-span-1" }, { colSpan: "md:col-span-2" },
    { colSpan: "md:col-span-2" }, { colSpan: "md:col-span-1" },
    { colSpan: "md:col-span-3" },
  ],
  [
    { colSpan: "md:col-span-1" }, { colSpan: "md:col-span-2" },
    { colSpan: "md:col-span-2" }, { colSpan: "md:col-span-1" },
    { colSpan: "md:col-span-1" }, { colSpan: "md:col-span-2" },
    { colSpan: "md:col-span-3" },
  ],
];

export const InsightsBentoGrid: React.FC = () => {
  const [layout, setLayout] = useState(layouts[0]);

  useEffect(() => {
    setLayout(layouts[Math.floor(Math.random() * layouts.length)]);
  }, []);

  return (
    <BentoGrid className="w-full grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, i) => {
        const [icon, ...titleParts] = insight.title.split(' ');
        const title = titleParts.join(' ');
        return (
          <BentoGridItem
            key={insight.id}
            header={insight.value}
            title={title}
            description={insight.description}
            icon={<span>{icon}</span>}
            className={cn(layout[i]?.colSpan)}
          />
        );
      })}
    </BentoGrid>
  );
};