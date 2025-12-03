"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, Trash2, Edit2, X, Check, Lock, Globe } from 'lucide-react'; // Added Lock, Globe
import { ActionsList } from './ActionsList';
import { CircularProgress } from '@/components/ui/circular-progress';
import { AddActionForm } from './AddActionForm';
import { Input } from "@/components/ui/input";
import { ActionNode } from '@/lib/supabase/types'; // Import ActionNode
import { areAllChildrenCompleted } from '@/lib/utils/actionTreeUtils'; // Import areAllChildrenCompleted

interface ActionItemProps {
  action: ActionNode; // Use ActionNode
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => void; // Corrected signature
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => void; // New prop
  onActionOutdented?: (id: string) => void; // New prop
  onActionMovedUp?: (id: string) => void;   // New prop
  onActionMovedDown?: (id: string) => void; // New prop
  onActionPrivacyToggled?: (id: string) => void; // New prop
  justCompletedId?: string | null;
  level: number;
  focusedActionId: string | null; // New prop
  setFocusedActionId: (id: string | null) => void; // New prop
  flattenedActions: ActionNode[]; // New prop
}

const getCompletionCounts = (action: ActionNode): { total: number; completed: number } => { // Use ActionNode
  if (!action.children || action.children.length === 0) {
    return { total: 0, completed: 0 };
  }

  let total = 0;
  let completed = 0;

  action.children.forEach((child: ActionNode) => { // Type child explicitly
    total++;
    if (child.completed) {
      completed++;
    }
  });

  return { total, completed };
};

