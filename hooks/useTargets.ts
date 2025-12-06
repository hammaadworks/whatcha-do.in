import {useEffect, useState, useCallback} from 'react';
import {fetchTargets, updateTargets} from '@/lib/supabase/targets';
import {ActionNode} from '@/lib/supabase/types';
import {useAuth} from './useAuth';
import {toast} from 'sonner';
import {getMonthStartDate} from '@/lib/date';
import {
    addActionToTree,
    deleteActionFromTree,
    indentActionInTree,
    moveActionDownInTree,
    moveActionUpInTree,
    outdentActionInTree,
    toggleActionInTree,
    toggleActionPrivacyInTree,
    updateActionTextInTree,
    findNodeAndContext,
    addActionAfterId, // Import addActionAfterId
    DeletedNodeContext, // Import DeletedNodeContext
    restoreActionInTree // Import restoreActionInTree
} from '@/lib/utils/actionTreeUtils';
import {processTargetLifecycle} from '@/lib/logic/targetLifecycle';

// --- NEW IMPORTS ---
import { createClient } from '@/lib/supabase/client';
import { JournalActivityService } from '@/lib/logic/JournalActivityService';
// --- END NEW IMPORTS ---

export type TargetBucket = 'future' | 'current' | 'prev' | 'prev1';

// Helper to find a node recursively (from actionTreeUtils.ts)
const findNode = (nodes: ActionNode[], id: string): ActionNode | null => {
    return findNodeAndContext(nodes, id)?.node || null;
};

