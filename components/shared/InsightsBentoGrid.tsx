"use client";

import React, { useState, useEffect } from "react";
import { BentoGrid } from "@/components/ui/bento-grid";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { Insight, insights as staticInsights } from "@/lib/supabase/insights";

// Placeholder for userId prop. In a real app, this would come from session or auth context.
interface InsightsBentoGridProps {
  userId: string | undefined;
}

// Define specific layout configurations for different insight counts and responsiveness
interface LayoutItem {
    colSpan: string;
    mdColSpan: string;
}

const getLayout = (insightCount: number): LayoutItem[] => {
  // Base layout for small screens (1 column)
  const baseLayout: LayoutItem = { colSpan: "col-span-1", mdColSpan: "md:col-span-1" };

  // Responsive layouts for larger screens
  // Example: 2x2 grid for 4 insights, 2x3 for 6, 2x4 for 8
  if (insightCount <= 4) {
    return Array(4).fill(baseLayout);
  } else if (insightCount === 5) {
    return [
      baseLayout, baseLayout, baseLayout, baseLayout,
      { ...baseLayout, mdColSpan: "md:col-span-2" }, // Example of a wider card
    ];
  } else if (insightCount >= 6 && insightCount <= 8) {
    // A 2x3 or 2x4 layout
    return Array(8).fill(baseLayout);
  }
  // Default for more insights or other configurations
  return staticInsights.map(() => baseLayout);
};


export const InsightsBentoGrid: React.FC<InsightsBentoGridProps> = ({ userId }) => {
  const [currentLayout, setCurrentLayout] = useState(getLayout(staticInsights.length));

  useEffect(() => {
    setCurrentLayout(getLayout(staticInsights.length));
  }, [staticInsights.length]);

  // State to hold fetched insight values and loading status for each insight
  const [fetchedInsights, setFetchedInsights] = useState<Record<string, { value: string | null; isLoading: boolean; error: string | null }>>({});

  // Effect to fetch insights when userId is available
  useEffect(() => {
    if (!userId) {
      // Clear insights if userId is not available (e.g., user logged out)
      setFetchedInsights({});
      return;
    }

    const fetchAllInsights = async () => {
      const initialLoadingStates = staticInsights.reduce((acc, insight) => {
        acc[insight.id] = { value: null, isLoading: true, error: null };
        return acc;
      }, {} as Record<string, { value: string | null; isLoading: boolean; error: string | null }>);
      setFetchedInsights(initialLoadingStates);

      const results = await Promise.allSettled(
        staticInsights.map(async (insight) => {
          try {
            const value = await insight.fetchValue(userId);
            return { id: insight.id, value, error: null };
          } catch (error: any) {
            console.error(`Error fetching insight ${insight.id} for user ${userId}:`, error);
            return { id: insight.id, value: null, error: error.message || 'Failed to load' };
          }
        })
      );

      setFetchedInsights(prev => {
        const newState = { ...prev };
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { id, value, error } = result.value;
            newState[id] = { value, isLoading: false, error: error };
          } else {
            const insightWithError = staticInsights.find(i => result.reason?.id === i.id);
            const id = insightWithError ? insightWithError.id : `unknown-${Date.now()}`;
            newState[id] = { value: null, isLoading: false, error: result.reason?.message || 'Unknown error' };
          }
        });
        return newState;
      });
    };

    fetchAllInsights();

  }, [userId]);

  return (
    <BentoGrid className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-4">
      {staticInsights.map((insight, i) => {
        const insightData = fetchedInsights[insight.id];
        const [icon, ...titleParts] = insight.title.split(' ');
        const title = titleParts.join(' ');

        let displayValue: string;
        if (insightData?.isLoading) {
          displayValue = "...";
        } else if (insightData?.error) {
          displayValue = "Error";
        } else if (insightData?.value !== null && insightData?.value !== undefined) {
          displayValue = insightData.value;
        } else {
          displayValue = "N/A";
        }

        const colSpanClass = currentLayout[i]?.mdColSpan || "md:col-span-1";

        return (
          <MagicCard
            key={insight.id}
            className={cn(
                "flex flex-col justify-between p-5 md:p-6 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-md min-h-[160px]",
                colSpanClass,
                "bg-card text-card-foreground border border-border"
            )}
            gradientColor="var(--accent)" // Using accent for a subtle, thematic glow
            gradientOpacity={0.1}
            gradientSize={150}
          >
            <div className="flex flex-col mb-2">
                <div className="text-4xl mb-3 opacity-90">{icon}</div> {/* Larger icon */}
                <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{title}</h3> {/* Prominent title */}
                <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p> {/* Subdued description */}
            </div>

            {/* Bottom section: Value (larger, bolder, foreground color) */}
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground mt-auto tracking-tight">
                {displayValue}
            </div>
          </MagicCard>
        );
      })}
    </BentoGrid>
  );
};