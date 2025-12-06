"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, Trash2, Edit2, X, Check, Lock, Globe } from 'lucide-react';
import { ActionsList } from './ActionsList';
import { CircularProgress } from '@/components/ui/circular-progress';
import { AddActionForm } from './AddActionForm';
import { Input } from "@/components/ui/input";
import { ActionNode } from '@/lib/supabase/types';
import { areAllChildrenCompleted } from '@/lib/utils/actionTreeUtils';

interface ActionItemProps {
  action: ActionNode;
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => void;
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => void;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  onActionPrivacyToggled?: (id: string) => void;
  onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => void; // New prop
  justCompletedId?: string | null;
  level: number;
  focusedActionId: string | null;
  setFocusedActionId: (id: string | null) => void;
  flattenedActions: ActionNode[];
}

const getCompletionCounts = (action: ActionNode): { total: number; completed: number } => {
  if (!action.children || action.children.length === 0) {
    return { total: 0, completed: 0 };
  }

  let total = 0;
  let completed = 0;

  action.children.forEach((child: ActionNode) => {
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
  onActionAddedAfter, // Destructure new prop
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
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const hasChildren = action.children && action.children.length > 0;
  const { total, completed } = getCompletionCounts(action);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  const isDisabledForCompletion = hasChildren && !areAllChildrenCompleted(action);

  const isPublic = action.is_public ?? true;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

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
    divRef.current?.focus();
  };

  const handleEditCancel = () => {
    setEditText(action.description);
    setIsEditing(false);
    divRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;

    if (
        e.key === 'Enter' || e.key === ' ' || e.key === 'Tab' || e.key === 'Delete' || e.key === 'p' || e.key === 'P' ||
        (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) ||
        (!e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))
    ) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'Enter':
            if (e.shiftKey) {
                 // Add Below (Edit) - Shift + Enter
                 if (onActionAddedAfter) {
                     setIsAddingSubItem(false); // Close existing sub-item form if open
                     onActionAddedAfter(action.id, "", isPublic); // Add empty item after
                     // Note: Focus management for the new item's edit mode needs to be handled by ActionsList/Parent logic
                     // Typically, adding an empty item puts it in edit mode if logic exists, or focus moves to it.
                     // Since `onActionAddedAfter` adds a new node, `ActionsList` re-renders.
                     // We need a way to signal "Edit this new item".
                     // For now, consistent with "Alt+Enter" request which was "Add Below & Edit".
                     // `useActions` adds it. Focus should move to it.
                 }
            } else {
                onActionToggled?.(action.id);
            }
            break;
        case ' ':
            if (onActionUpdated) setIsEditing(true);
            break;
        case 'p':
        case 'P':
             onActionPrivacyToggled?.(action.id);
             break;
        case 'Tab':
            if (e.shiftKey) {
                onActionOutdented?.(action.id);
            } else {
                onActionIndented?.(action.id);
            }
            break;
        case 'ArrowUp':
            if (e.shiftKey) {
                onActionMovedUp?.(action.id);
            } else {
                const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
                if (currentIndex > 0) {
                    setFocusedActionId?.(flattenedActions[currentIndex - 1].id);
                }
            }
            break;
        case 'ArrowDown':
            if (e.shiftKey) {
                onActionMovedDown?.(action.id);
            } else {
                const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
                if (currentIndex < flattenedActions.length - 1) {
                    setFocusedActionId?.(flattenedActions[currentIndex + 1].id);
                }
            }
            break;
        case 'Delete':
            onActionDeleted?.(action.id);
            const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
            if (currentIndex >= 0 && flattenedActions.length > 1) {
                const nextFocusIndex = currentIndex < flattenedActions.length - 1 ? currentIndex + 1 : currentIndex - 1;
                setFocusedActionId?.(flattenedActions[nextFocusIndex].id);
            } else {
                setFocusedActionId?.(null);
            }
            break;
    }
  };

  return (
    <div key={action.id} className="mb-2">
      <div
        ref={divRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-md border shadow-sm transition-all duration-300 group focus:outline-none",
          isFocused ? "border-primary-light ring-2 ring-primary-light" : "border-card-border",
          {
            "bg-accent/30 scale-95": justCompletedId === action.id,
            "bg-card": !action.completed && isPublic,
            "bg-yellow-50/50 dark:bg-yellow-900/10 border-dashed border-yellow-300 dark:border-yellow-800": !isPublic,
            "bg-muted-foreground/10 text-muted-foreground": action.completed && !isFocused,
          }
        )}
      >
        <Checkbox
          id={action.id}
          checked={action.completed}
          onCheckedChange={() => onActionToggled && onActionToggled(action.id)}
          disabled={isDisabledForCompletion && !action.completed}
          className={cn(
            "h-5 w-5 rounded-full", 
            { 
              "pointer-events-none opacity-50 cursor-not-allowed": isDisabledForCompletion && !action.completed,
              "pointer-events-none": !onActionToggled
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