export const useTargets = (isOwner: boolean, timezone: string = 'UTC', initialTargets?: ActionNode[]) => {
    const {user} = useAuth();

    const [futureTargets, setFutureTargets] = useState<ActionNode[]>([]);
    const [currentTargets, setCurrentTargets] = useState<ActionNode[]>(initialTargets || []); // Initialize with prop
    const [prevTargets, setPrevTargets] = useState<ActionNode[]>([]);
    const [prev1Targets, setPrev1Targets] = useState<ActionNode[]>([]);

    const [loading, setLoading] = useState(!initialTargets); // Loading if no initial data
    // State to store deleted context, including the bucket it was deleted from
    const [lastDeletedTargetContext, setLastDeletedTargetContext] = useState<{ context: DeletedNodeContext | null, bucket: TargetBucket | null } | null>(null);

    // --- NEW SERVICE INITIALIZATION ---
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);
    // --- END NEW SERVICE INITIALIZATION ---


    const getBucketState = (bucket: TargetBucket) => {
        switch (bucket) {
            case 'future':
                return {data: futureTargets, set: setFutureTargets, date: null};
            case 'current':
                return {data: currentTargets, set: setCurrentTargets, date: getMonthStartDate(0, timezone)};
            case 'prev':
                return {data: prevTargets, set: setPrevTargets, date: getMonthStartDate(-1, timezone)};
            case 'prev1':
                return {data: prev1Targets, set: setPrev1Targets, date: getMonthStartDate(-2, timezone)};
        }
    };

    useEffect(() => {
        // Only fetch if we don't have initial data AND we are owner (or we want to fetch for owner)
        // If initialTargets is passed, we assume it's for public view and we don't need to fetch.
        if (!initialTargets && isOwner && user) {
            setLoading(true);

            // Run lifecycle logic (rollover & clearing) before fetching
            processTargetLifecycle(user.id, timezone)
                .catch(err => console.error("Failed to process target lifecycle:", err))
                .finally(() => {
                    // Fetch updated state
                    Promise.all([fetchTargets(user.id, null), fetchTargets(user.id, getMonthStartDate(0, timezone)), fetchTargets(user.id, getMonthStartDate(-1, timezone)), fetchTargets(user.id, getMonthStartDate(-2, timezone)),])
                        .then(([future, current, prev, prev1]) => {
                            setFutureTargets(future);
                            setCurrentTargets(current);
                            setPrevTargets(prev);
                            setPrev1Targets(prev1);
                        })
                        .catch(err => console.error("Failed to fetch targets:", err))
                        .finally(() => setLoading(false));
                });
        }
    }, [isOwner, user, timezone, initialTargets]);

    const save = async (bucket: TargetBucket, newTree: ActionNode[]) => {
        const {set, date} = getBucketState(bucket);
        set(newTree);
        if (isOwner && user) {
            try {
                await updateTargets(user.id, date, newTree);
            } catch (error) {
                console.error(`Failed to save ${bucket} targets:`, error);
                toast.error("Failed to save target.");
            }
        }
    };

    const addTarget = useCallback((bucket: TargetBucket, description: string, parentId?: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on new action
        const {data} = getBucketState(bucket);
        save(bucket, addActionToTree(data, description, parentId, true));
    }, [getBucketState, save]);

    const addTargetAfter = useCallback((bucket: TargetBucket, afterId: string, description: string, isPublic: boolean = true) => {
        setLastDeletedTargetContext(null); // Clear undo history on new action
        const {data} = getBucketState(bucket);
        save(bucket, addActionAfterId(data, afterId, description, isPublic));
    }, [getBucketState, save]);

    const toggleTarget = useCallback((bucket: TargetBucket, id: string) => {
        const {data: oldTreeData} = getBucketState(bucket);
        const oldTargetNode = findNode(oldTreeData, id); // Get old state
        
        const newTree = toggleActionInTree(oldTreeData, id);
        if (newTree === oldTreeData) {
            toast.error("Complete sub-targets first!");
            return;
        }

        const newTargetNode = findNode(newTree, id); // Get new state

        // --- NEW JOURNAL LOGIC (Start) ---
        if (user && newTargetNode && oldTargetNode?.completed !== newTargetNode.completed) {
            journalActivityService.logActivity(
                user.id,
                new Date(), // Log for today
                {
                    id: newTargetNode.id,
                    type: 'target',
                    description: newTargetNode.description,
                    is_public: newTargetNode.is_public ?? false,
                    status: newTargetNode.completed ? 'completed' : 'uncompleted',
                }
            );
        }
        // --- NEW JOURNAL LOGIC (End) ---
        setLastDeletedTargetContext(null); // Clear undo history on toggle
        save(bucket, newTree);
    }, [getBucketState, save, user, journalActivityService]);

    const updateTargetText = useCallback((bucket: TargetBucket, id: string, newText: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on update
        const {data} = getBucketState(bucket);
        save(bucket, updateActionTextInTree(data, id, newText));
    }, [getBucketState, save]);

    const deleteTarget = useCallback((bucket: TargetBucket, id: string) => {
        const {data} = getBucketState(bucket);
        const { tree: newTree, deletedContext } = deleteActionFromTree(data, id);
        setLastDeletedTargetContext({ context: deletedContext, bucket: bucket }); // Store for undo
        save(bucket, newTree);
        return deletedContext; // Return for UI to trigger toast
    }, [getBucketState, save]);

    const undoDeleteTarget = useCallback(() => {
        if (lastDeletedTargetContext?.context && lastDeletedTargetContext?.bucket) {
            const { context, bucket } = lastDeletedTargetContext;
            const { data: currentBucketData } = getBucketState(bucket);
            save(bucket, restoreActionInTree(currentBucketData, context));
            setLastDeletedTargetContext(null); // Clear after undo
            toast.success("Target restored!");
        } else {
            toast.error("Nothing to undo!");
        }
    }, [lastDeletedTargetContext, getBucketState, save]);

    const indentTarget = useCallback((bucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on indent
        const {data} = getBucketState(bucket);
        save(bucket, indentActionInTree(data, id));
    }, [getBucketState, save]);

    const outdentTarget = useCallback((bucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on outdent
        const {data} = getBucketState(bucket);
        save(bucket, outdentActionInTree(data, id));
    }, [getBucketState, save]);

    const moveTargetUp = useCallback((bucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on move
        const {data} = getBucketState(bucket);
        save(bucket, moveActionUpInTree(data, id));
    }, [getBucketState, save]);

    const moveTargetDown = useCallback((bucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on move
        const {data} = getBucketState(bucket);
        save(bucket, moveActionDownInTree(data, id));
    }, [getBucketState, save]);

    const toggleTargetPrivacy = useCallback((bucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on privacy toggle
        const {data} = getBucketState(bucket);
        save(bucket, toggleActionPrivacyInTree(data, id));
    }, [getBucketState, save]);

    // Simple move: Removes from Source, Adds to Dest (Root)
    // Does NOT preserve children for now (simplified) or deep position.
    // Actually, reusing addActionToTree adds as a new node.
    const moveTargetToBucket = useCallback((fromBucket: TargetBucket, toBucket: TargetBucket, id: string) => {
        setLastDeletedTargetContext(null); // Clear undo history on move between buckets
        const source = getBucketState(fromBucket);
        const dest = getBucketState(toBucket);

        const node = findNode(source.data, id);
        if (!node) return;

        // Remove from source
        const { tree: newSourceTree } = deleteActionFromTree(source.data, id);
        save(fromBucket, newSourceTree); // Pass the tree part

        // Add to dest (as new root node with same description)
        // NOTE: This loses children and completion status/timestamps.
        // For a proper move, we'd need `appendNodeToTree`.
        // For now, we'll just create a new one.
        save(toBucket, addActionToTree(dest.data, node.description, undefined, true));
        toast.success("Moved target!");
    }, [getBucketState, save]);

    return {
        buckets: {
            future: futureTargets, current: currentTargets, prev: prevTargets, prev1: prev1Targets
        },
        loading,
        addTarget,
        toggleTarget,
        updateTargetText,
        deleteTarget,
        undoDeleteTarget, // Expose undo function
        lastDeletedTargetContext, // Expose deleted context
        indentTarget,
        outdentTarget,
        moveTargetUp,
        moveTargetDown,
        toggleTargetPrivacy,
        addTargetAfter, // Expose new function
        moveTargetToBucket
    };
};