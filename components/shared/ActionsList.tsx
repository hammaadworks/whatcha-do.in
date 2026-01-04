"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ActionItem } from "./ActionItem";
import { ActionNode } from "@/lib/supabase/types";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Props for the ActionsList component.
 */
interface ActionsListProps {
  /** Array of ActionNodes to display in this list. */
  actions: ActionNode[];
  onActionToggled?: (id: string) => Promise<ActionNode | undefined>;
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => Promise<void>;
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => Promise<void>;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  onActionPrivacyToggled?: (id: string) => void;
  onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => Promise<string>;
  newlyAddedActionId?: string | null;
  justCompletedId?: string | null;
  level?: number;
  focusedActionId: string | null;
  setFocusedActionId: (id: string | null) => void;
  /** Flattened list passed from parent (if any), currently re-calculated locally for navigation context. */
  flattenedActions: ActionNode[];
  onNewlyAddedActionProcessed?: (id: string) => void;
  /** Parent ID to uniquely identify the "Yay" toggle button. */
  parentId?: string;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  isFutureBucket?: boolean; // New prop
  onActionMoveToCurrent?: (id: string) => Promise<void>; // New prop
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

/**
 * Recursive list component that renders a list of `ActionItem`s.
 * Handles separating active vs. completed items and the "Yay!" completed toggle.
 */
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
                                                          flattenedActions: _ignoredFlattenedActions, // Kept to satisfy interface but we re-compute locally for this level context
                                                          onNewlyAddedActionProcessed,
                                                          parentId = "root",
                                                          onNavigateNext,
                                                          onNavigatePrev,
                                                          isFutureBucket, // Destructure new prop
                                                          onActionMoveToCurrent // Destructure new prop
                                                        }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const yayButtonRef = useRef<HTMLButtonElement>(null);
  const yayButtonId = `yay-toggle-${parentId}`;

  if (!actions) return <div>No actions prop provided</div>;

  if (actions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 border-border/50 border-dashed">
              <p className="text-muted-foreground italic">
                  {onActionAdded 
                      ? "No actions yet. Add one to get started!" 
                      : "No actions to show."}
              </p>
          </div>
      );
  }

  const activeActions = actions.filter(a => !a.completed);
  const completedActions = actions.filter(a => a.completed);

  // Compute local flat lists for navigation context
  const activeFlat = flattenActionTree(activeActions); // This includes children of active actions

  const flattenedActiveForNavigation = activeFlat.filter(a => !a.completed);
  const flattenedCompletedForNavigation = flattenActionTree(completedActions);

  const handleYayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flattenedActiveForNavigation.length > 0) {
        setFocusedActionId(flattenedActiveForNavigation[flattenedActiveForNavigation.length - 1].id);
      } else if (onNavigatePrev) {
        onNavigatePrev();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showCompleted && flattenedCompletedForNavigation.length > 0) {
        setFocusedActionId(flattenedCompletedForNavigation[0].id);
      } else if (onNavigateNext) {
        onNavigateNext();
      }
    } else if (e.key === "Enter" || e.key === " ") {
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
            // Start of Completed List -> Go to Yay
            setFocusedActionId(yayButtonId);
          }
          : onNavigatePrev // Start of Active List -> Go to Parent Prev
      }
      isFutureBucket={isFutureBucket} // Pass new prop
      onActionMoveToCurrent={onActionMoveToCurrent} // Pass new prop
    />
  );

  return (
    <div className={cn("grid grid-cols-1 gap-y-2")} role="list">
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
            aria-expanded={showCompleted}
            aria-controls={`completed-list-${parentId}`}
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 select-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm px-1 py-0.5",
              focusedActionId === yayButtonId && "ring-2 ring-primary/50"
            )}
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Yay ! ({completedActions.length})</span>
          </button>

          {showCompleted && (
            <div
              id={`completed-list-${parentId}`}
              className="grid grid-cols-1 gap-y-2 opacity-75"
              role="list"
            >
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