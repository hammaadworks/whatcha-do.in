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
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";
import { HabitCompletionsModal } from "@/components/habits/HabitCompletionsModal";
import { createHabit, markHabit } from "@/lib/supabase/habit";
import { useAuth } from "@/hooks/useAuth";
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";
import { getReferenceDateUI, getTodayISO } from "@/lib/date";
import { toast } from "sonner";
import { calculateHabitUpdates } from "@/lib/logic/habits/habitLifecycle.ts";

interface GracePeriodScreenProps {
  habits: Habit[];
  onComplete: (habitId: string, data: CompletionsData) => Promise<void>;
  onSkip: (habit: Habit) => Promise<void>;
}

export function GracePeriodScreen({ habits, onComplete, onSkip }: Readonly<GracePeriodScreenProps>) {
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
  const [newHabitName, setNewHabitName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      setSelectedHabitForCompletion(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete habit.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Wrapper for list items to use Grace logic
  const handleListCompletion = async (data: CompletionsData) => {
    if (!selectedHabitForCompletion) return;
    try {
      const updates = calculateHabitUpdates(selectedHabitForCompletion, HabitLifecycleEvent.GRACE_COMPLETE, todayISO);
      await markHabit(selectedHabitForCompletion, updates, data);
      await onComplete(selectedHabitForCompletion.id, data);
      setSelectedHabitForCompletion(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAndComplete = async () => {
    if (!newHabitName.trim() || !user) return;
    setIsCreating(true);
    try {
      // 1. Create
      const { data: newHabit, error } = await createHabit({
        user_id: user.id,
        name: newHabitName,
        is_public: false, // Default private for grace?
        habit_state: HabitState.LIVELY // Init state
      });

      if (error || !newHabit) throw error;

      // 2. Open Completion Modal for this new habit
      // We set it as selected, and set a flag that it's "adding".
      setIsAdding(true); // Flag to know we are in add mode
      setSelectedHabitForCompletion(newHabit);

    } catch (e) {
      toast.error("Failed to create habit.");
    } finally {
      setIsCreating(false);
    }
  };

  // Intercept completion for the NEW habit
  const finalConfirm = isAdding ? async (data: CompletionsData) => {
    if (selectedHabitForCompletion) {
      const updates = calculateHabitUpdates(selectedHabitForCompletion, HabitLifecycleEvent.GRACE_COMPLETE, todayISO);
      await markHabit(selectedHabitForCompletion, updates, data);
      setIsAdding(false);
      setNewHabitName("");
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
              <Input
                placeholder="Habit name (e.g. Read 5 pages)"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleCreateAndComplete} disabled={isCreating || !newHabitName.trim()}>
                  {isCreating ? "Creating..." : "Next: Log Details"}
                </Button>
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
        />
      )}
    </>
  );
}
