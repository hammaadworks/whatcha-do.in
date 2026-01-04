import { useState, useCallback, useMemo } from 'react';
import { fetchTargets, updateTargets } from '@/lib/supabase/targets';
import { ActionNode } from '@/lib/supabase/types';
import { useAuth } from '@/packages/auth/hooks/useAuth';
import { toast } from 'sonner';
import { getCurrentMonthStartISO, getReferenceDateUI } from '@/lib/date';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';
import { parseISO, isAfter, isEqual, isBefore } from 'date-fns';
import { useTreeStructure } from '@/hooks/useTreeStructure';
import { 
  DeletedNodeContext, 
  deleteActionFromTree, 
  addExistingActionToTree 
} from '@/lib/logic/actions/tree-utils';
import { processTargetLifecycle } from '@/lib/logic/targetLifecycle';

export type TargetBucket = 'future' | 'current' | 'prev' | 'prev1';

// Define save data function for useTreeStructure
const saveTargetData = async (userId: string, dateContext: string | null, newTree: ActionNode[]) => {
  await updateTargets(userId, dateContext, newTree);
};

export const useTargets = (isOwner: boolean, timezone: string = 'UTC', initialTargets?: ActionNode[]) => {
  const { user } = useAuth();
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);

  // State to store deleted context, including the bucket it was deleted from
  const [lastDeletedTargetContext, setLastDeletedTargetContext] = useState<{ context: DeletedNodeContext | null, bucket: TargetBucket | null } | null>(null);

  // Memoize date contexts using the canonical helpers
  const currentMonthDate = useMemo(() => getCurrentMonthStartISO(timezone, refDate, 0), [timezone, refDate]);
  const prevMonthDate = useMemo(() => getCurrentMonthStartISO(timezone, refDate, -1), [timezone, refDate]);
  const prev1MonthDate = useMemo(() => getCurrentMonthStartISO(timezone, refDate, -2), [timezone, refDate]);

  // Use useTreeStructure for each bucket
  const future = useTreeStructure({
    fetchData: (userId) => fetchTargets(userId, null),
    saveData: (userId, _dc, newTree) => saveTargetData(userId, null, newTree),
    processLifecycle: undefined,
    entityType: 'target',
    isOwner,
    timezone,
    toastPrefix: 'Target',
    ownerId: user?.id || '',
    dateContext: null,
    initialData: initialTargets?.filter(t => t.completed_at == null)
  });

  const current = useTreeStructure({
    fetchData: (userId, tz) => fetchTargets(userId, getCurrentMonthStartISO(tz, refDate, 0)),
    saveData: (userId, _dc, newTree) => saveTargetData(userId, currentMonthDate, newTree),
    processLifecycle: (uid, tz) => processTargetLifecycle(uid, tz, refDate),
    entityType: 'target',
    isOwner,
    timezone,
    toastPrefix: 'Target',
    ownerId: user?.id || '',
    dateContext: currentMonthDate,
    initialData: initialTargets?.filter(t => {
        if (!t.completed_at) return false;
        const completedDate = parseISO(t.completed_at);
        const monthDate = parseISO(currentMonthDate);
        return isAfter(completedDate, monthDate) || isEqual(completedDate, monthDate);
    })
  });

  const prev = useTreeStructure({
    fetchData: (userId, tz) => fetchTargets(userId, getCurrentMonthStartISO(tz, refDate, -1)),
    saveData: (userId, _dc, newTree) => saveTargetData(userId, prevMonthDate, newTree),
    processLifecycle: undefined,
    entityType: 'target',
    isOwner,
    timezone,
    toastPrefix: 'Target',
    ownerId: user?.id || '',
    dateContext: prevMonthDate,
    initialData: initialTargets?.filter(t => {
        if (!t.completed_at) return false;
        const completedDate = parseISO(t.completed_at);
        const thisMonthDate = parseISO(prevMonthDate);
        const nextMonthDate = parseISO(currentMonthDate);
        return (isAfter(completedDate, thisMonthDate) || isEqual(completedDate, thisMonthDate)) && isBefore(completedDate, nextMonthDate);
    })
  });

  const prev1 = useTreeStructure({
    fetchData: (userId, tz) => fetchTargets(userId, getCurrentMonthStartISO(tz, refDate, -2)),
    saveData: (userId, _dc, newTree) => saveTargetData(userId, prev1MonthDate, newTree),
    processLifecycle: undefined,
    entityType: 'target',
    isOwner,
    timezone,
    toastPrefix: 'Target',
    ownerId: user?.id || '',
    dateContext: prev1MonthDate,
    initialData: initialTargets?.filter(t => {
        if (!t.completed_at) return false;
        const completedDate = parseISO(t.completed_at);
        const thisMonthDate = parseISO(prev1MonthDate);
        const nextMonthDate = parseISO(prevMonthDate);
        return (isAfter(completedDate, thisMonthDate) || isEqual(completedDate, thisMonthDate)) && isBefore(completedDate, nextMonthDate);
    })
  });

  // Map bucket names to their respective useTreeStructure instances
  const bucketHooks = useMemo(() => ({
    future,
    current,
    prev,
    prev1,
  }), [future, current, prev, prev1]);

  // Combine loading states
  const loading = future.loading || current.loading || prev.loading || prev1.loading;

  // Override deleteNode to store bucket context
  const deleteTarget = useCallback((bucket: TargetBucket, id: string) => {
    const hook = bucketHooks[bucket];
    const deletedContext = hook.deleteNode(id);
    setLastDeletedTargetContext({ context: deletedContext, bucket: bucket });
    return deletedContext;
  }, [bucketHooks]);

  // Override undoDeleteNode to restore to the correct bucket
  const undoDeleteTarget = useCallback(() => {
    if (lastDeletedTargetContext?.context && lastDeletedTargetContext?.bucket) {
      const { context, bucket } = lastDeletedTargetContext;
      const hook = bucketHooks[bucket];
      hook.undoDeleteNode(); // This will trigger the internal undo and toast
      setLastDeletedTargetContext(null); // Clear after undo
    } else {
      toast.error("Nothing to undo!");
    }
  }, [lastDeletedTargetContext, bucketHooks]);

  // moveTargetToBucket needs custom implementation as it moves between trees
  const moveTargetToBucket = useCallback(async (fromBucket: TargetBucket, toBucket: TargetBucket, id: string) => {
    setLastDeletedTargetContext(null); // Clear undo history on move between buckets

    const sourceHook = bucketHooks[fromBucket];
    const destHook = bucketHooks[toBucket];

    // Optimistically remove from source
    const { tree: newSourceTree, deletedContext } = deleteActionFromTree(sourceHook.tree, id);
    
    if (!deletedContext) {
      toast.error("Target not found in source bucket!");
      return;
    }

    const nodeToMove = deletedContext.node; // Use the node from the deleted context to ensure we have the full subtree
    sourceHook.setTree(newSourceTree); // Directly update state
    
    // Add to destination
    const newDestTree = addExistingActionToTree(destHook.tree, nodeToMove); // Use addExistingActionToTree to preserve ID and children
    destHook.setTree(newDestTree); // Directly update state

    if (user?.id) {
      try {
        await saveTargetData(user.id, sourceHook.dateContext, newSourceTree);
        await saveTargetData(user.id, destHook.dateContext, newDestTree);
        toast.success("Target moved!");
      } catch (error) {
        console.error("Failed to move target between buckets:", error);
        toast.error("Failed to move target. Please try again.");
        // Revert UI changes on error
        sourceHook.setTree(sourceHook.tree);
        destHook.setTree(destHook.tree);
      }
    }
  }, [bucketHooks, user]);


  return {
    buckets: {
      future: future.tree,
      current: current.tree,
      prev: prev.tree,
      prev1: prev1.tree,
    },
    loading,
    addTarget: useCallback((bucket: TargetBucket, description: string, parentId?: string, isPublic: boolean = true) =>
      bucketHooks[bucket].addNode(description, parentId, isPublic), [bucketHooks]),
    addTargetAfter: useCallback((bucket: TargetBucket, afterId: string, description: string, isPublic: boolean = true) =>
      bucketHooks[bucket].addNodeAfter(afterId, description, isPublic), [bucketHooks]),
    toggleTarget: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].toggleNode(id), [bucketHooks]),
    updateTargetText: useCallback((bucket: TargetBucket, id: string, newText: string) =>
      bucketHooks[bucket].updateNodeText(id, newText), [bucketHooks]),
    deleteTarget, // Use overridden delete
    undoDeleteTarget, // Use overridden undo
    lastDeletedTargetContext,
    indentTarget: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].indentNode(id), [bucketHooks]),
    outdentTarget: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].outdentNode(id), [bucketHooks]),
    moveTargetUp: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].moveNodeUp(id), [bucketHooks]),
    moveTargetDown: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].moveNodeDown(id), [bucketHooks]),
    toggleTargetPrivacy: useCallback((bucket: TargetBucket, id: string) =>
      bucketHooks[bucket].toggleNodePrivacy(id), [bucketHooks]),
    moveTargetToBucket, // Custom move function
  };
};