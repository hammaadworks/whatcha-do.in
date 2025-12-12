'use client';

import { useTreeStructure } from './useTreeStructure';
import { fetchActions, updateActions } from '@/lib/supabase/actions';
import { ActionNode } from '@/lib/supabase/types'; // Correct import for ActionNode
import { useAuth } from './useAuth';
import { processActionLifecycle } from '@/lib/logic/actions/lifecycle';

// Type for the save data function specific to actions
const saveActionData = async (userId: string, _dateContext: string | null, newTree: ActionNode[]) => {
  await updateActions(userId, newTree);
};

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
    actions,
    loading,
    addAction: addAction as (description: string, parentId?: string, isPublic?: boolean) => Promise<void>,
    addActionAfter: addActionAfter as (afterId: string, description: string, isPublic?: boolean) => Promise<string>,
    toggleAction,
    updateActionText,
    deleteAction,
    undoDeleteAction,
    lastDeletedContext,
    indentAction: indentAction as (id: string) => Promise<void>,
    outdentAction,
    moveActionUp,
    moveActionDown,
    toggleActionPrivacy,
  };
};