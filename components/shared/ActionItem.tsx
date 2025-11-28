"use client";

import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus } from 'lucide-react';
import { Action, ActionsList } from './ActionsList'; // Import Action and ActionsList
import { CircularProgress } from '@/components/ui/circular-progress'; // Import CircularProgress
import { AddActionForm } from './AddActionForm'; // Import AddActionForm

interface ActionItemProps {
  action: Action;
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string) => void;
  justCompletedId?: string | null;
  level: number;
}

const getCompletionCounts = (action: Action): { total: number; completed: number } => {
  if (!action.children || action.children.length === 0) {
    return { total: 0, completed: 0 };
  }

  let total = 0;
  let completed = 0;

  action.children.forEach(child => {
    total++;
    if (child.completed) {
      completed++;
    }
  });

  return { total, completed };
};

export const ActionItem: React.FC<ActionItemProps> = ({ action, onActionToggled, onActionAdded, justCompletedId, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);

  const hasChildren = action.children && action.children.length > 0;
  const { total, completed } = getCompletionCounts(action);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div key={action.id} className="mb-2">
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-md bg-card border border-card-border shadow-sm transition-all duration-300",
          {
            "bg-accent/30 scale-95": justCompletedId === action.id,
          }
        )}
      >
        <Checkbox
          id={action.id}
          checked={action.completed}
          onCheckedChange={() => onActionToggled && onActionToggled(action.id)}
          className={cn("h-5 w-5 rounded-sm", { "pointer-events-none": !onActionToggled })}
        />
        <Label
          htmlFor={action.id}
          className={cn(
            "text-base font-medium text-foreground cursor-pointer flex-1 flex items-center group", // Added group for hover
            {
              "line-through": action.completed,
              "text-muted-foreground": action.completed && !!onActionToggled,
            }
          )}
        >
          {action.description}
          {onActionAdded && (
            <button
              onClick={() => setIsAddingSubItem(true)}
              className="ml-2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={14} />
            </button>
          )}
        </Label>
        {hasChildren && total > 0 && (
          <span className="flex items-center justify-center">
            <CircularProgress
              progress={progressPercentage}
              size={32}
              strokeWidth={2}
              color="text-primary"
              bgColor="text-muted-foreground"
            >
              <span className="text-xs text-muted-foreground">{completed}/{total}</span>
            </CircularProgress>
          </span>
        )}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-sm hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <ChevronDown size={16} className={cn("transition-transform", { "rotate-180": isExpanded })} />
          </button>
        )}
      </div>
      {isAddingSubItem && (
        <div className="ml-8 mt-2">
          <AddActionForm
            onSave={(description) => {
              onActionAdded?.(description, action.id);
              setIsAddingSubItem(false);
              setIsExpanded(true); // Expand to show the new sub-item
            }}
            onCancel={() => setIsAddingSubItem(false)}
          />
        </div>
      )}
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-2"> {/* Adjusted spacing for sub-items */}
          <ActionsList
            actions={action.children!}
            onActionToggled={onActionToggled}
            onActionAdded={onActionAdded}
            justCompletedId={justCompletedId}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};