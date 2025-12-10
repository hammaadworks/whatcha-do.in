"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ActionItem } from "./ActionItem";
import { ActionNode } from '@/lib/supabase/types'; // Import ActionNode from centralized types
import { ChevronDown, ChevronRight } from "lucide-react";

interface ActionsListProps {
  actions: ActionNode[]; // Use ActionNode
  onActionToggled?: (id: string) => Promise<ActionNode | undefined>;
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => Promise<void>;
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => Promise<void>;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  onActionPrivacyToggled?: (id: string) => void; // New prop
  onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => Promise<string>; // Now async, returns Promise<string>
  newlyAddedActionId?: string | null; // New prop for focusing and editing a newly added item
  justCompletedId?: string | null;
  level?: number;
  focusedActionId: string | null;
  setFocusedActionId: (id: string | null) => void;
  flattenedActions: ActionNode[];
  onConfettiTrigger?: (rect: DOMRect, isParent: boolean) => void; // New prop
  onNewlyAddedActionProcessed?: (id: string) => void; // New prop
  parentId?: string; // New prop for unique Yay button ID
  onNavigateNext?: () => void; // New prop
  onNavigatePrev?: () => void; // New prop
}

// Helper to flatten action tree (duplicated from ActionsSection, ideally move to utils)
const flattenActionTree = (nodes: ActionNode[]): ActionNode[] => {
    let flattened: ActionNode[] = [];
    nodes.forEach(node => {
        flattened.push(node);
        if (node.children && node.children.length > 0) {
            flattened = flattened.concat(flattenActionTree(node.children));
        }
    });
    return flattened;
};

export const ActionsList: React.FC<ActionsListProps> = ({ 
  actions, 
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
  newlyAddedActionId,
  justCompletedId,
  level = 0,
  focusedActionId,
  setFocusedActionId,
  flattenedActions: _ignoredFlattenedActions, // Ignore global flat list, we compute local ones
  onConfettiTrigger,
  onNewlyAddedActionProcessed,
  parentId = 'root',
  onNavigateNext, // Prop from parent to handle exit
  onNavigatePrev, // Prop from parent to handle exit
}) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const yayButtonRef = useRef<HTMLButtonElement>(null);
  const yayButtonId = `yay-toggle-${parentId}`;

  console.log('ActionsList render:', { 
    total: actions?.length, 
    active: actions?.filter(a => !a.completed).length, 
    completed: actions?.filter(a => a.completed).length 
  });

  if (!actions) return <div>No actions prop provided</div>;

  const activeActions = actions.filter(a => !a.completed);
  const completedActions = actions.filter(a => a.completed);

  // Compute local flat lists for navigation context
  const activeFlat = flattenActionTree(activeActions); // This includes children of active actions
  
  const flattenedActiveForNavigation = activeFlat.filter(a => !a.completed);
  const flattenedCompletedForNavigation = flattenActionTree(completedActions);

  const handleYayKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (flattenedActiveForNavigation.length > 0) {
              setFocusedActionId(flattenedActiveForNavigation[flattenedActiveForNavigation.length - 1].id);
          } else if (onNavigatePrev) {
              onNavigatePrev();
          }
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (showCompleted && flattenedCompletedForNavigation.length > 0) {
              setFocusedActionId(flattenedCompletedForNavigation[0].id);
          } else if (onNavigateNext) {
              onNavigateNext();
          }
      } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowCompleted(!showCompleted);
      }
  };

  // Focus effect for Yay button
  if (focusedActionId === yayButtonId && yayButtonRef.current) {
      yayButtonRef.current.focus();
  }

  const renderAction = (action: ActionNode, isCompletedGroup: boolean, nextSiblingId?: string) => (
    <ActionItem
      key={action.id}
      action={action}
      onActionToggled={onActionToggled}
      onActionAdded={onActionAdded}
      onActionUpdated={onActionUpdated}
      onActionDeleted={onActionDeleted}
      onActionIndented={onActionIndented}
      onActionOutdented={onActionOutdented}
      onActionMovedUp={onActionMovedUp}
      onActionMovedDown={onActionMovedDown}
      onActionPrivacyToggled={onActionPrivacyToggled}
      onActionAddedAfter={onActionAddedAfter}
      justCompletedId={justCompletedId}
      level={level}
      focusedActionId={focusedActionId}
      setFocusedActionId={setFocusedActionId}
      flattenedActions={isCompletedGroup ? flattenedCompletedForNavigation : flattenedActiveForNavigation}
      onConfettiTrigger={onConfettiTrigger}
      newlyAddedActionId={newlyAddedActionId}
      onNewlyAddedActionProcessed={onNewlyAddedActionProcessed}
      // Pass boundary handlers
      onNavigateNext={
          !isCompletedGroup 
            ? () => {
                if (nextSiblingId) {
                    setFocusedActionId(nextSiblingId);
                } else {
                    // End of Active List -> Go to Yay (if exists), else Parent Next
                    if (completedActions.length > 0) {
                        setFocusedActionId(yayButtonId);
                    } else if (onNavigateNext) {
                        onNavigateNext();
                    }
                }
            }
            : () => {
                if (nextSiblingId) {
                    setFocusedActionId(nextSiblingId);
                } else if (onNavigateNext) {
                    onNavigateNext();
                }
            }
      }
      onNavigatePrev={
          isCompletedGroup
            ? () => {
                // Start of Completed List -> Go to Yay (if we are the first item, Yay is above us)
                // Wait, ActionItem calls onNavigatePrev when it hits TOP.
                // If this is the first item in completed list, above is Yay.
                // But ActionItem doesn't know it's first.
                // Actually, if flattenedCompletedForNavigation works, ArrowUp handles siblings.
                // onNavigatePrev is only called if ArrowUp hits boundary.
                setFocusedActionId(yayButtonId);
            }
            : onNavigatePrev // Start of Active List -> Go to Parent Prev
      }
    />
  );

  return (
    <div className={cn("grid grid-cols-1 gap-y-2")}>
      {/* Active Actions */}
      {activeActions.map((a, index) => {
          const next = activeActions[index + 1];
          return renderAction(a, false, next?.id);
      })}

      {/* Completed Actions Section */}
      {completedActions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <button
            ref={yayButtonRef}
            id={yayButtonId}
            onClick={() => setShowCompleted(!showCompleted)}
            onKeyDown={handleYayKeyDown}
            className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 select-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm px-1 py-0.5",
                focusedActionId === yayButtonId && "ring-2 ring-primary/50"
            )}
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Yay ! ({completedActions.length})</span>
          </button>
          
          {showCompleted && (
            <div className="grid grid-cols-1 gap-y-2 opacity-75">
              {completedActions.map((a, index) => {
                  const next = completedActions[index + 1];
                  return renderAction(a, true, next?.id);
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};