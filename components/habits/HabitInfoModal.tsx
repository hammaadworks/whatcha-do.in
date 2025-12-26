import BaseModal from '../shared/BaseModal'; // Import the new BaseModal
import { Habit } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EditHabitModal from "./EditHabitModal";
import { useState } from "react";

import { HabitBoxType, HabitState } from "@/lib/enums";
import { ArrowRight } from "lucide-react";

interface HabitInfoModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onHabitUpdated?: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => void;
  onHabitDeleted?: (habitId: string) => void;
  onHabitMove?: (habitId: string, targetBox: HabitBoxType) => Promise<void>; // New prop
  isPrivateHabit?: boolean;
  canBeDeleted?: boolean;
}

/**
 * A modal that displays detailed information about a habit (Stats, Streak, Goal).
 * For private habits, it provides options to Edit or Delete.
 */
const HabitInfoModal: React.FC<HabitInfoModalProps> = ({
  habit,
  isOpen,
  onClose,
  onHabitUpdated,
  onHabitDeleted,
  onHabitMove,
  isPrivateHabit,
  canBeDeleted,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSave = (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => {
    onHabitUpdated?.(habitId, name, isPublic, goalValue, goalUnit);
    setIsEditModalOpen(false);
    onClose(); // Close info modal after saving
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete the habit "${habit.name}"? This action cannot be undone.`)) {
      onHabitDeleted?.(habit.id);
      onClose(); // Close info modal after deleting
    }
  };
  
  const handleMove = async (targetBox: HabitBoxType) => {
      if (onHabitMove) {
          await onHabitMove(habit.id, targetBox);
          onClose();
      }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={habit.name}
      footerContent={isPrivateHabit && (
        <div className="flex flex-col w-full gap-4 pt-4">
             {/* Move Actions Section */}
             {onHabitMove && (
                 <div className="flex flex-wrap gap-2 justify-center pb-4 border-b">
                     {habit.habit_state !== HabitState.TODAY ? (
                         <Button variant="outline" size="sm" onClick={() => handleMove(HabitBoxType.TODAY)}>
                             Mark Done <ArrowRight className="ml-1 h-3 w-3" />
                         </Button>
                     ) : (
                         <Button variant="outline" size="sm" onClick={() => handleMove(HabitBoxType.PILE)}>
                             Unmark <ArrowRight className="ml-1 h-3 w-3" />
                         </Button>
                     )}
                 </div>
             )}
             
            <div className="flex flex-row gap-2 justify-end">
              <Button
                variant="outline" // Reverted from secondary to outline
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
                size="lg"
                className="text-sm"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              {canBeDeleted && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  size="lg" // Changed from lg to xl
                  className="text-sm" // Removed custom hover class
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
        </div>
      )}
    >
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Current Streak</span>
            <Badge variant="default" className="text-lg">
              🔥 {habit.streak}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Longest Streak</span>
            <span className="font-semibold">{habit.longest_streak} days</span>
          </div>
          {habit.goal_value && habit.goal_unit && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Goal</span>
              <span className="font-semibold">
                {habit.goal_value} {habit.goal_unit}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold capitalize">
              {habit.is_public ? "Public 🌐" : "Private 🔒"}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-muted-foreground">State</span>
            <span className="font-semibold capitalize">{habit.habit_state}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Created</span>
            <span className="font-semibold">
              {habit.created_at ? new Date(habit.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      {isPrivateHabit && (
        <EditHabitModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          habit={habit}
          onSave={handleSave}
        />
      )}
    </BaseModal>
  );
};

export default HabitInfoModal;
