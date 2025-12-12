"use client";

import React, { useState } from 'react';
import { Habit } from '@/lib/supabase/types';
import HabitInfoModal from './HabitInfoModal';
import { ShineBorder } from '../ui/shine-border';
import { HabitPileState } from '@/lib/enums'; // Import HabitPileState enum
import { Flame, Skull } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import { useSystemTime } from '@/components/providers/SystemTimeProvider';

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
  const { simulatedDate } = useSystemTime();

  const handleClick = () => {
    if (!disableClick) {
      setIsInfoModalOpen(true);
    }
  };
  
  const daysNeglected = isJunked && habit.junked_at 
    ? differenceInCalendarDays(simulatedDate || new Date(), new Date(habit.junked_at)) 
    : 0;

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
          
          {isJunked ? (
             <div className="inline-block rounded-[0.5rem] bg-destructive/20 px-2 py-1 text-[0.9rem] font-extrabold text-destructive flex items-center gap-1">
                <Skull size={14} />
                {daysNeglected > 0 ? `${daysNeglected}d` : ''}
             </div>
          ) : (
              /* Streak Counter */
              <div
                className="inline-block rounded-[0.5rem] bg-primary px-2 py-1 text-[0.9rem] font-extrabold text-primary-foreground flex items-center gap-1"
              >
                {habit.current_streak > 3 && <Flame size={14} className="fill-current" />}
                {habit.current_streak}
              </div>
          )}
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