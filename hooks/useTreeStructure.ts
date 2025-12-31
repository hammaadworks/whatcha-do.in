import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import {
  ActionNode
} from '@/lib/supabase/types';
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
  addActionAfterId,
  restoreActionInTree,
  recalculateCompletionStatus,
  DeletedNodeContext 
} from '@/lib/logic/actions/tree-utils'; 
import { getMillisecondsUntilNextDay, getReferenceDateUI } from '@/lib/date';
import { createClient } from '@/lib/supabase/client';
import { JournalActivityService } from '@/lib/logic/JournalActivityService';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';

interface TreeStructureProps {
  fetchData: (userId: string, timezone: string, dateContext?: string | null) => Promise<ActionNode[]>;
  saveData: (userId: string, dateContext: string | null, newTree: ActionNode[]) => Promise<void>;
  processLifecycle?: (userId: string, timezone: string, referenceDate?: Date) => Promise<void>; // Optional lifecycle processor
  entityType: 'action' | 'target' | 'habit'; // Added 'habit' for future use
  isOwner: boolean;
  timezone: string;
  toastPrefix: string; // e.g., "Action" or "Target"
  dateContext?: string | null; // For targets (month start date), null for future targets
  initialData?: ActionNode[]; // For public views or pre-loaded data
  ownerId: string; // Add ownerId to props
}

