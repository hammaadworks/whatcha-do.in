"use client";

import React, { useState } from 'react';
import { Habit } from '@/lib/supabase/types';
import { HabitChipPublic } from './HabitChipPublic';
import HabitInfoModal from './HabitInfoModal'; // Import HabitInfoModal
import { Info } from 'lucide-react'; // Import Info icon
import { HabitPileState } from '@/lib/enums';

interface HabitChipPrivateProps {
  habit: Habit;
  onHabitUpdated: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => void;
  onHabitDeleted: (habitId: string) => void;
  columnId?: 'today' | 'yesterday' | 'pile';
}

export const HabitChipPrivate: React.FC<HabitChipPrivateProps> = ({
  habit,
  onHabitUpdated,
  onHabitDeleted,
  columnId,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // State for info modal

  // No need for handleSave or handleDeleteClick here anymore, they are in HabitInfoModal

  const canBeDeleted = columnId === 'pile';

  return (
    <>
      <div className="group relative flex items-center w-fit">
        {/* The public chip provides the base visuals */}
        <HabitChipPublic
          habit={habit}
          disableClick={true}
          isPrivate={true} // Mark as private for styling
          isJunked={habit.pile_state === HabitPileState.JUNKED}
          pileState={habit.pile_state} // Pass pile_state for conditional rendering/styling
          rightAddon={
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="rounded-full p-1.5 hover:bg-gray-500/20"
              title="Habit Info & Actions"
            >
              <Info size={16} />
            </button>
          }
        />
      </div>

      {/* The Info Modal is now managed by this private component */}
      <HabitInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        habit={habit}
        onHabitUpdated={onHabitUpdated}
        onHabitDeleted={onHabitDeleted}
        isPrivateHabit={true}
        canBeDeleted={canBeDeleted}
      />
    </>
  );
};
