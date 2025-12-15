'use client';

import React from 'react';
import BaseModal from '../shared/BaseModal';
import { Button } from "@/components/ui/button";
import { Habit } from "@/lib/supabase/types";

interface UnmarkConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onConfirm: () => void;
}

/**
 * Modal to confirm unmarking a habit (moving it out of 'Today').
 * Explains that this action will remove the completion record and decrease the streak.
 */
const UnmarkConfirmationModal: React.FC<UnmarkConfirmationModalProps> = ({
  isOpen,
  onClose,
  habit,
  onConfirm,
}) => {
  if (!habit) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Unmark Habit?"
      footerContent={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            onConfirm();
            onClose();
          }}>
            Yes, Unmark
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-4 text-foreground">
        <p>
          Are you sure you want to unmark <strong>{habit.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          This will remove the completion record for today and decrease your current streak by 1.
        </p>
      </div>
    </BaseModal>
  );
};

export default UnmarkConfirmationModal;
