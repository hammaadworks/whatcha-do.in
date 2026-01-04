"use client";

import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Edit2, Globe, Lock, Plus, Trash2, X, GripVertical, MoreHorizontal } from "lucide-react";
import { ActionsList } from "./ActionsList";
import { CircularProgress } from "@/components/ui/circular-progress";
import { AddActionForm } from "./AddActionForm";
import { Input } from "@/components/ui/input";
import { ActionNode } from "@/lib/supabase/types";
import { areAllChildrenCompleted } from "@/lib/logic/actions/tree-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, PanInfo } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the ActionItem component.
 * Handles display, interaction, and recursive rendering of action items.
 */
interface ActionItemProps {
  /** The action node data to display. */
  action: ActionNode;
  /** Callback to toggle the completion status of the action. */
  onActionToggled?: (id: string) => Promise<ActionNode | undefined>;
  /** Callback to add a new sub-action. */
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => Promise<void>;
  /** Callback to update the text of the action. */
  onActionUpdated?: (id: string, newText: string) => void;
  /** Callback to delete the action. */
  onActionDeleted?: (id: string) => void;
  /** Callback to indent (nest) the action. */
  onActionIndented?: (id: string) => Promise<void>;
  /** Callback to outdent (un-nest) the action. */
  onActionOutdented?: (id: string) => void;
  /** Callback to move the action up in the list. */
  onActionMovedUp?: (id: string) => void;
  /** Callback to move the action down in the list. */
  onActionMovedDown?: (id: string) => void;
  /** Callback to toggle the public/private status of the action. */
  onActionPrivacyToggled?: (id: string) => void;
  /** Callback to add a new sibling action immediately after this one. */
  onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => Promise<string>;
  /** Handler to navigate focus to the next item in the flattened list. */
  onNavigateNext?: () => void;
  /** Handler to navigate focus to the previous item in the flattened list. */
  onNavigatePrev?: () => void;
  /** ID of an action that was just completed, for animation/highlighting purposes. */
  justCompletedId?: string | null;
  /** The nesting level of this item (0 for root). */
  level: number;
  /** The ID of the currently focused action in the list. */
  focusedActionId: string | null;
  /** Function to set the focused action ID. */
  setFocusedActionId: (id: string | null) => void;
  /** Flattened list of actions for keyboard navigation context. */
  flattenedActions: ActionNode[];
  /** ID of a newly added action to auto-focus/edit. */
  newlyAddedActionId?: string | null;
  isFutureBucket?: boolean; // New prop
  onActionMoveToCurrent?: (id: string) => Promise<void>; // New prop
  /** Callback to signal that the newly added action has been processed (focused). */
  onNewlyAddedActionProcessed?: (id: string) => void;
}

/**
 * Helper to calculate completion statistics for a node's children.
 */
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

