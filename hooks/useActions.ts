'use client';

import { useTreeStructure } from './useTreeStructure';
import { fetchActions, updateActions } from '@/lib/supabase/actions';
import { ActionNode } from '@/lib/supabase/types';
import { useAuth } from '@/packages/auth/hooks/useAuth';
import { processActionLifecycle } from '@/lib/logic/actions/lifecycle';

// Type for the save data function specific to actions
const saveActionData = async (userId: string, _dateContext: string | null, newTree: ActionNode[]) => {
  await updateActions(userId, newTree);
};

/**
 * Custom hook to manage the "Actions" tree (Tasks/Todos).
 * 
 * Leverages `useTreeStructure` to provide standard tree manipulation operations 
 * (add, toggle, delete, indent, move) specialized for the Actions domain.
 * Automatically handles data fetching, saving, and lifecycle processing (e.g., daily clearing).
 * 
 * @param isOwner - Whether the current user owns this data (enables editing).
 * @param timezone - The user's timezone for date-based logic.
 * @returns An object containing the actions tree state and manipulation functions.
 */
export const useActions = (isOwner: boolean, timezone: string = 'UTC') => {
  const { user } = useAuth();

  const {
    tree: actions,
    loading,
    addNode: addAction,
    addNodeAfter: addActionAfter,
    toggleNode: toggleAction,
    updateNodeText: updateActionText,
    deleteNode: deleteAction,
    undoDeleteNode: undoDeleteAction,
    lastDeletedContext,
    indentNode: indentAction,
    outdentNode: outdentAction,
    moveNodeUp: moveActionUp,
    moveNodeDown: moveActionDown,
    toggleNodePrivacy: toggleActionPrivacy,
  } = useTreeStructure({
    fetchData: (userId, tz) => fetchActions(userId, tz),
    saveData: saveActionData,
    processLifecycle: processActionLifecycle,
    entityType: 'action',
    isOwner,
    timezone,
    toastPrefix: 'Action',
    ownerId: user?.id || '', // Pass user.id
  });

  return {
    /** The current tree of actions. */
    actions,
    /** Whether the initial data is loading. */
    loading,
    /** Adds a new action to the tree. */
    addAction: addAction as (description: string, parentId?: string, isPublic?: boolean) => Promise<void>,
    /** Adds a new action immediately after a specified sibling. */
    addActionAfter: addActionAfter as (afterId: string, description: string, isPublic?: boolean) => Promise<string>,
    /** Toggles the completion status of an action. */
    toggleAction,
    /** Updates the text description of an action. */
    updateActionText,
    /** Deletes an action from the tree. */
    deleteAction,
    /** Restores the last deleted action. */
    undoDeleteAction,
    /** Context of the last deleted action (for UI feedback). */
    lastDeletedContext,
    /** Indents an action (makes it a child of the previous sibling). */
    indentAction: indentAction as (id: string) => Promise<void>,
    /** Outdents an action (moves it up a level). */
    outdentAction,
    /** Moves an action up in the list. */
    moveActionUp,
    /** Moves an action down in the list. */
    moveActionDown,
    /** Toggles the public/private visibility of an action. */
    toggleActionPrivacy,
  };
};
