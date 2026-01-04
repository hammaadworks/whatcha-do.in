"use client";

import React, { useState } from "react";
import { CompletionsData, Habit } from "@/lib/supabase/types";
import { HabitLifecycleEvent, HabitState } from "@/lib/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, X } from "lucide-react";
import { HabitCompletionsModal } from "@/components/habits/HabitCompletionsModal";
import { markHabit } from "@/lib/supabase/habit";
import { useAuth } from "@/packages/auth/hooks/useAuth";
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";
import { getReferenceDateUI, getTodayISO } from "@/lib/date";
import { toast } from "sonner";
import { calculateHabitUpdates } from "@/lib/logic/habits/habitLifecycle.ts";
import { HabitCreator } from "@/components/habits/HabitCreator";

interface GracePeriodScreenProps {
  habits: Habit[];
  onComplete: (habitId: string, data: CompletionsData) => Promise<void>;
  onSkip: (habit: Habit) => Promise<void>;
  onHabitCreated: (habit: Habit) => void;
}

export function GracePeriodScreen({ habits, onComplete, onSkip, onHabitCreated }: Readonly<GracePeriodScreenProps>) {
  // Canonical Time Logic
  const { user } = useAuth();
  const timezone = user?.timezone || "UTC";
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);
  const todayISO = getTodayISO(timezone, refDate);

  const [selectedHabitForCompletion, setSelectedHabitForCompletion] = useState<Habit | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Add Habit State
  const [isAdding, setIsAdding] = useState(false);

  // If no habits, don't render (should be handled by parent, but safe guard)
  if (!habits || habits.length === 0) return null;

  const currentHabit = habits[0]; // Process one by one

  const handleYes = () => {
    setSelectedHabitForCompletion(currentHabit);
  };

  const handleNo = async () => {
    setIsCompleting(true);
    try {
      await onSkip(currentHabit);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCompletionConfirm = async (data: CompletionsData) => {
    if (!selectedHabitForCompletion) return;
    setIsCompleting(true);
    try {
      const updates = calculateHabitUpdates(selectedHabitForCompletion, HabitLifecycleEvent.GRACE_COMPLETE, todayISO);
      await markHabit(selectedHabitForCompletion, updates, data);
      await onComplete(selectedHabitForCompletion.id, data);
      setSelectedHabitForCompletion(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete habit.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNewHabitCreated = (newHabit: Habit) => {
      onHabitCreated(newHabit);
      setIsAdding(true);
      setSelectedHabitForCompletion(newHabit);
      toast.success("Habit created! Now let's check it off.");
  };

  // Intercept completion for the NEW habit
  const finalConfirm = isAdding ? async (data: CompletionsData) => {
    if (selectedHabitForCompletion) {
      const updates = calculateHabitUpdates(selectedHabitForCompletion, HabitLifecycleEvent.GRACE_COMPLETE, todayISO);
      await markHabit(selectedHabitForCompletion, updates, data);
      setIsAdding(false);
      setSelectedHabitForCompletion(null);
      toast.success("Added & Checked off for yesterday!");
    }
  } : handleCompletionConfirm;

  return (
    <>
      <Dialog open={true} onOpenChange={() => {
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}
                       onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Yesterday&#39;s Check-in</DialogTitle>
            <DialogDescription>
              Let&#39;s close out yesterday before starting today.
            </DialogDescription>
          </DialogHeader>

          {!isAdding ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <h3 className="text-xl font-medium text-center">
                Did you complete <span
                className="font-bold text-primary">{currentHabit.name}</span> yesterday?
              </h3>

              <div className="flex gap-4 w-full justify-center mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNo}
                  disabled={isCompleting}
                  className="w-32 gap-2 border-dashed"
                >
                  <X className="w-4 h-4" /> No
                </Button>

                <Button
                  size="lg"
                  onClick={handleYes}
                  disabled={isCompleting}
                  className="w-32 gap-2"
                >
                  <Check className="w-4 h-4" /> Yes
                </Button>
              </div>

              <div className="mt-8 w-full border-t pt-4">
                <Button variant="ghost" className="w-full text-muted-foreground"
                        onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Forgot to track something else?
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {habits.length - 1 > 0 ? `${habits.length - 1} more to go` : "Last one!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <h3 className="text-md font-medium">Add a missed habit</h3>
              <HabitCreator onHabitCreated={handleNewHabitCreated} />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedHabitForCompletion && (
        <HabitCompletionsModal
          isOpen={true}
          onClose={() => {
            setSelectedHabitForCompletion(null);
            setIsAdding(false);
          }}
          habit={selectedHabitForCompletion}
          onConfirm={finalConfirm}
          isFromGrace={true}
        />
      )}
    </>
  );
}
