// lib/utils/actionTreeUtils.ts
import { v4 as uuidv4 } from 'uuid';
import { ActionNode } from '@/lib/supabase/types'; // Correct import for ActionNode

/**
 * Helper function to create a deep copy of the tree to ensure immutability.
 * @param nodes The array of ActionNode to deep copy.
 * @returns A deep copy of the ActionNode array.
 */
export function deepCopyActions(nodes: ActionNode[]): ActionNode[] {
  return nodes.map(node => ({
    ...node,
    children: node.children ? deepCopyActions(node.children) : []
  }));
}

type FindResult = {
  node: ActionNode;
  parent: ActionNode | null;
  siblingsArray: ActionNode[];
  indexInSiblings: number;
};

/**
 * Helper function to find a node and its context (parent, siblings array, index) recursively.
 * @param nodes The current level of nodes to search.
 * @param targetId The ID of the node to find.
 * @param parent The parent node of the current level (for context).
 * @returns FindResult if found, otherwise null.
 */
export function findNodeAndContext(
  nodes: ActionNode[],
  targetId: string,
  parent: ActionNode | null = null
): FindResult | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === targetId) {
      return { node, parent, siblingsArray: nodes, indexInSiblings: i };
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeAndContext(node.children, targetId, node);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Helper to recursively check if all children (and their descendants) are completed.
 * @param node The ActionNode to check its children.
 * @returns True if all children and their descendants are completed, false otherwise.
 */
export function areAllChildrenCompleted(node: ActionNode): boolean {
  if (!node.children || node.children.length === 0) {
    return true; // No children, so all children are "completed"
  }
  return node.children.every(child => child.completed && areAllChildrenCompleted(child));
}

/**
 * Recalculates the completion status of parents based on their children.
 * If a parent is completed but has uncompleted children (or children that became uncompleted),
 * the parent will be marked as uncompleted.
 * @param currentTree The current action tree.
 * @returns An object containing the new tree and a list of IDs of nodes that transitioned from completed to uncompleted.
 */
export function recalculateCompletionStatus(currentTree: ActionNode[]): { newTree: ActionNode[], uncompletedFromCompleted: { id: string, completed_at: string | undefined, is_public: boolean }[] } {
    const uncompletedFromCompleted: { id: string, completed_at: string | undefined, is_public: boolean }[] = [];

    const recalculateRecursive = (nodes: ActionNode[]): ActionNode[] => {
        return nodes.map(node => {
            let newNode = { ...node };

            // Recursively process children first
            if (newNode.children && newNode.children.length > 0) {
                newNode.children = recalculateRecursive(newNode.children);

                // Check if any child is now uncompleted
                const anyChildUncompleted = newNode.children.some(child => !child.completed);

                // If this node was completed but now has an uncompleted child, unmark it
                if (anyChildUncompleted && newNode.completed) {
                    newNode.completed = false;
                    const oldCompletedAt = newNode.completed_at; // Capture old completed_at
                    const oldIsPublic = newNode.is_public ?? true; // Capture original is_public
                    newNode.completed_at = undefined; // Clear completion timestamp
                    uncompletedFromCompleted.push({ id: newNode.id, completed_at: oldCompletedAt, is_public: oldIsPublic }); // Record with old completed_at and is_public
                }
            }
            return newNode;
        });
    };

    const newTree = recalculateRecursive(deepCopyActions(currentTree));
    return { newTree, uncompletedFromCompleted };
}


/**
 * Adds a new action to the tree.
 * @param currentTree The current action tree.
 * @param description The description of the new action.
 * @param parentId Optional ID of the parent action to add the new action as a child.
 * @param isPublic Optional, whether the new action is public. Defaults to true.
 * @returns A new action tree with the added action.
 */
export function addActionToTree(currentTree: ActionNode[], description: string, parentId?: string, isPublic: boolean = true): ActionNode[] {
    const addRecursive = (nodes: ActionNode[]): ActionNode[] => {
        // If parentId is not provided, or current level is the target parent, add to this level
        if (!parentId) { // Adding to root
            return [
                ...nodes,
                {
                    id: uuidv4(),
                    description,
                    completed: false,
                    is_public: isPublic, // Set is_public
                    children: [],
                    completed_at: undefined
                }
            ];
        }

        return nodes.map(node => {
            if (node.id === parentId) {
                // Found the parent.
                // Check parent's privacy. If parent is private, child MUST be private.
                const parentIsPublic = node.is_public ?? true;
                const effectiveIsPublic = parentIsPublic ? isPublic : false;

                // Add child to its children array
                return {
                    ...node,
                    children: [
                        ...(node.children || []),
                        {
                            id: uuidv4(),
                            description,
                            completed: false,
                            is_public: effectiveIsPublic, // Use effective privacy
                            children: [],
                            completed_at: undefined
                        }
                    ]
                };
            } else if (node.children && node.children.length > 0) {
                // Recursively search in children
                return { ...node, children: addRecursive(node.children) };
            }
            return node;
        });
    };
    return addRecursive(deepCopyActions(currentTree));
}

/**
 * Adds a new action after a specified existing action in the tree.
 * @param currentTree The current action tree.
 * @param afterId The ID of the action after which to insert the new action.
 * @param description The description of the new action.
 * @param isPublic Optional, whether the new action is public. Defaults to true.
 * @returns A new action tree with the added action.
 */
export function addActionAfterId(currentTree: ActionNode[], afterId: string, description: string, isPublic: boolean = true): [ActionNode[], string] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, afterId);

    if (!targetContext) return [newTree, '']; // Target not found, return empty ID

    const { siblingsArray, indexInSiblings } = targetContext;

    const newAction: ActionNode = {
        id: uuidv4(),
        description,
        completed: false,
        is_public: isPublic,
        children: [],
        completed_at: undefined
    };

    // Determine parent's privacy to enforce effectiveIsPublic
    let effectiveIsPublic = isPublic;
    if (targetContext.parent && !targetContext.parent.is_public) {
        effectiveIsPublic = false; // If parent is private, child must be private
    }

    newAction.is_public = effectiveIsPublic;

    // Insert the new action right after the target action in the same siblings array
    siblingsArray.splice(indexInSiblings + 1, 0, newAction);

    return [newTree, newAction.id];
}

