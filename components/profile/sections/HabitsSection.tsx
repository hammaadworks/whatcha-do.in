"use client";

import React, { useRef, useState } from "react";
import { HabitChip } from "@/components/habits/HabitChip";
import { mockHabitsData, mockPublicHabitsData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { CompletionsData, Habit, ISODate } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitCompletionsModal } from "@/components/habits/HabitCompletionsModal";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HabitCreatorModal } from "@/components/habits/HabitCreatorModal";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { useHabitDnd } from "@/hooks/useHabitDnd";
import { HabitBoxType, HabitState } from "@/lib/enums";
import UnmarkConfirmationModal from "@/components/habits/UnmarkConfirmationModal";
import { useHabitActions } from "@/hooks/useHabitActions";
import { DesktopHabitsLayout, MobileHabitsLayout } from "./HabitsLayouts";

interface HabitsSectionProps {
  isOwner: boolean;
  isReadOnly?: boolean;
  habits?: Habit[];
  loading: boolean;
  onActivityLogged?: () => void;
  setOwnerHabits?: React.Dispatch<React.SetStateAction<Habit[]>>; // Add setter for optimistic updates
  todayISO: ISODate; // Add timezone
}

/**
 * The main container for the Habits feature on the user profile.
 * Manages the "Today", "Yesterday", and "Pile" columns.
 * Handles drag-and-drop reordering and state transitions.
 *
 * @param isOwner - Whether the current user owns this profile.
 * @param isReadOnly - If true, interactions are disabled (public view).
 * @param habits - List of habits to display.
 * @param loading - Loading state.
 * @param onActivityLogged - Callback when an action occurs (completion, update, etc.).
 * @param setOwnerHabits - Setter for parent state to enable optimistic updates.
 * @param timezone - User's timezone.
 */

