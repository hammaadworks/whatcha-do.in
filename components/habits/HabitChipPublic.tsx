"use client";

import React, { useState } from 'react';
import { Habit } from '@/lib/supabase/types';
import HabitInfoModal from './HabitInfoModal';
import { ShineBorder } from '../ui/shine-border';
import { HabitPileState } from '@/lib/enums'; // Import HabitPileState enum

interface HabitChipPublicProps {
  habit: Habit;
  disableClick?: boolean;
  rightAddon?: React.ReactNode;
  isPrivate?: boolean;
  isJunked?: boolean; // New prop for junked state
  pileState?: string; // New prop for pile state to control ShineBorder
}

export const HabitChipPublic: React.FC<HabitChipPublicProps> = ({ habit, disableClick, rightAddon, isPrivate, isJunked, pileState }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleClick = () => {
    if (!disableClick) {
      setIsInfoModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`group relative flex items-center gap-x-2 rounded-full py-2.5 pl-5 pr-4 font-bold
                   border transition-colors w-fit
                 ${isJunked
                     ? 'bg-gray-800 text-gray-300 border-gray-600 grayscale border-dashed cursor-not-allowed'
                     : 'bg-[--chip-bg] text-[--chip-text] border-[--chip-border] hover:bg-[--secondary-bg]'}
                 ${disableClick || isJunked ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {/* Main content */}
        <div className="flex items-center gap-x-2">
          <span>{habit.name}</span>
          {/* Streak Counter */}
          <div
            className="inline-block rounded-[0.5rem] bg-primary px-2 py-1 text-[0.9rem] font-extrabold text-primary-foreground"
          >
            {habit.current_streak}
          </div>
        </div>
        {rightAddon} {/* Render rightAddon here */}
        {pileState !== HabitPileState.JUNKED && (
            <ShineBorder shineColor={isPrivate ? "hsl(var(--secondary))" : "hsl(var(--primary))"} className="z-10" />
        )}
      </div>

      {/* Modal */}
      <HabitInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        habit={habit}
      />
    </>
  );
};