/**
 * Toggles the completed status of an action in the tree.
 * @param currentTree The current action tree.
 * @param id The ID of the action to toggle.
 * @param date The date to use for the completion timestamp. Defaults to now.
 * @returns A new action tree with the toggled action, or the original tree if completion is prevented.
 */
export function toggleActionInTree(currentTree: ActionNode[], id: string, date: Date = new Date()): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree; // Node not found

    const { node: targetNode } = targetContext;

    // If trying to mark as completed, check if all children are completed
    if (!targetNode.completed) {
      if (!areAllChildrenCompleted(targetNode)) {
        // Prevent marking as completed if sub-items are not done
        // No toast here as this is a utility function, toast should be in UI layer (useActions hook)
        return currentTree; // Return original tree to prevent state change
      }
    }

    // Proceed with toggling if it's being unchecked, or if it's being checked and all children are complete
    const toggleRecursive = (nodes: ActionNode[]): ActionNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          const newCompleted = !node.completed;
          return {
            ...node,
            completed: newCompleted,
            completed_at: newCompleted ? date.toISOString() : undefined
          };
        } else if (node.children && node.children.length > 0) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });
    };
    return toggleRecursive(newTree);
}

/**
 * Adds an existing action node (preserving ID, children, and properties) to the tree.
 * @param currentTree The current action tree.
 * @param node The ActionNode to add.
 * @param parentId Optional ID of the parent action to add the node as a child.
 * @returns A new action tree with the added node.
 */