export const HabitsSection: React.FC<HabitsSectionProps> = ({
                                                              isOwner,
                                                              isReadOnly = false,
                                                              habits: propHabits,
                                                              loading,
                                                              onActivityLogged,
                                                              setOwnerHabits,
                                                              todayISO
                                                            }) => {
  const baseHabits = propHabits ?? (isOwner ? mockHabitsData : mockPublicHabitsData);

  const [activeHabitForCompletion, setActiveHabitForCompletion] = useState<Habit | null>(null);

  const completionSuccessRef = useRef(false);

  // Unmark Confirmation State

  const [unmarkModalState, setUnmarkModalState] = useState<{
    habit: Habit | null; onConfirm: () => Promise<void>; onCancel: () => void; isOpen: boolean;
  }>({
    habit: null, onConfirm: async () => {
    }, onCancel: () => {
    },

    isOpen: false
  });

  const handleDragCompletion = (habitId: string) => {
    const habit = baseHabits.find((h) => h.id === habitId);

    if (habit) {
      completionSuccessRef.current = false;
      setActiveHabitForCompletion(habit);
    }
  };

  const handleUnmarkConfirmation = (habit: Habit, onConfirm: () => Promise<void>, onCancel: () => void) => {
    setUnmarkModalState({
      habit, onConfirm, onCancel, isOpen: true
    });
  };

  const {
    sensors, handleDragStart, handleDragEnd, activeHabit, optimisticHabits, setOptimisticHabits, activeId, moveHabit
  } = useHabitDnd({
    habits: baseHabits,
    onHabitMoved: onActivityLogged,
    onCompleteHabit: isReadOnly ? undefined : handleDragCompletion,
    onUnmarkConfirmation: isReadOnly ? undefined : handleUnmarkConfirmation,
    todayISO: todayISO
  });

  const habits = optimisticHabits || baseHabits;

  const {
    handleHabitUpdate,

    handleHabitDelete,

    handleCreateHabit: onHabitCreated,

    handleHabitComplete: onHabitCompleted
  } = useHabitActions({
    onActivityLogged, setOptimisticHabits: setOwnerHabits, // Use parent setter for permanent optimistic updates
    habits, todayISO
  });

  const handleCreateHabit = () => {
    onHabitCreated(setIsCreateHabitModalOpen);
  };

  const todayHabits = habits.filter((h) => h.habit_state === HabitState.TODAY);
  const yesterdayHabits = habits.filter((h) => h.habit_state === HabitState.YESTERDAY);
  const pileHabits = habits.filter((h) => h.habit_state === HabitState.LIVELY || h.habit_state === HabitState.JUNKED);

  const [showAllPileHabits, setShowAllPileHabits] = useState(false);
  const initialVisibleHabits = 5;
  const habitsToDisplay = showAllPileHabits ? pileHabits : pileHabits.slice(0, initialVisibleHabits);
  const hasMoreHabits = pileHabits.length > initialVisibleHabits;

  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);

  const handleCompletionConfirm = async (data: CompletionsData) => {
    if (activeHabitForCompletion) {
      await onHabitCompleted(activeHabitForCompletion.id, data, false);
      completionSuccessRef.current = true;
    }
  };

  const handleCompletionClose = () => {
    setActiveHabitForCompletion(null);
    if (!completionSuccessRef.current) {
      setOptimisticHabits(null); // Revert drag if cancelled
    }
    completionSuccessRef.current = false;
  };

  const handleUnmarkModalClose = () => {
    // If simply closed without confirming, treat as cancel
    unmarkModalState.onCancel();
    setUnmarkModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUnmarkConfirm = async () => {
    await unmarkModalState.onConfirm();
    // State cleanup happens in close or after
  };

  const noopOnHabitUpdated = () => {
  };
  const noopOnHabitDeleted = () => {
  };
  const noopOnHabitCompleted = () => {
  };
  const noopOnHabitMove = async () => {
  }; // No-op for read-only

  const renderHabitChip = (h: Habit) => (<HabitChip
    habit={h}
    isOwner={isOwner}
    onHabitUpdated={isReadOnly ? noopOnHabitUpdated : handleHabitUpdate}
    onHabitDeleted={isReadOnly ? noopOnHabitDeleted : handleHabitDelete}
    onHabitCompleted={isReadOnly ? noopOnHabitCompleted : onHabitCompleted}
    onHabitMove={isReadOnly ? noopOnHabitMove : moveHabit} // Pass moveHabit
    box={h.habit_state === HabitState.TODAY ? HabitBoxType.TODAY : h.habit_state === HabitState.YESTERDAY ? HabitBoxType.YESTERDAY : HabitBoxType.PILE}
  />);

  if (loading) {
    return (<div className="section mb-10">
      <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">
        Habits
      </h2>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>);
  }

  return (<div className="section mb-10">
    <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
      <h2 className="text-2xl font-extrabold text-primary">Habits</h2>
      {isOwner && !isReadOnly && (<TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsCreateHabitModalOpen(true)}
              title="Add New Habit"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add New Habit</TooltipContent>
        </Tooltip>
      </TooltipProvider>)}
    </div>
    <p className="text-sm text-muted-foreground mb-4">
      Drag habits across boxes to mark or long tap for options.
    </p>

    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {isOwner ? (<>
        <MobileHabitsLayout
          todayHabits={todayHabits}
          yesterdayHabits={yesterdayHabits}
          pileHabits={habitsToDisplay}
          renderHabitChip={renderHabitChip}
          isReadOnly={isReadOnly}
          activeId={activeId}
          showAllPileHabits={showAllPileHabits}
          setShowAllPileHabits={setShowAllPileHabits}
          hasMoreHabits={hasMoreHabits}
        />
        <DesktopHabitsLayout
          todayHabits={todayHabits}
          yesterdayHabits={yesterdayHabits}
          pileHabits={pileHabits}
          renderHabitChip={renderHabitChip}
          isReadOnly={isReadOnly}
          activeId={activeId}
        />
      </>) : (<div className="habit-grid flex flex-wrap gap-4">
        {habits
          .filter((h) => h.is_public)
          .map((habit) => (<HabitChip
            key={habit.id}
            habit={habit}
            isOwner={false}
            disableClick={false}
            box={HabitBoxType.PILE}
          />))}
      </div>)}

      <DragOverlay>
        {activeHabit ? (<HabitChip
          habit={activeHabit}
          isOwner={isOwner}
          onHabitUpdated={noopOnHabitUpdated}
          onHabitDeleted={noopOnHabitDeleted}
          onHabitCompleted={noopOnHabitCompleted}
          box={HabitBoxType.TODAY}
        />) : null}
      </DragOverlay>
    </DndContext>

    {isOwner && !isReadOnly && (<>
      <HabitCreatorModal
        isOpen={isCreateHabitModalOpen}
        onClose={() => setIsCreateHabitModalOpen(false)}
        onHabitCreated={handleCreateHabit}
      />
      {activeHabitForCompletion && (<HabitCompletionsModal
        isOpen={!!activeHabitForCompletion}
        onClose={handleCompletionClose}
        habit={activeHabitForCompletion}
        onConfirm={handleCompletionConfirm}
      />)}
      <UnmarkConfirmationModal
        isOpen={unmarkModalState.isOpen}
        onClose={handleUnmarkModalClose}
        habit={unmarkModalState.habit}
        onConfirm={handleUnmarkConfirm}
      />
    </>)}
  </div>);
};
