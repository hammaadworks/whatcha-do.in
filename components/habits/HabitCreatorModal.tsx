"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitCreator } from "./HabitCreator";

interface HabitCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: () => void;
}

export function HabitCreatorModal({ isOpen, onClose, onHabitCreated }: HabitCreatorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <HabitCreator onHabitCreated={onHabitCreated} />
      </DialogContent>
    </Dialog>
  );
}