/**
 * ActionItem Component
 *
 * Represents a single node in the Action tree. It handles:
 * - Rendering the action state (checkbox, text, metadata).
 * - Inline editing.
 * - Keyboard navigation (Arrow keys, Enter, etc.).
 * - Recursive rendering of child actions via `ActionsList`.
 */
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
                                                        onActionAddedAfter,
                                                        onNavigateNext,
                                                        onNavigatePrev,
                                                        justCompletedId,
                                                        level,
                                                        focusedActionId,
                                                        setFocusedActionId,
                                                        flattenedActions,
                                                        newlyAddedActionId,
                                                        onNewlyAddedActionProcessed,
                                                        isFutureBucket, // Destructure new prop
                                                        onActionMoveToCurrent // Destructure new prop
                                                      }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Mobile edit modal state
  const [editText, setEditText] = useState(action.description);
  const editInputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Local state for delayed completion
  const [isCompleting, setIsCompleting] = useState(false);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasChildren = action.children && action.children.length > 0;
  const { total, completed } = getCompletionCounts(action);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  const isDisabledForCompletion = hasChildren && !areAllChildrenCompleted(action);

  const isPublic = action.is_public ?? true;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  // Handle delayed toggle
  const handleToggle = async () => {
    if (!onActionToggled) return;

    if (action.completed) {
      // Unmarking: Immediate
      await onActionToggled(action.id);
    } else {
      // Marking as done: Delayed
      if (isCompleting) {
        // User cancelled the completion (e.g., clicked again during delay)
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current);
          completionTimeoutRef.current = null;
        }
        setIsCompleting(false);
      } else {
        // Start completion timer
        setIsCompleting(true);
        completionTimeoutRef.current = setTimeout(async () => {
          await onActionToggled(action.id);
          // We don't necessarily need to set isCompleting(false) here because component might unmount/rerender with new state
          if (divRef.current) setIsCompleting(false); 
        }, 2000);
      }
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  // Focus the item div when it becomes the focused action
  useEffect(() => {
    if (divRef.current && focusedActionId === action.id) {
      divRef.current.focus();
    }
  }, [focusedActionId, action.id]);

  // Effect to automatically enter edit mode for newly added action
  useEffect(() => {
    if (newlyAddedActionId === action.id && focusedActionId === action.id && !isEditing && !isEditModalOpen) {
      handleEditStart();
      onNewlyAddedActionProcessed?.(action.id);
    }
  }, [newlyAddedActionId, focusedActionId, action.id, isEditing, isEditModalOpen, onNewlyAddedActionProcessed]);

  // Sync local editText with prop changes
  useEffect(() => {
    if (!isEditing && !isEditModalOpen && editText !== action.description) {
      setEditText(action.description);
    }
  }, [action.description, isEditing, isEditModalOpen, editText]);


  const handleEditStart = () => {
    if (isDesktop) {
      setIsEditing(true);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = () => {
    if (editText.trim()) {
      onActionUpdated?.(action.id, editText.trim());
    } else {
      onActionDeleted?.(action.id); // Delete if empty
    }
    setIsEditing(false);
    setIsEditModalOpen(false);
    setTimeout(() => {
      divRef.current?.focus();
    }, 0);
  };

  const handleEditCancel = () => {
    setEditText(action.description);
    setIsEditing(false);
    setIsEditModalOpen(false);
    setTimeout(() => {
      divRef.current?.focus();
    }, 0);
  };

  /**
   * Complex keyboard navigation handler.
   * Supports navigation (Arrows), editing (Enter/Space), indentation (Tab), and structure mutation.
   */
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;

    // Prevent default browser scrolling/behavior for common navigation keys
    if (
      e.key === "Enter" || e.key === " " || e.key === "Tab" || e.key === "Delete" || e.key === "p" || e.key === "P" ||
      (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) ||
      (!e.altKey && !e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown"))
    ) {
      e.preventDefault();
    }

    switch (e.key) {
      case "Enter":
        if (e.shiftKey) {
          // Shift + Enter: Add sibling below
          if (onActionAddedAfter) {
            setIsAddingSubItem(false);
            const newActionId = await onActionAddedAfter(action.id, "", isPublic);
            setFocusedActionId(newActionId);
          }
        } else {
          // Enter: Toggle completion
          handleToggle();
        }
        break;
      case " ":
        // Space: Start editing
        if (onActionUpdated) handleEditStart();
        break;
      case "p":
      case "P":
        // P: Toggle privacy
        onActionPrivacyToggled?.(action.id);
        break;
      case "Tab":
        if (e.shiftKey) {
          onActionOutdented?.(action.id);
        } else {
          await onActionIndented?.(action.id);
        }
        break;
      case "ArrowUp":
        if (e.altKey) {
          onActionMovedUp?.(action.id);
        } else {
          const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
          if (currentIndex > 0) {
            setFocusedActionId?.(flattenedActions[currentIndex - 1].id);
          } else if (onNavigatePrev) {
            onNavigatePrev();
          }
        }
        break;
      case "ArrowDown":
        if (e.altKey) {
          onActionMovedDown?.(action.id);
        } else {
          // Navigation logic considering children visibility
          if (hasChildren && isExpanded) {
            const currentIndex = flattenedActions.findIndex(a => a.id === action.id);
            if (currentIndex < flattenedActions.length - 1 && currentIndex !== -1) {
              setFocusedActionId?.(flattenedActions[currentIndex + 1].id);
            }
          } else {
            if (onNavigateNext) {
              onNavigateNext();
            }
          }
        }
        break;
      case "Delete":
        onActionDeleted?.(action.id);
        // Smart focus move after deletion
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

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 50) { // Swipe Right -> Indent
       onActionIndented?.(action.id);
    } else if (info.offset.x < -50) { // Swipe Left -> Outdent
       onActionOutdented?.(action.id);
    }
  };

  return (
    <motion.div
      key={action.id}
      className="mb-2 touch-pan-y" // Allow vertical scroll
      role="listitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, zIndex: 10 }} // Visual feedback
    >
      <div
        ref={divRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="button" // Indicates this element is interactive
        aria-label={`${action.description} ${action.completed ? "(Completed)" : ""}`}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-md border shadow-sm transition-all duration-300 group focus:outline-none min-w-0", // Added min-w-0 for proper flex shrinking
          isFocused ? "border-primary-light ring-2 ring-primary-light" : "border-card-border",
          {
            "bg-accent/30 scale-95": justCompletedId === action.id,
            "bg-card": !action.completed && !isCompleting,
            "bg-muted-foreground/10 text-muted-foreground": (action.completed || isCompleting) && !isFocused
          }
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50 mr-2 shrink-0 cursor-grab active:cursor-grabbing" />
        <Checkbox
          id={action.id}
          checked={action.completed || isCompleting}
          onCheckedChange={handleToggle}
          disabled={isDisabledForCompletion && !action.completed}
          className={cn(
            "h-5 w-5 rounded-full z-10 shrink-0", // Added shrink-0
            {
              "pointer-events-none opacity-50 cursor-not-allowed": isDisabledForCompletion && !action.completed,
              "pointer-events-none": !onActionToggled
            }
          )}
          aria-label={`Mark ${action.description} as completed`}
        />

        {isEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <Input
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSave();
                if (e.key === "Escape") handleEditCancel();
              }}
              className="h-8 text-base"
              aria-label="Edit action description"
            />
            <button onClick={handleEditSave} className="text-primary hover:text-primary/80" aria-label="Save"><Check
              size={16} /></button>
            <button onClick={handleEditCancel} className="text-destructive hover:text-destructive/80"
                    aria-label="Cancel"><X size={16} /></button>
          </div>
        ) : (
          <Label
            htmlFor={action.id}
            className={cn(
              "text-base font-medium text-foreground cursor-pointer flex-1 flex items-center select-none z-10",
              {
                "line-through text-muted-foreground": action.completed || isCompleting
              }
            )}
            onDoubleClick={() => {
              if (onActionUpdated) handleEditStart();
            }}
          >
            <span className="flex-1 min-w-0 break-words break-all [overflow-wrap:anywhere] whitespace-normal leading-snug">
              {action.description}
            </span>
            {!isPublic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock size={14} className="ml-2 text-muted-foreground/60 shrink-0" aria-label="Private" />
                  </TooltipTrigger>
                  <TooltipContent>This action is private</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
        )}

        {/* Action Buttons (Desktop: Row, Mobile: Dropdown) */}
        {/* Desktop View */}
        <div className="hidden lg:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" role="group"
             aria-label="Action controls">
          {onActionPrivacyToggled && (
            <button
              onClick={() => onActionPrivacyToggled(action.id)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              title={isPublic ? "Make Private" : "Make Public"}
              aria-label={isPublic ? "Make Private" : "Make Public"}
            >
              {isPublic ? <Globe size={14} /> : <Lock size={14} />}
            </button>
          )}
          {onActionUpdated && !isEditing && (
            <button
              onClick={handleEditStart}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              title="Edit"
              aria-label="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onActionAdded && (
            <button
              onClick={() => setIsAddingSubItem(true)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              title="Add Sub-action"
              aria-label="Add Sub-action"
            >
              <Plus size={14} />
            </button>
          )}
          {onActionDeleted && (
            <button
              onClick={() => onActionDeleted(action.id)}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground focus:outline-none">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onActionPrivacyToggled && (
                <DropdownMenuItem onClick={() => onActionPrivacyToggled(action.id)}>
                  {isPublic ? <Lock size={14} className="mr-2"/> : <Globe size={14} className="mr-2"/>}
                  {isPublic ? "Make Private" : "Make Public"}
                </DropdownMenuItem>
              )}
              {onActionUpdated && !isEditing && (
                <DropdownMenuItem onClick={handleEditStart}>
                  <Edit2 size={14} className="mr-2"/>
                  Edit
                </DropdownMenuItem>
              )}
               {onActionAdded && (
                <DropdownMenuItem onClick={() => setIsAddingSubItem(true)}>
                  <Plus size={14} className="mr-2"/>
                  Add Sub-action
                </DropdownMenuItem>
              )}
              {onActionDeleted && (
                <DropdownMenuItem onClick={() => onActionDeleted(action.id)} className="text-destructive focus:text-destructive">
                  <Trash2 size={14} className="mr-2"/>
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isFutureBucket && onActionMoveToCurrent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onActionMoveToCurrent(action.id)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                  title="Move to Current Month"
                  aria-label="Move to Current Month"
                >
                  <ChevronDown size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Move to Current Month</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {hasChildren && total > 0 && (
          <span className="flex items-center justify-center"
                aria-label={`Progress: ${completed} of ${total} completed`}>
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
            className="p-1.5 rounded-sm hover:bg-accent/50"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
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

      {/* Mobile Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Action</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="edit-action"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[100px]"
              placeholder="Action description..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEditSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasChildren && isExpanded && (
        <div className="ml-4 mt-2 border-l-2 border-border pl-2" role="group">
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
            parentId={action.id}
            onNavigatePrev={() => setFocusedActionId(action.id)}
            onNavigateNext={onNavigateNext}
          />
        </div>
      )}
    </motion.div>
  );
};
