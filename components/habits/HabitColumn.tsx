import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableHabit } from './SortableHabit';
import { Habit } from '@/lib/supabase/types';

interface HabitColumnProps {
  id: string;
  title: string;
  habits: Habit[];
  renderHabit: (habit: Habit) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

/**
 * A reusable column component for the Habits Board.
 * Handles Droppable logic and Sortable list rendering.
 */
export function HabitColumn({
  id,
  title,
  habits,
  renderHabit,
  className,
  disabled,
  emptyMessage = "No habits here.",
  headerContent,
  footerContent,
}: HabitColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {headerContent}
      </div>
      
      <SortableContext items={habits.map((h) => h.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {habits.length > 0 ? (
            habits.map((h) => (
              <SortableHabit key={h.id} id={h.id} disabled={disabled}>
                {renderHabit(h)}
              </SortableHabit>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          )}
        </div>
      </SortableContext>
      {footerContent}
    </div>
  );
}
