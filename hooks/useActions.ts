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
import {getMillisecondsUntilNextDay} from '@/lib/date';

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
            const runLifecycle = () => {
                setLoading(true);
                processActionLifecycle(user.id, timezone)
                    .catch(err => console.error("Failed to process action lifecycle:", err))
                    .finally(() => {
                        fetchActions(user.id, timezone)
                            .then(setActions)
                            .catch(err => console.error("Failed to fetch actions:", err))
                            .finally(() => setLoading(false));
                    });
            };

            // 1. Run immediately on mount
            runLifecycle();

            // 2. Schedule next run at midnight
            const msUntilMidnight = getMillisecondsUntilNextDay(timezone);
            // Add a small buffer (e.g., 1 sec) to ensure DB/server time has definitely ticked over
            const timer = setTimeout(runLifecycle, msUntilMidnight + 1000);

            return () => clearTimeout(timer);
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

    const addActionAfter = (afterId: string, description: string, isPublic: boolean = true): string => {
        setLastDeletedContext(null); // Clear undo history on new action
        const [newTree, newActionId] = addActionAfterId(actions, afterId, description, isPublic);
        save(newTree);
        return newActionId;
    };

    const toggleAction = async (id: string) => {
        const oldActionNode = findNodeAndContext(actions, id)?.node; // Get old state
        const newActionsTree = toggleActionInTree(actions, id);
        
        if (newActionsTree === actions) { // Check if the tree changed or was prevented
            toast.error("Complete all sub-actions first!");
            return;
        }

        const newActionNode = findNodeAndContext(newActionsTree, id)?.node; // Get new state

        if (user && newActionNode && oldActionNode?.completed !== newActionNode.completed) {
            if (newActionNode.completed) { // If becoming completed
                await journalActivityService.logActivity(
                    user.id,
                    new Date(), // Log for today (completion time)
                    {
                        id: newActionNode.id,
                        type: 'action',
                        description: newActionNode.description,
                        is_public: newActionNode.is_public ?? false,
                        status: 'completed', // Explicitly 'completed'
                    }
                );
            } else if (oldActionNode?.completed && oldActionNode?.completed_at) { // If becoming uncompleted and was previously completed
                await journalActivityService.removeActivity(
                    user.id,
                    new Date(oldActionNode.completed_at), // Use the original completion date for removal
                    oldActionNode.id,
                    'action',
                    oldActionNode.is_public ?? false
                );
            }
        }
        setLastDeletedContext(null); // Clear undo history on toggle
        save(newActionsTree);
        return newActionNode; // Return new node for UI to react
    };

    const updateActionText = (id: string, newText: string) => {
        setLastDeletedContext(null); // Clear undo history on update
        save(updateActionTextInTree(actions, id, newText));
    };

    const deleteAction = async (id: string) => {
        const { tree: newTree, deletedContext } = deleteActionFromTree(actions, id);
        
        // --- NEW JOURNAL LOGIC (Start) ---
        if (user && deletedContext && deletedContext.node.completed && deletedContext.node.completed_at) {
            await journalActivityService.removeActivity(
                user.id,
                new Date(deletedContext.node.completed_at),
                deletedContext.node.id,
                'action',
                deletedContext.node.is_public ?? false
            );
        }
        // --- NEW JOURNAL LOGIC (End) ---

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

    const toggleActionPrivacy = async (id: string) => { // Make it async
        setLastDeletedContext(null); // Clear undo history on privacy toggle

        const result = toggleActionPrivacyInTree(actions, id);

        if (result && user) {
            let { tree: newActionsTree, oldNode, newNode } = result;
            
            // Check if the node was completed AND its public status actually changed
            // The `newNode` from toggleActionPrivacyInTree already has the new is_public status applied (and propagated)
            if (oldNode.completed && oldNode.is_public !== newNode.is_public) {
                // 1a. Delete the marked item from the readonly activity journal
                // Use the completed_at from oldNode to ensure we remove from the correct day's journal
                if (oldNode.completed_at) { // Ensure completed_at exists
                    await journalActivityService.removeActivity(
                        user.id,
                        new Date(oldNode.completed_at),
                        oldNode.id,
                        'action',
                        oldNode.is_public ?? false // Use its old public status for removal
                    );
                } else {
                    console.warn(`Action ${oldNode.id} was completed but had no completed_at timestamp. Cannot remove from journal.`);
                }

                // 1b. Unmark the item (set completed: false, completed_at: undefined)
                const unmarkRecursive = (nodes: ActionNode[]): ActionNode[] => {
                    return nodes.map(node => {
                        if (node.id === id) {
                            return { ...node, completed: false, completed_at: undefined };
                        }
                        if (node.children) {
                            return { ...node, children: unmarkRecursive(node.children) };
                        }
                        return node;
                    });
                };
                newActionsTree = unmarkRecursive(newActionsTree); // Apply unmarking to the new tree
            }
            // 1c. Then change the visibility (already handled by toggleActionPrivacyInTree result)
            save(newActionsTree); // Save the (potentially uncompleted) privacy-toggled tree
        } else if (!result) {
            toast.error("Action not found to toggle privacy.");
        }
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