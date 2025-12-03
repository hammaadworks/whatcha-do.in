'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchActions, updateActions } from '@/lib/supabase/actions';
import { ActionNode } from '@/lib/supabase/types'; // Correct import for ActionNode
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast'; // Kept for error reporting in save()
import {
  addActionToTree,
  toggleActionInTree,
  updateActionTextInTree,
  deleteActionFromTree,
  indentActionInTree,
  outdentActionInTree,
  moveActionUpInTree,
  moveActionDownInTree,
  toggleActionPrivacyInTree, // Import new utility
} from '@/lib/utils/actionTreeUtils';

export const useActions = (isOwner: boolean, timezone?: string) => {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionNode[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (isOwner && user) {
      setLoading(true);
      fetchActions(user.id, timezone || 'UTC')
        .then(setActions)
        .catch(err => console.error("Failed to fetch actions:", err))
        .finally(() => setLoading(false));
    }
  }, [isOwner, user, timezone]);

  // Central save function with optimistic update
  const save = useCallback(async (newTree: ActionNode[]) => {
    setActions(newTree); // Optimistic update
    if (isOwner && user) {
      try {
        await updateActions(user.id, newTree);
      } catch (error) {
        console.error("Failed to persist actions:", error);
        toast.error("Failed to save actions. Please try again.");
        // In a real app, we might trigger a toast or revert state here
      }
    }
  }, [isOwner, user]);

  const addAction = (description: string, parentId?: string, isPublic: boolean = true) => {
    save(addActionToTree(actions, description, parentId, isPublic));
  };

  const toggleAction = (id: string) => {
    const newActionsTree = toggleActionInTree(actions, id);
    if (newActionsTree === actions) { // Check if the tree changed or was prevented
      toast.error("Complete all sub-actions first!");
      return;
    }
    save(newActionsTree);
  };

  const updateActionText = (id: string, newText: string) => {
    save(updateActionTextInTree(actions, id, newText));
  };

  const deleteAction = (id: string) => {
    save(deleteActionFromTree(actions, id));
  };

  const indentAction = (id: string) => {
    save(indentActionInTree(actions, id));
  };

  const outdentAction = (id: string) => {
    save(outdentActionInTree(actions, id));
  };

  const moveActionUp = (id: string) => {
    save(moveActionUpInTree(actions, id));
  };

  const moveActionDown = (id: string) => {
    save(moveActionDownInTree(actions, id));
  };

  const toggleActionPrivacy = (id: string) => {
    save(toggleActionPrivacyInTree(actions, id));
  };

  return {
    actions,
    loading,
    addAction,
    toggleAction,
    updateActionText,
    deleteAction,
    indentAction,
    outdentAction,
    moveActionUp,
    moveActionDown,
    toggleActionPrivacy, // Return new handler
  };
};