export function addExistingActionToTree(currentTree: ActionNode[], node: ActionNode, parentId?: string): ActionNode[] {
    const addRecursive = (nodes: ActionNode[]): ActionNode[] => {
        // If parentId is not provided, add to this level (root)
        if (!parentId) {
            return [...nodes, node];
        }

        return nodes.map(n => {
            if (n.id === parentId) {
                // Found the parent.
                // Enforce privacy: if parent is private, child must be private.
                // We will modify the node (and its subtree) if necessary to comply.
                let nodeToAdd = { ...node };
                
                if (n.is_public === false && nodeToAdd.is_public !== false) {
                     // Parent is private, but node is public (or undefined). Force private.
                     const setPrivateRecursive = (target: ActionNode): ActionNode => ({
                         ...target,
                         is_public: false,
                         children: target.children ? target.children.map(setPrivateRecursive) : []
                     });
                     nodeToAdd = setPrivateRecursive(nodeToAdd);
                }

                return {
                    ...n,
                    children: [...(n.children || []), nodeToAdd]
                };
            } else if (n.children && n.children.length > 0) {
                return { ...n, children: addRecursive(n.children) };
            }
            return n;
        });
    };
    return addRecursive(deepCopyActions(currentTree));
}

/**
 * Updates the description of an action in the tree.
 * @param currentTree The current action tree.
 * @param id The ID of the action to update.
 * @param newText The new description for the action.
 * @returns A new action tree with the updated action.
 */
export function updateActionTextInTree(currentTree: ActionNode[], id: string, newText: string): ActionNode[] {
    const updateRecursive = (nodes: ActionNode[]): ActionNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, description: newText };
        } else if (node.children && node.children.length > 0) {
          return { ...node, children: updateRecursive(node.children) };
        }
        return node;
      });
    };
    return updateRecursive(deepCopyActions(currentTree));
}

/**
 * Moves an action up in its sibling list.
 * If it's already the first sibling, no change occurs.
 * @param currentTree The current action tree.
 * @param id The ID of the action to move up.
 * @returns A new action tree with the action moved up.
 */
export function moveActionUpInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;

    if (indexInSiblings === 0) return newTree; // Cannot move up if it's the first sibling

    siblingsArray.splice(indexInSiblings, 1); // Remove targetNode
    siblingsArray.splice(indexInSiblings - 1, 0, targetNode); // Insert one position before

    return newTree;
}

/**
 * Moves an action down in its sibling list.
 * If it's already the last sibling, no change occurs.
 * @param currentTree The current action tree.
 * @param id The ID of the action to move down.
 * @returns A new action tree with the action moved down.
 */
export function moveActionDownInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;

    if (indexInSiblings === siblingsArray.length - 1) return newTree; // Cannot move down if it's the last sibling

    siblingsArray.splice(indexInSiblings, 1); // Remove targetNode
    siblingsArray.splice(indexInSiblings + 1, 0, targetNode); // Insert one position after

    return newTree;
}

/**
 * Indents an action, making it a child of the preceding sibling.
 * If there's no preceding sibling, no change occurs.
 * @param currentTree The current action tree.
 * @param id The ID of the action to indent.
 * @returns A new action tree with the action indented.
 */
export function indentActionInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    if (targetContext.indexInSiblings === 0) return newTree; // Cannot indent first sibling

    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;
    const previousSibling = siblingsArray[indexInSiblings - 1];

    if (!previousSibling) return newTree; 

    siblingsArray.splice(indexInSiblings, 1);
    previousSibling.children = [...(previousSibling.children || []), targetNode];

    return newTree;
}

/**
 * Outdents an action, making it a sibling of its current parent.
 * Inserts it right after the parent. If it's a top-level node, no change occurs.
 * @param currentTree The current action tree.
 * @param id The ID of the action to outdent.
 * @returns A new action tree with the action outdented.
 */
export function outdentActionInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext || !targetContext.parent) return newTree; // Node not found or already top-level

    const { node: targetNode, parent, siblingsArray, indexInSiblings } = targetContext;
    
    siblingsArray.splice(indexInSiblings, 1); // Remove from parent's children

    const parentContext = findNodeAndContext(newTree, parent.id);

    if (parentContext) {
      // Insert targetNode right after its former parent
      parentContext.siblingsArray.splice(parentContext.indexInSiblings + 1, 0, targetNode);
    } else {
      // Parent was a top-level node, insert targetNode into the main array
      const parentIndexInRoot = newTree.findIndex(node => node.id === parent.id);
      if (parentIndexInRoot !== -1) {
        newTree.splice(parentIndexInRoot + 1, 0, targetNode);
      } else {
        // Fallback: Add to root if parent not found (shouldn't happen with findNodeAndContext)
        newTree.push(targetNode);
      }
    }

    return newTree;
}

