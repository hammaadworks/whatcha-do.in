"use client";

import React, { useState } from "react";
import { CompletionsData, Habit } from "@/lib/supabase/types";
import HabitInfoModal from "./HabitInfoModal";
import { HabitCompletionsModal } from "./HabitCompletionsModal";
import { GripVertical, Lock, Flame, Ghost, Zap, Sparkles, History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HabitBoxType, HabitState } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";
import { getReferenceDateUI, getTodayISO } from "@/lib/date";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface HabitChipProps {
  habit: Habit;
  isOwner?: boolean;
  // Owner-only props
  onHabitUpdated?: (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => void;
  onHabitDeleted?: (habitId: string) => void;
  onHabitCompleted?: (habitId: string, data: CompletionsData) => void;
  onHabitMove?: (habitId: string, targetBox: HabitBoxType) => Promise<void>; // New prop
  box: HabitBoxType;
  // Visual/Public props
  disableClick?: boolean;
  rightAddon?: React.ReactNode;
  dragListeners?: SyntheticListenerMap; // New prop for dnd-kit listeners
}

/**
 * A unified Habit Chip component.
 * Renders the visual representation of a habit and handles interactions based on ownership.
 */
export const HabitChip: React.FC<HabitChipProps> = ({
                                                      habit,
                                                      isOwner = false,
                                                      onHabitUpdated,
                                                      onHabitDeleted,
                                                      onHabitCompleted,
                                                      onHabitMove,
                                                      box,
                                                      disableClick = false,
                                                      rightAddon,
                                                      dragListeners
                                                    }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const { user } = useAuth();
  const { simulatedDate } = useSimulatedTime();

  // Canonical Time Logic
  const timezone = user?.timezone || "UTC";
  const refDate = getReferenceDateUI(simulatedDate);
  const todayISO = getTodayISO(timezone, refDate);

  const isJunked = habit.habit_state === HabitState.JUNKED;
  const canBeDeleted = box === HabitBoxType.PILE;

  // Display Streak Logic
  const displayStreak = isJunked ? -Math.abs(habit.streak) : habit.streak;

  // Icon & Style Logic based on State
  let StateIcon = Zap;
  let stateStyles = "bg-primary/10 text-primary";

  switch (habit.habit_state) {
      case HabitState.JUNKED:
          StateIcon = Ghost;
          stateStyles = "bg-destructive/10 text-destructive/70";
          break;
      case HabitState.LIVELY:
          StateIcon = Sparkles;
          stateStyles = "bg-secondary text-secondary-foreground/70";
          break;
      case HabitState.YESTERDAY:
          StateIcon = History;
          stateStyles = "bg-orange-500/10 text-orange-600 dark:text-orange-400";
          break;
      case HabitState.TODAY:
          StateIcon = Flame;
          stateStyles = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
          break;
  }

  const handleClick = () => {
    if (disableClick) return;
    setIsInfoModalOpen(true);
  };

  return (<>
    <div className="group relative flex items-center w-full sm:w-fit">
      <div
        onClick={handleClick}
        className={cn(
            "group relative flex items-center gap-3 rounded-xl py-2 px-3 pl-1 border transition-all w-full sm:w-auto min-w-[140px] select-none",
            isJunked 
                ? "bg-muted/30 text-muted-foreground border-dashed border-border/60 hover:bg-muted/50" 
                : "bg-card text-card-foreground border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98]",
            (disableClick) ? "cursor-default" : "cursor-pointer"
        )}
      >
        {/* Drag Handle (Only if listeners provided) */}
        {dragListeners && (
          <div
            {...dragListeners}
            onClick={(e) => e.stopPropagation()} // Prevent click propagation
            className="cursor-grab hover:text-primary active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-foreground/80 transition-colors touch-none flex items-center justify-center h-full"
          >
            <GripVertical size={14} />
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 truncate">
             <span className="font-semibold text-sm truncate max-w-[120px]">{habit.name}</span>
             {!habit.is_public && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock size={12} className="text-muted-foreground/50 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>Private</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             )}
          </div>

          {/* Streak Badge */}
          <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
              stateStyles
          )}>
            <StateIcon size={12} className="shrink-0" />
            <span>{displayStreak}</span>
          </div>
        </div>

        {/* Public Addon */}
        {rightAddon}
      </div>
    </div>

    {/* Info Modal */}
    <HabitInfoModal
      isOpen={isInfoModalOpen}
      onClose={() => setIsInfoModalOpen(false)}
      habit={habit}
      // Only pass these if owner
      onHabitUpdated={isOwner ? onHabitUpdated : undefined}
      onHabitDeleted={isOwner ? onHabitDeleted : undefined}
      onHabitMove={isOwner ? onHabitMove : undefined} // Pass to modal
      isPrivateHabit={isOwner}
      canBeDeleted={canBeDeleted}
    />

    {/* Completion Modal - Only render if owner and handlers exist */}
    {isOwner && onHabitCompleted && (<HabitCompletionsModal
      isOpen={isCompletionModalOpen}
      onClose={() => setIsCompletionModalOpen(false)}
      habit={habit}
      onConfirm={async (data) => onHabitCompleted(habit.id, data)}
    />)}
  </>);
};
