"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitCreator } from "./HabitCreator";

import { Habit } from "@/lib/supabase/types";

interface HabitCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: (habit: Habit) => void;
}

/**
 * A dialog wrapper for the `HabitCreator` form.
 * Handles the open/close state of the creation UI.
 */
export function HabitCreatorModal({ isOpen, onClose, onHabitCreated }: HabitCreatorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <HabitCreator onHabitCreated={onHabitCreated} />
      </DialogContent>
    </Dialog>
  );
}
