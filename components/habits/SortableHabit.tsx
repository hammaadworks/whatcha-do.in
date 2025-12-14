"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableHabitProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * A wrapper component that makes its children sortable using `@dnd-kit`.
 * Used in the Habits Board for drag-and-drop functionality.
 */
export function SortableHabit({ id, children, disabled, className }: SortableHabitProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Prevent scrolling while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}