export const useTreeStructure = ({
  fetchData,
  saveData,
  processLifecycle,
  entityType,
  isOwner,
  timezone,
  toastPrefix,
  dateContext = null, // Default to null for actions
  initialData,
  ownerId // Destructure ownerId
}: TreeStructureProps) => {
  const { user } = useAuth();
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);
  const [tree, setTree] = useState<ActionNode[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData && isOwner);
  const [lastDeletedContext, setLastDeletedContext] = useState<DeletedNodeContext | null>(null);

  const supabase = createClient();
  const journalActivityService = new JournalActivityService(supabase);

  // Memoize the JournalActivityService to avoid re-creations
  const memoizedJournalActivityService = useRef(journalActivityService);

  // Refs for function props to avoid dependency cycles/infinite loops if passed inline
  const fetchDataRef = useRef(fetchData);
  const processLifecycleRef = useRef(processLifecycle);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    processLifecycleRef.current = processLifecycle;
  }, [fetchData, processLifecycle]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isOwner || !ownerId) return;
      
      setLoading(true);
      try {
        const data = await fetchDataRef.current(ownerId, timezone, dateContext);
        if (isMounted) {
          setTree(data);
          // Run lifecycle process if provided (e.g., rollover for current bucket)
          if (processLifecycleRef.current) {
             // Pass refDate to lifecycle process to handle time travel correctly
             await processLifecycleRef.current(ownerId, timezone, refDate);
             // Re-fetch after lifecycle processing to get updated state
             const updatedData = await fetchDataRef.current(ownerId, timezone, dateContext);
             if (isMounted) setTree(updatedData);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${entityType}s:`, error);
        toast.error(`Failed to load ${toastPrefix}s.`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (initialData) {
      setLoading(false);
    } else {
      load();
    }

    return () => { isMounted = false; };
  }, [ownerId, timezone, dateContext, isOwner, initialData, entityType, toastPrefix, simulatedDate]);

  const save = useCallback(async (newTree: ActionNode[]) => {
    setTree(newTree); // Optimistic update
    if (isOwner && ownerId) { // Use ownerId
      try {
        await saveData(ownerId, dateContext, newTree); // Use ownerId
      } catch (error) {
        console.error(`Failed to persist ${entityType}s:`, error);
        toast.error(`Failed to save ${toastPrefix}. Please try again.`);
        // In a real app, we might trigger a toast or revert state here
      }
    }
  }, [isOwner, ownerId, saveData, dateContext, entityType, toastPrefix]);

  const undoDeleteNode = useCallback(() => {
    if (lastDeletedContext) {
      save(restoreActionInTree(tree, lastDeletedContext));
      setLastDeletedContext(null);
      toast.success(`${toastPrefix} restored!`);
    } else {
      toast.error("Nothing to undo!");
    }
  }, [tree, save, lastDeletedContext, toastPrefix]);

  const addNode = useCallback(async (description: string, parentId?: string, isPublic: boolean = true) => {
    setLastDeletedContext(null); // Clear undo history on new action
    const treeAfterAdd = addActionToTree(tree, description, parentId, isPublic);

    const { newTree, uncompletedFromCompleted } = recalculateCompletionStatus(treeAfterAdd);

    save(newTree); // Save the new tree

    // Remove journal activity for parents that became uncompleted
    if (user && ownerId && uncompletedFromCompleted.length > 0) { // Use ownerId
      for (const { id, completed_at, is_public } of uncompletedFromCompleted) {
        if (completed_at) { // Only remove if it actually had a completion record
          await memoizedJournalActivityService.current.removeActivity(ownerId, new Date(completed_at), id, entityType, is_public);
        }
      }
    }
  }, [tree, user, ownerId, entityType, save, memoizedJournalActivityService]);

  const addNodeAfter = useCallback(async (afterId: string, description: string, isPublic: boolean = true): Promise<string> => {
    setLastDeletedContext(null); // Clear undo history on new action
    const [treeAfterAdd, newNodeId] = addActionAfterId(tree, afterId, description, isPublic);

    const { newTree, uncompletedFromCompleted } = recalculateCompletionStatus(treeAfterAdd);

    save(newTree);

    // Remove journal activity for parents that became uncompleted
    if (user && ownerId && uncompletedFromCompleted.length > 0) { // Use ownerId
      for (const { id, completed_at, is_public } of uncompletedFromCompleted) {
        if (completed_at) {
          await memoizedJournalActivityService.current.removeActivity(ownerId, new Date(completed_at), id, entityType, is_public);
        }
      }
    }
    return newNodeId;
  }, [tree, user, ownerId, entityType, save, memoizedJournalActivityService]);

  const toggleNode = useCallback(async (id: string) => {
    const oldNode = findNodeAndContext(tree, id)?.node;
    if (!oldNode) {
      toast.error(`${toastPrefix} not found for toggling.`);
      return;
    }

    const treeAfterToggle = toggleActionInTree(tree, id, refDate);
    const { newTree, uncompletedFromCompleted } = recalculateCompletionStatus(treeAfterToggle);
    const newNode = findNodeAndContext(newTree, id)?.node;


    if (!newNode) {
      toast.error(`${toastPrefix} not found after toggle processing.`);
      return;
    }
    if (newTree === tree && !newNode.completed) { // If tree didn't change and it's still uncompleted, it means it was prevented
      toast.error(`Complete all sub-${toastPrefix.toLowerCase()}s first!`);
      return;
    }

    // --- Handle journal activity for the toggled node itself ---
    if (user && ownerId && oldNode.completed !== newNode.completed) { // Use ownerId
      if (newNode.completed) { // If becoming completed
        await memoizedJournalActivityService.current.logActivity(
          ownerId, // Use ownerId
          refDate,
          {
            id: newNode.id,
            type: entityType,
            description: newNode.description,
            timestamp: newNode.completed_at || refDate.toISOString(),
            is_public: newNode.is_public ?? false,
            status: 'completed',
            // Removed details: newNode.details as ActionNode does not have this property
          }
        );
      } else if (oldNode.completed && oldNode.completed_at) { // If becoming uncompleted
        await memoizedJournalActivityService.current.removeActivity(
          ownerId, // Use ownerId
          new Date(oldNode.completed_at),
          oldNode.id,
          entityType,
          oldNode.is_public ?? false
        );
      }
    }

    // --- Handle journal activity for parents that became uncompleted ---
    if (user && ownerId && uncompletedFromCompleted.length > 0) { // Use ownerId
      for (const { id: parentId, completed_at, is_public } of uncompletedFromCompleted) {
        if (completed_at) {
          await memoizedJournalActivityService.current.removeActivity(ownerId, new Date(completed_at), parentId, entityType, is_public);
        }
      }
    }

    setLastDeletedContext(null); // Clear undo history on toggle
    save(newTree);
    return newNode;
  }, [tree, user, ownerId, entityType, save, toastPrefix, memoizedJournalActivityService]);

  const updateNodeText = useCallback((id: string, newText: string) => {
    setLastDeletedContext(null);
    save(updateActionTextInTree(tree, id, newText));
  }, [tree, save]);

  const deleteNode = useCallback((id: string) => {
    const { tree: newTree, deletedContext } = deleteActionFromTree(tree, id);
    setLastDeletedContext(deletedContext);
    save(newTree);
    toast.success(`${toastPrefix} deleted.`, {
        action: {
            label: "Undo",
            onClick: () => undoDeleteNode(),
        },
        duration: 5000,
    });
    return deletedContext;
  }, [tree, save, undoDeleteNode, toastPrefix]); // Add undoDeleteNode to dependencies

  const indentNode = useCallback(async (id: string) => {
    setLastDeletedContext(null);
    const treeAfterIndent = indentActionInTree(tree, id);

    const { newTree, uncompletedFromCompleted } = recalculateCompletionStatus(treeAfterIndent);

    save(newTree);

    // Remove journal activity for parents that became uncompleted
    if (user && ownerId && uncompletedFromCompleted.length > 0) { // Use ownerId
      for (const { id: parentId, completed_at, is_public } of uncompletedFromCompleted) {
        if (completed_at) {
          await memoizedJournalActivityService.current.removeActivity(ownerId, new Date(completed_at), parentId, entityType, is_public);
        }
      }
    }
  }, [tree, save, user, ownerId, entityType, memoizedJournalActivityService]);

  const outdentNode = useCallback(async (id: string) => {
    setLastDeletedContext(null);
    const treeAfterOutdent = outdentActionInTree(tree, id);

    const { newTree, uncompletedFromCompleted } = recalculateCompletionStatus(treeAfterOutdent);

    save(newTree);

    // Remove journal activity for parents that became uncompleted
    if (user && ownerId && uncompletedFromCompleted.length > 0) {
      for (const { id: parentId, completed_at, is_public } of uncompletedFromCompleted) {
        if (completed_at) {
          await memoizedJournalActivityService.current.removeActivity(ownerId, new Date(completed_at), parentId, entityType, is_public);
        }
      }
    }
  }, [tree, save, user, ownerId, entityType, memoizedJournalActivityService]);

  const moveNodeUp = useCallback((id: string) => {
    setLastDeletedContext(null);
    save(moveActionUpInTree(tree, id));
  }, [tree, save]);

  const moveNodeDown = useCallback((id: string) => {
    setLastDeletedContext(null);
    save(moveActionDownInTree(tree, id));
  }, [tree, save]);

  const toggleNodePrivacy = useCallback(async (id: string) => {
    setLastDeletedContext(null);

    const result = toggleActionPrivacyInTree(tree, id);

    if (result && user && ownerId) { // Use ownerId
      let { tree: newTree, oldNode, newNode } = result;

      if (oldNode.completed && oldNode.is_public !== newNode.is_public) {
        if (oldNode.completed_at) {
          await memoizedJournalActivityService.current.removeActivity(
            ownerId, // Use ownerId
            new Date(oldNode.completed_at),
            oldNode.id,
            entityType,
            oldNode.is_public ?? false
          );
        } else {
          console.warn(`${toastPrefix} ${oldNode.id} was completed but had no completed_at timestamp. Cannot remove from journal.`);
        }

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
        newTree = unmarkRecursive(newTree);
      }
      save(newTree);
    } else if (!result) {
      toast.error(`${toastPrefix} not found to toggle privacy.`);
    }
  }, [tree, save, user, ownerId, entityType, toastPrefix, memoizedJournalActivityService]);

  return {
    tree,
    loading,
    addNode,
    addNodeAfter,
    toggleNode,
    updateNodeText,
    deleteNode,
    undoDeleteNode,
    lastDeletedContext,
    indentNode,
    outdentNode,
    moveNodeUp,
    moveNodeDown,
    toggleNodePrivacy,
    setTree, // Expose setTree for cases like targets bucket migration
    dateContext // Expose dateContext
  };
};