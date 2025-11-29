'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActionsList } from '@/components/shared/ActionsList';
import { ActionNode } from '@/lib/supabase/types'; // Correct import for ActionNode
import { AddActionForm } from '@/components/shared/AddActionForm';
import { CircularProgress } from '@/components/ui/circular-progress';
import { mockPublicActionsData } from '@/lib/mock-data'; // Import mock data
import { Skeleton } from '@/components/ui/skeleton';

// Helper to recursively count total and completed actions
const getOverallCompletionCounts = (nodes: ActionNode[]): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;

  nodes.forEach(node => {
    total++; // Count the current node
    if (node.completed) {
      completed++;
    }

    if (node.children && node.children.length > 0) {
      const childrenCounts = getOverallCompletionCounts(node.children);
      total += childrenCounts.total;
      completed += childrenCounts.completed;
    }
  });

  return { total, completed };
};

// Flatten the action tree for easier linear navigation
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

interface ActionsSectionProps {
  isOwner: boolean;
  actions: ActionNode[]; // Now required prop
  loading: boolean; // Now required prop
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string) => void;
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => void;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  justCompletedId?: string | null;
}

const ActionsSection: React.FC<ActionsSectionProps> = ({
  isOwner,
  actions,
  loading,
  onActionToggled,
  onActionAdded,
  onActionUpdated,
  onActionDeleted,
  onActionIndented,
  onActionOutdented,
  onActionMovedUp,
  onActionMovedDown,
  justCompletedId,
}) => {
  const addActionFormRef = useRef<{ focusInput: () => void; clearInput: () => void; isInputFocused: () => boolean; isInputEmpty: () => boolean }>(null);
  const [focusedActionId, setFocusedActionId] = useState<string | null>(null);

  const displayActions = isOwner
    ? actions
    : mockPublicActionsData; // This is the correct declaration

  useEffect(() => {
    if (!isOwner) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+I or Cmd+I
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault(); // Prevent browser's default behavior

        if (addActionFormRef.current) {
          if (addActionFormRef.current.isInputFocused()) {
            if (addActionFormRef.current.isInputEmpty()) {
              addActionFormRef.current.clearInput();
              addActionFormRef.current.focusInput(); // Keep focus but clear
            }
          } else {
            addActionFormRef.current.focusInput();
          }
        }
      } else if (event.key === 'Escape' && addActionFormRef.current?.isInputFocused() && addActionFormRef.current?.isInputEmpty()) {
        event.preventDefault();
        addActionFormRef.current.clearInput();
        const flattened = flattenActionTree(displayActions); // This needs displayActions
        if (flattened.length > 0) {
          setFocusedActionId(flattened[flattened.length - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOwner, displayActions]); // displayActions is now a proper dependency

  const { total: overallTotal, completed: overallCompleted } = getOverallCompletionCounts(displayActions);
  const overallProgressPercentage = overallTotal > 0 ? (overallCompleted / overallTotal) * 100 : 0;

  if (loading && isOwner) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-11/12" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-10/12" />
      </div>
    );
  }

  return (
    <div className="section mb-10">
      <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
        <h2 className="text-2xl font-extrabold flex items-center gap-3">
          Actions
          {overallTotal > 0 && (
            <CircularProgress
              progress={overallProgressPercentage}
              size={36}
              strokeWidth={3}
              color="text-primary"
              bgColor="text-muted-foreground"
            >
              <span className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
            </CircularProgress>
          )}
        </h2>
      </div>
      <ActionsList
        actions={displayActions}
        onActionToggled={isOwner ? onActionToggled : undefined}
        onActionAdded={isOwner ? onActionAdded : undefined}
        onActionUpdated={isOwner ? onActionUpdated : undefined}
        onActionDeleted={isOwner ? onActionDeleted : undefined}
        onActionIndented={isOwner ? onActionIndented : undefined}
        onActionOutdented={isOwner ? onActionOutdented : undefined}
        onActionMovedUp={isOwner ? onActionMovedUp : undefined}
        onActionMovedDown={isOwner ? onActionMovedDown : undefined}
        justCompletedId={justCompletedId}
        focusedActionId={focusedActionId}
        setFocusedActionId={setFocusedActionId}
        flattenedActions={flattenActionTree(displayActions)}
      />
      {isOwner && (
        <div className="mt-4">
          <AddActionForm
            ref={addActionFormRef}
            onSave={(desc) => {
              onActionAdded?.(desc);
              addActionFormRef.current?.clearInput();
              addActionFormRef.current?.focusInput();
            }}
            onCancel={() => {
              addActionFormRef.current?.clearInput();
              const flattened = flattenActionTree(displayActions);
              if (flattened.length > 0) {
                setFocusedActionId(flattened[flattened.length - 1].id);
              }
            }}
            placeholder="Add new action (Ctrl+I / Cmd+I)"
            autoFocusOnMount={false}
          />
        </div>
      )}
    </div>
  );
};

export default ActionsSection;

