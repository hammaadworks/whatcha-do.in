'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActionsList } from '@/components/shared/ActionsList';
import { ActionNode } from '@/lib/supabase/types'; // Correct import for ActionNode
import { AddActionForm } from '@/components/shared/AddActionForm';
import { CircularProgress } from '@/components/ui/circular-progress';
import { mockPublicActionsData } from '@/lib/mock-data'; // Import mock data
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react'; // Import Check icon

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
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => void; // Updated signature
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => void;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  onActionPrivacyToggled?: (id: string) => void; // New prop
  justCompletedId?: string | null;
  privateCount?: number; // New prop
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
  onActionPrivacyToggled,
  justCompletedId,
  privateCount = 0,
}) => {
  const addActionFormRef = useRef<{ focusInput: () => void; clearInput: () => void; isInputFocused: () => boolean; isInputEmpty: () => boolean; blurInput: () => void; }>(null);
  const [focusedActionId, setFocusedActionId] = useState<string | null>(null);

  const displayActions = isOwner
    ? actions
    : mockPublicActionsData; // Note: This logic seems to be overridden by 'actions' passed from props in real implementation, but adhering to existing code structure. In public view 'actions' prop holds real public data.
    
  // Correcting the display logic: if not owner, use 'actions' prop which contains public actions (fetched in page.tsx), UNLESS it's empty/mock logic requires it.
  // The previous code used `isOwner ? actions : mockPublicActionsData`. 
  // Since we are now passing real public actions to this component in PublicPage, we should use `actions` directly if provided and not empty?
  // Actually, looking at PublicPage.tsx, it passes `publicActions` to `actions`. So `actions` holds the correct data for both owner (all) and public (filtered).
  // The `mockPublicActionsData` seems like a placeholder or fallback. 
  // I will respect the existing logic but `actions` should be the source of truth if available.
  
  const actualDisplayActions = actions.length > 0 ? actions : (isOwner ? [] : mockPublicActionsData);
  // But wait, if the user has 0 public actions, we shouldn't show mock data.
  // Let's assume `actions` passed in is correct.
  
  const itemsToRender = actions; 

  useEffect(() => {
    if (!isOwner) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+I or Cmd+I
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault(); // Prevent browser's default behavior

        if (addActionFormRef.current) {
          if (addActionFormRef.current.isInputFocused() && addActionFormRef.current.isInputEmpty()) {
            // If form is focused and empty, blur it and focus the first action item
            addActionFormRef.current.blurInput();
            const flattened = flattenActionTree(itemsToRender);
            if (flattened.length > 0) {
              setFocusedActionId(flattened[0].id); // Focus the first action item
            }
          } else {
            // Otherwise, focus the form (if not focused, or if not empty)
            addActionFormRef.current.focusInput();
          }
        }
      } else if (event.key === 'Escape' && addActionFormRef.current?.isInputFocused() && addActionFormRef.current?.isInputEmpty()) {
        event.preventDefault();
        addActionFormRef.current.clearInput();
        addActionFormRef.current.blurInput(); // Blur the input
        // Optional: move focus to the last action item if available
        const flattened = flattenActionTree(itemsToRender);
        if (flattened.length > 0) {
          setFocusedActionId(flattened[flattened.length - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOwner, itemsToRender]); 

  const { total: overallTotal, completed: overallCompleted } = getOverallCompletionCounts(itemsToRender);
  const overallProgressPercentage = overallTotal > 0 ? (overallCompleted / overallTotal) * 100 : 0;

  const isAllComplete = overallTotal > 0 && overallCompleted === overallTotal;

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
            isAllComplete ? (
              <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
                <Check
                  size={36}
                  className="text-primary animate-spin-scale" // Need to define this animation
                />
                <span className="absolute text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
              </div>
            ) : (
              <CircularProgress
                progress={overallProgressPercentage}
                size={36}
                strokeWidth={3}
                color="text-primary"
                bgColor="text-muted-foreground"
              >
                <span className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
              </CircularProgress>
            )
          )}
        </h2>
      </div>
      <ActionsList
        actions={itemsToRender}
        onActionToggled={isOwner ? onActionToggled : undefined}
        onActionAdded={isOwner ? onActionAdded : undefined}
        onActionUpdated={isOwner ? onActionUpdated : undefined}
        onActionDeleted={isOwner ? onActionDeleted : undefined}
        onActionIndented={isOwner ? onActionIndented : undefined}
        onActionOutdented={isOwner ? onActionOutdented : undefined}
        onActionMovedUp={isOwner ? onActionMovedUp : undefined}
        onActionMovedDown={isOwner ? onActionMovedDown : undefined}
        onActionPrivacyToggled={isOwner ? onActionPrivacyToggled : undefined} // Pass handler
        justCompletedId={justCompletedId}
        focusedActionId={focusedActionId}
        setFocusedActionId={setFocusedActionId}
        flattenedActions={flattenActionTree(itemsToRender)}
      />
      
      {!isOwner && privateCount > 0 && (
        <div className="mt-6 text-center text-muted-foreground italic text-sm animate-pulse">
          Pssst... he's working on {privateCount} more actions privately! 🤫
        </div>
      )}

      {isOwner && (
        <div className="mt-4">
          <AddActionForm
            ref={addActionFormRef}
            onSave={(desc) => {
              onActionAdded?.(desc, undefined, true); // Pass true for isPublic
              addActionFormRef.current?.clearInput();
              addActionFormRef.current?.focusInput();
            }}
            onCancel={() => {
              addActionFormRef.current?.clearInput();
              const flattened = flattenActionTree(itemsToRender);
              if (flattened.length > 0) {
                setFocusedActionId(flattened[flattened.length - 1].id);
              }
            }}
            placeholder="Ctrl/Cmd+I to focus actions"
            autoFocusOnMount={false}
          />
        </div>
      )}
    </div>
  );
};

export default ActionsSection;