export const ActionItem: React.FC<ActionItemProps> = ({
  action,
  onActionToggled,
  onActionAdded,
  onActionUpdated,
  onActionDeleted,
  onActionIndented,
  onActionOutdented,
  onActionMovedUp,
  onActionMovedDown,
  onActionPrivacyToggled,
  justCompletedId,
  level,
  focusedActionId,
  setFocusedActionId,
  flattenedActions
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(action.description);
  const editInputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null); // Ref for the main div
  const [isFocused, setIsFocused] = useState(false); // State for focus styling

  const hasChildren = action.children && action.children.length > 0;
  const { total, completed } = getCompletionCounts(action);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  const isDisabledForCompletion = hasChildren && !areAllChildrenCompleted(action);

  // Default to true if undefined
  const isPublic = action.is_public ?? true;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  // Effect to focus the current item if its ID matches focusedActionId
  useEffect(() => {
    if (divRef.current && focusedActionId === action.id) {
      divRef.current.focus();
    }
  }, [focusedActionId, action.id]);


  const handleEditSave = () => {
    if (editText.trim()) {
      onActionUpdated?.(action.id, editText.trim());
    } else {
        setEditText(action.description);
    }
    setIsEditing(false);
    divRef.current?.focus(); // Re-focus the item after editing
  };

  const handleEditCancel = () => {
    setEditText(action.description);
    setIsEditing(false);
    divRef.current?.focus(); // Re-focus the item after canceling
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // If we're editing, let the input handle its own key events
    if (isEditing) return;

    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior (losing focus)
      if (e.shiftKey) {
        onActionOutdented?.(action.id);
      } else {
        onActionIndented?.(action.id);
      }
      // Re-focus the item after indent/outdent
      divRef.current?.focus();
    } else if (e.metaKey || e.ctrlKey) { // For Cmd/Ctrl + Shift + Arrow keys
      if (e.shiftKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          onActionMovedUp?.(action.id);
          divRef.current?.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          onActionMovedDown?.(action.id);
          divRef.current?.focus();
        }
      }
    } else if (e.key === 'ArrowUp') { // ArrowUp for navigation
      e.preventDefault();
      const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
      if (currentIndex > 0) {
        setFocusedActionId?.(flattenedActions[currentIndex - 1].id);
      }
    } else if (e.key === 'ArrowDown') { // ArrowDown for navigation
      e.preventDefault();
      const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
      if (currentIndex < flattenedActions.length - 1) {
        setFocusedActionId?.(flattenedActions[currentIndex + 1].id);
      }
    }
  };
  return (
    <div key={action.id} className="mb-2">
      <div
        ref={divRef}
        tabIndex={0} // Make the div focusable
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-md border shadow-sm transition-all duration-300 group focus:outline-none", // Add focus:outline-none
          isFocused ? "border-primary-light ring-2 ring-primary-light" : "border-card-border", // Focus styling
          {
            "bg-accent/30 scale-95": justCompletedId === action.id,
            "bg-card": !action.completed && isPublic, // Default background for uncompleted public
            "bg-yellow-50/50 dark:bg-yellow-900/10 border-dashed border-yellow-300 dark:border-yellow-800": !isPublic, // Private styling
            "bg-muted-foreground/10 text-muted-foreground": action.completed && !isFocused, // Gray out completed items
          }
        )}
      >
        <Checkbox
          id={action.id}
          checked={action.completed}
          onCheckedChange={() => onActionToggled && onActionToggled(action.id)}
          disabled={isDisabledForCompletion && !action.completed} // Disable if has uncompleted children and not yet completed
          className={cn(
            "h-5 w-5 rounded-full", 
            { 
              "pointer-events-none opacity-50 cursor-not-allowed": isDisabledForCompletion && !action.completed,
              "pointer-events-none": !onActionToggled // Still disable if no toggle handler
            }
          )}
        />
        
        {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
                <Input 
                    ref={editInputRef}
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                    }}
                    className="h-8 text-base"
                />
                <button onClick={handleEditSave} className="text-green-500 hover:text-green-600"><Check size={16}/></button>
                <button onClick={handleEditCancel} className="text-red-500 hover:text-red-600"><X size={16}/></button>
            </div>
        ) : (
            <Label
            htmlFor={action.id}
            className={cn(
                "text-base font-medium text-foreground cursor-pointer flex-1 flex items-center select-none",
                {
                "line-through text-muted-foreground": action.completed,
                }
            )}
            onDoubleClick={() => {
                if (onActionUpdated) setIsEditing(true);
            }}
            >
            {action.description}
            {!isPublic && <Lock size={12} className="ml-2 text-yellow-600 dark:text-yellow-400 opacity-50" />}
            </Label>
        )}

        {/* Action Buttons (Visible on Hover) */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onActionPrivacyToggled && (
                <button
                    onClick={() => onActionPrivacyToggled(action.id)}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                    title={isPublic ? "Make Private" : "Make Public"}
                >
                    {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                </button>
            )}
            {onActionUpdated && !isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Edit"
                >
                    <Edit2 size={14} />
                </button>
            )}
            {onActionAdded && (
                <button
                onClick={() => setIsAddingSubItem(true)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Add Sub-action"
                >
                <Plus size={14} />
                </button>
            )}
            {onActionDeleted && (
                <button
                    onClick={() => onActionDeleted(action.id)}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>

        {hasChildren && total > 0 && (
          <span className="flex items-center justify-center">
            <CircularProgress
              progress={progressPercentage}
              size={40}
              strokeWidth={4}
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
              // Determine if the new sub-action should be public or private
              // If current parent is private, sub-action MUST be private.
              // If current parent is public, sub-action defaults to public (true).
              // addActionToTree in utils handles this enforcement, but we can also pass the correct flag here.
              const newActionIsPublic = isPublic; 
              onActionAdded?.(description, action.id, newActionIsPublic); 
              setIsAddingSubItem(false);
              setIsExpanded(true); 
            }}
            onCancel={() => setIsAddingSubItem(false)}
          />
        </div>
      )}
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-2 border-l-2 border-border pl-2">
          <ActionsList
            actions={action.children!}
            onActionToggled={onActionToggled}
            onActionAdded={onActionAdded}
            onActionUpdated={onActionUpdated}
            onActionDeleted={onActionDeleted}
            onActionIndented={onActionIndented}
            onActionOutdented={onActionOutdented}
            onActionMovedUp={onActionMovedUp}
            onActionMovedDown={onActionMovedDown}
            onActionPrivacyToggled={onActionPrivacyToggled}
            justCompletedId={justCompletedId}
            level={level + 1}
            focusedActionId={focusedActionId}
            setFocusedActionId={setFocusedActionId}
            flattenedActions={flattenedActions}
          />
        </div>
      )}
    </div>
  );
};