/**
 * Toggles the privacy status of an action in the tree.
 * Enforces "Private Parent -> Private Child" rule.
 * @param currentTree The current action tree.
 * @param id The ID of the action to toggle.
 * @returns A new action tree with the privacy status updated.
 */
export function toggleActionPrivacyInTree(currentTree: ActionNode[], id: string): { tree: ActionNode[], oldNode: ActionNode, newNode: ActionNode } | null {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return null;
    const { node: targetNode } = targetContext;

    const oldNode = { ...targetNode }; // Capture old state before modification

    const currentIsPublic = targetNode.is_public ?? true;
    const newIsPublic = !currentIsPublic;
    targetNode.is_public = newIsPublic;

    if (!newIsPublic) {
        // Turning PRIVATE: Enforce downwards.
        const setPrivateRecursive = (n: ActionNode) => {
            n.is_public = false;
            n.children?.forEach(setPrivateRecursive);
        };
        targetNode.children?.forEach(setPrivateRecursive);
    } else {
        // Turning PUBLIC: Enforce upwards.
        const path: ActionNode[] = [];
        const findPath = (nodes: ActionNode[], target: string): boolean => {
            for (const node of nodes) {
                if (node.id === target) {
                    path.push(node);
                    return true;
                }
                if (node.children) {
                    path.push(node);
                    if (findPath(node.children, target)) return true;
                    path.pop();
                }
            }
            return false;
        };
        
        if (findPath(newTree, id)) {
            path.forEach(n => {
                n.is_public = true;
            });
        }
    }
    
    // Return the new tree, the original state of the node, and the new state of the node after privacy toggle and propagation
    return { tree: newTree, oldNode, newNode: targetNode };
}

/**
 * Context for a deleted action node, used for undo functionality.
 */
export type DeletedNodeContext = {
    node: ActionNode;
    parentId: string | null;
    index: number; // Index within parent's children array or root array
};

/**
 * Deletes an action from the tree, returning the deleted node's context.
 * @param currentTree The current action tree.
 * @param id The ID of the action to delete.
 * @returns An object containing the new tree and the DeletedNodeContext if a node was deleted.
 */
export function deleteActionFromTree(currentTree: ActionNode[], id: string): { tree: ActionNode[], deletedContext: DeletedNodeContext | null } {
    const newTree = deepCopyActions(currentTree);
    let deletedContext: DeletedNodeContext | null = null;

    const deleteRecursive = (nodes: ActionNode[], parentId: string | null): ActionNode[] => {
        const newNodes: ActionNode[] = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.id === id) {
                deletedContext = { node: { ...node }, parentId, index: i }; // Capture context before deleting
                continue; // Skip this node
            }
            if (node.children && node.children.length > 0) {
                newNodes.push({ ...node, children: deleteRecursive(node.children, node.id) });
            } else {
                newNodes.push({ ...node }); // Push a copy
            }
        }
        return newNodes;
    };
    const finalTree = deleteRecursive(newTree, null);
    return { tree: finalTree, deletedContext };
}

/**
 * Restores a deleted action node into the tree at its original position.
 * @param currentTree The current action tree.
 * @param context The context of the deleted node to restore.
 * @returns A new action tree with the node restored.
 */
export function restoreActionInTree(currentTree: ActionNode[], context: DeletedNodeContext): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const { node, parentId, index } = context;

    if (parentId === null) {
        // Restore to root level
        newTree.splice(index, 0, node);
    } else {
        // Restore as a child of its original parent
        const parentContext = findNodeAndContext(newTree, parentId);
        if (parentContext && parentContext.node.children) {
            parentContext.node.children.splice(index, 0, node);
        } else if (parentContext) { // Parent found, but no children array yet
             parentContext.node.children = [node];
        } else {
            // Fallback: If parent not found, add to root (shouldn't happen with proper context)
            newTree.push(node);
        }
    }
    return newTree;
}