import BaseModal from '../shared/BaseModal'; // Import the new BaseModal
import { Habit } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, LogIn, ArrowRight, Flame } from "lucide-react";
import EditHabitModal from "./EditHabitModal";
import { useState } from "react";

import { HabitBoxType, HabitState } from "@/lib/enums";

interface HabitInfoModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onHabitUpdated?: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null,
    targetTime?: string | null, // Add targetTime
    description?: string | null // Add description
  ) => void;
  onHabitDeleted?: (habitId: string) => void;
  onHabitMove?: (habitId: string, targetBox: HabitBoxType) => Promise<void>; // New prop
  onRedeemComplete?: () => void; // Trigger for extra completion
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
  onRedeemComplete, // New prop
  isPrivateHabit,
  canBeDeleted,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSave = (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null,
    targetTime?: string | null, // Add targetTime
    description?: string | null // Add description
  ) => {
    onHabitUpdated?.(habitId, name, isPublic, goalValue, goalUnit, targetTime, description);
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
      title="" // Custom title handling
      footerContent={isPrivateHabit && (
        <div className="flex flex-col w-full gap-3 pt-2">
             {/* Move Actions Section */}
             {onHabitMove && (
                 <div className="flex flex-wrap gap-3 justify-center pb-4 border-b border-border/40 mb-2">
                     {habit.habit_state !== HabitState.TODAY ? (
                         <Button variant="outline" size="sm" onClick={() => handleMove(HabitBoxType.TODAY)} className="w-full sm:w-auto">
                             Mark Done <ArrowRight className="ml-1 h-3 w-3" />
                         </Button>
                     ) : (
                         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                             <Button variant="outline" size="sm" onClick={() => handleMove(HabitBoxType.PILE)} className="w-full sm:w-auto">
                                 Unmark <ArrowRight className="ml-1 h-3 w-3" />
                             </Button>
                             {onRedeemComplete && (
                                <Button variant="secondary" size="sm" onClick={() => { onClose(); onRedeemComplete(); }} className="w-full sm:w-auto">
                                    <LogIn className="mr-1 h-3 w-3" /> Redeem a missed day?
                                </Button>
                             )}
                         </div>
                     )}
                 </div>
             )}
             
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
                className="w-full sm:w-auto text-sm h-10"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              {canBeDeleted && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="w-full sm:w-auto text-sm h-10"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
        </div>
      )}
    >
        <div className="flex flex-col gap-6 pb-2 max-h-[75vh] overflow-y-auto px-1">
          {/* Header Section */}
          <div className="text-center space-y-1">
             <h2 className="text-2xl font-bold tracking-tight">{habit.name}</h2>
             <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm">
                 <span className="capitalize flex items-center gap-1">
                     {habit.is_public ? "Public 🌐" : "Private 🔒"}
                 </span>
                 <span>•</span>
                 <span className="capitalize">{habit.habit_state}</span>
             </div>
          </div>

          {/* Featured Streak Card */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 flex flex-col items-center justify-center border border-primary/10 shadow-sm relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                 <Flame size={64} />
             </div>
             <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">Current Streak</span>
             <div className="flex items-baseline gap-1">
                 <span className="text-5xl font-black text-primary tracking-tighter">{habit.streak}</span>
                 <span className="text-lg font-medium text-muted-foreground">days</span>
             </div>
          </div>

          {/* Description */}
          {habit.descriptions && (
            <div className="bg-muted/40 p-4 rounded-xl border border-border/50 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Why this matters</span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {habit.descriptions}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
             <div className="bg-card border p-3 rounded-xl flex flex-col gap-1 shadow-sm">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold">Longest Streak</span>
                 <span className="text-lg font-semibold">{habit.longest_streak} days</span>
             </div>
             
             <div className="bg-card border p-3 rounded-xl flex flex-col gap-1 shadow-sm">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold">Since</span>
                 <span className="text-lg font-semibold">
                     {habit.created_at ? new Date(habit.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                 </span>
             </div>

             {habit.target_time && (
                 <div className="bg-card border p-3 rounded-xl flex flex-col gap-1 shadow-sm">
                     <span className="text-[10px] text-muted-foreground uppercase font-bold">Target Time</span>
                     <span className="text-lg font-semibold">
                        {new Date(`1970-01-01T${habit.target_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                     </span>
                 </div>
             )}

             {(habit.goal_value && habit.goal_unit) && (
                 <div className="bg-card border p-3 rounded-xl flex flex-col gap-1 shadow-sm">
                     <span className="text-[10px] text-muted-foreground uppercase font-bold">Daily Goal</span>
                     <span className="text-lg font-semibold">
                        {habit.goal_value} <span className="text-sm font-normal text-muted-foreground">{habit.goal_unit}</span>
                     </span>
                 </div>
             )}
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
