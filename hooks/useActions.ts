'use client';

import {useCallback, useEffect, useState} from 'react';
import {fetchActions, updateActions} from '@/lib/supabase/actions';
import {ActionNode} from '@/lib/supabase/types'; // Correct import for ActionNode
import {useAuth} from './useAuth';
import {toast} from 'react-hot-toast'; // Kept for error reporting in save()
import {
    addActionToTree,
    deleteActionFromTree, // Will return deleted context
    indentActionInTree,
    moveActionDownInTree,
    moveActionUpInTree,
    outdentActionInTree,
    toggleActionInTree,
    toggleActionPrivacyInTree,
    updateActionTextInTree,
    findNodeAndContext,
    addActionAfterId,
    DeletedNodeContext, // Import DeletedNodeContext
    restoreActionInTree // Import restoreActionInTree
} from '@/lib/utils/actionTreeUtils';
import {processActionLifecycle} from '@/lib/logic/actionLifecycle';

// --- NEW IMPORTS ---
import { createClient } from '@/lib/supabase/client';
import { JournalActivityService } from '@/lib/logic/JournalActivityService';
// --- END NEW IMPORTS ---

export const useActions = (isOwner: boolean, timezone: string = 'UTC') => {
    const {user} = useAuth();
    const [actions, setActions] = useState<ActionNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastDeletedContext, setLastDeletedContext] = useState<DeletedNodeContext | null>(null); // State to store deleted context

    // --- NEW SERVICE INITIALIZATION ---
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);
    // --- END NEW SERVICE INITIALIZATION ---

    // Fetch initial data with lifecycle processing
    useEffect(() => {
        if (isOwner && user) {
            setLoading(true);

            processActionLifecycle(user.id, timezone)
                .catch(err => console.error("Failed to process action lifecycle:", err))
                .finally(() => {
                    fetchActions(user.id, timezone)
                        .then(setActions)
                        .catch(err => console.error("Failed to fetch actions:", err))
                        .finally(() => setLoading(false));
                });
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
        setLastDeletedContext(null); // Clear undo history on new action
        save(addActionToTree(actions, description, parentId, isPublic));
    };

    const addActionAfter = (afterId: string, description: string, isPublic: boolean = true) => {
        setLastDeletedContext(null); // Clear undo history on new action
        save(addActionAfterId(actions, afterId, description, isPublic));
    };

    const toggleAction = (id: string) => {
        const oldActionNode = findNodeAndContext(actions, id)?.node; // Get old state
        const newActionsTree = toggleActionInTree(actions, id);
        
        if (newActionsTree === actions) { // Check if the tree changed or was prevented
            toast.error("Complete all sub-actions first!");
            return;
        }

        const newActionNode = findNodeAndContext(newActionsTree, id)?.node; // Get new state

        // --- NEW JOURNAL LOGIC (Start) ---
        if (user && newActionNode && oldActionNode?.completed !== newActionNode.completed) {
            journalActivityService.logActivity(
                user.id,
                new Date(), // Log for today
                {
                    id: newActionNode.id,
                    type: 'action',
                    description: newActionNode.description,
                    is_public: newActionNode.is_public ?? false,
                    status: newActionNode.completed ? 'completed' : 'uncompleted',
                }
            );
        }
        // --- NEW JOURNAL LOGIC (End) ---
        setLastDeletedContext(null); // Clear undo history on toggle
        save(newActionsTree);
    };

    const updateActionText = (id: string, newText: string) => {
        setLastDeletedContext(null); // Clear undo history on update
        save(updateActionTextInTree(actions, id, newText));
    };

    const deleteAction = (id: string) => {
        const { tree: newTree, deletedContext } = deleteActionFromTree(actions, id);
        setLastDeletedContext(deletedContext); // Store for undo
        save(newTree);
        return deletedContext; // Return for UI to trigger toast
    };

    const undoDeleteAction = () => {
        if (lastDeletedContext) {
            save(restoreActionInTree(actions, lastDeletedContext));
            setLastDeletedContext(null); // Clear after undo
            toast.success("Action restored!");
        } else {
            toast.error("Nothing to undo!");
        }
    };

    const indentAction = (id: string) => {
        setLastDeletedContext(null); // Clear undo history on indent
        save(indentActionInTree(actions, id));
    };

    const outdentAction = (id: string) => {
        setLastDeletedContext(null); // Clear undo history on outdent
        save(outdentActionInTree(actions, id));
    };

    const moveActionUp = (id: string) => {
        setLastDeletedContext(null); // Clear undo history on move
        save(moveActionUpInTree(actions, id));
    };

    const moveActionDown = (id: string) => {
        setLastDeletedContext(null); // Clear undo history on move
        save(moveActionDownInTree(actions, id));
    };

    const toggleActionPrivacy = (id: string) => {
        setLastDeletedContext(null); // Clear undo history on privacy toggle
        save(toggleActionPrivacyInTree(actions, id));
    };

    return {
        actions,
        loading,
        addAction,
        addActionAfter,
        toggleAction,
        updateActionText,
        deleteAction,
        undoDeleteAction, // Expose undo function
        lastDeletedContext, // Expose deleted context for UI
        indentAction,
        outdentAction,
        moveActionUp,
        moveActionDown,
        toggleActionPrivacy,
    };
};
