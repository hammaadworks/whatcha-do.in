import { v4 as uuidv4 } from 'uuid';
import { ActionNode } from '@/lib/supabase/types';

/**
 * Creates a deep copy of an action tree to ensure immutability.
 * 
 * Used before performing any state mutations to avoid side effects on the React state or original data.
 *
 * @param nodes - The array of ActionNode objects to deep copy.
 * @returns A new array containing deep copies of all nodes and their descendants.
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
 * Recursively locates a node within the tree and returns its context.
 * 
 * The context includes the node itself, its parent, the array of siblings it belongs to,
 * and its index within that sibling array. This is essential for operations like moving,
 * indenting, or deleting nodes.
 *
 * @param nodes - The current level of nodes to search.
 * @param targetId - The unique ID of the node to find.
 * @param parent - The parent node of the current level (internal use for recursion).
 * @returns A `FindResult` object if found, or `null` if the node does not exist in the tree.
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
 * Checks if all descendants of a given node are completed.
 * 
 * A parent node cannot be marked as completed unless all its children are also completed.
 * This function recursively verifies this condition.
 *
 * @param node - The ActionNode to inspect.
 * @returns `true` if all children (and their children) are completed or if there are no children; `false` otherwise.
 */
export function areAllChildrenCompleted(node: ActionNode): boolean {
  if (!node.children || node.children.length === 0) {
    return true; 
  }
  return node.children.every(child => child.completed && areAllChildrenCompleted(child));
}

/**
 * Recalculates the completion status of the entire tree.
 * 
 * Enforces the business rule: "If a child becomes uncompleted, its parent must also be uncompleted."
 * This is useful when a user unchecks a sub-task, requiring the parent task to reopen.
 *
 * @param currentTree - The current action tree.
 * @returns An object containing:
 *  - `newTree`: The updated tree with corrected completion statuses.
 *  - `uncompletedFromCompleted`: A list of nodes that were forced to uncomplete, including their previous completion timestamp.
 */
export function recalculateCompletionStatus(currentTree: ActionNode[]): { 
  newTree: ActionNode[], 
  uncompletedFromCompleted: { id: string, completed_at: string | undefined, is_public: boolean }[] 
} {
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
                    const oldCompletedAt = newNode.completed_at; 
                    const oldIsPublic = newNode.is_public ?? true; 
                    newNode.completed_at = undefined; 
                    uncompletedFromCompleted.push({ id: newNode.id, completed_at: oldCompletedAt, is_public: oldIsPublic }); 
                }
            }
            return newNode;
        });
    };

    const newTree = recalculateRecursive(deepCopyActions(currentTree));
    return { newTree, uncompletedFromCompleted };
}

/**
 * Appends a new action to the tree.
 * 
 * If a `parentId` is provided, the new action is added as a child of that node.
 * Otherwise, it is added to the root level.
 * 
 * **Privacy Rule:** If the parent is private, the child is forced to be private, ignoring the `isPublic` parameter.
 *
 * @param currentTree - The current action tree.
 * @param description - The text description of the new action.
 * @param parentId - (Optional) The ID of the parent node. If omitted, adds to root.
 * @param isPublic - (Optional) Desired privacy status. Defaults to `true`. Overridden by parent privacy.
 * @returns A new action tree containing the added node.
 */
export function addActionToTree(currentTree: ActionNode[], description: string, parentId?: string, isPublic: boolean = true): ActionNode[] {
    const addRecursive = (nodes: ActionNode[]): ActionNode[] => {
        if (!parentId) { 
            return [
                ...nodes,
                {
                    id: uuidv4(),
                    description,
                    completed: false,
                    is_public: isPublic, 
                    children: [],
                    completed_at: undefined
                }
            ];
        }

        return nodes.map(node => {
            if (node.id === parentId) {
                const parentIsPublic = node.is_public ?? true;
                const effectiveIsPublic = parentIsPublic ? isPublic : false;

                return {
                    ...node,
                    children: [
                        ...(node.children || []),
                        {
                            id: uuidv4(),
                            description,
                            completed: false,
                            is_public: effectiveIsPublic, 
                            children: [],
                            completed_at: undefined
                        }
                    ]
                };
            } else if (node.children && node.children.length > 0) {
                return { ...node, children: addRecursive(node.children) };
            }
            return node;
        });
    };
    return addRecursive(deepCopyActions(currentTree));
}

/**
 * Inserts a new action immediately after a specific sibling node.
 * 
 * Useful for creating tasks in a specific order (e.g., pressing "Enter" in a list).
 * 
 * **Privacy Rule:** Inherits privacy constraints from the parent (if any).
 *
 * @param currentTree - The current action tree.
 * @param afterId - The ID of the sibling node to insert after.
 * @param description - The text description of the new action.
 * @param isPublic - (Optional) Desired privacy status. Defaults to `true`.
 * @returns A tuple containing `[newTree, newActionId]`. If `afterId` is not found, returns original tree and empty string.
 */
export function addActionAfterId(currentTree: ActionNode[], afterId: string, description: string, isPublic: boolean = true): [ActionNode[], string] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, afterId);

    if (!targetContext) return [newTree, '']; 

    const { siblingsArray, indexInSiblings } = targetContext;

    const newAction: ActionNode = {
        id: uuidv4(),
        description,
        completed: false,
        is_public: isPublic,
        children: [],
        completed_at: undefined
    };

    let effectiveIsPublic = isPublic;
    if (targetContext.parent && !targetContext.parent.is_public) {
        effectiveIsPublic = false; 
    }

    newAction.is_public = effectiveIsPublic;

    siblingsArray.splice(indexInSiblings + 1, 0, newAction);

    return [newTree, newAction.id];
}

/**
 * Toggles the 'completed' state of an action.
 * 
 * **Rules:**
 * 1. A node cannot be marked completed if it has incomplete children.
 * 2. When marked completed, `completed_at` is set to the provided date.
 * 3. When unmarked, `completed_at` is cleared.
 *
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to toggle.
 * @param date - The timestamp for completion.
 * @returns A new action tree. Returns the original tree if the toggle is invalid (e.g., incomplete children).
 */
export function toggleActionInTree(currentTree: ActionNode[], id: string, date: Date): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree; 

    const { node: targetNode } = targetContext;

    if (!targetNode.completed) {
      if (!areAllChildrenCompleted(targetNode)) {
        return currentTree; 
      }
    }

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
 * Inserts an existing `ActionNode` object into the tree.
 * 
 * Used for moving nodes (cut/paste) or restoring deleted nodes.
 * Preserves the node's existing ID, children, and properties.
 * 
 * **Privacy Rule:** If the new parent is private, the inserted node (and its children) are recursively forced to private.
 *
 * @param currentTree - The current action tree.
 * @param node - The `ActionNode` object to insert.
 * @param parentId - (Optional) The ID of the parent node. If omitted, adds to root.
 * @returns A new action tree with the inserted node.
 */
export function addExistingActionToTree(currentTree: ActionNode[], node: ActionNode, parentId?: string): ActionNode[] {
    const addRecursive = (nodes: ActionNode[]): ActionNode[] => {
        if (!parentId) {
            return [...nodes, node];
        }

        return nodes.map(n => {
            if (n.id === parentId) {
                let nodeToAdd = { ...node };
                
                // Enforce privacy downwards
                if (n.is_public === false && nodeToAdd.is_public !== false) {
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
 * Updates the text description of a specific action.
 *
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to update.
 * @param newText - The new description text.
 * @returns A new action tree with the updated description.
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
 * Moves an action one step up within its list of siblings.
 * 
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to move.
 * @returns A new action tree. Returns original tree if the node is already first.
 */
export function moveActionUpInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;

    if (indexInSiblings === 0) return newTree; 

    siblingsArray.splice(indexInSiblings, 1); 
    siblingsArray.splice(indexInSiblings - 1, 0, targetNode); 

    return newTree;
}

/**
 * Moves an action one step down within its list of siblings.
 * 
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to move.
 * @returns A new action tree. Returns original tree if the node is already last.
 */
export function moveActionDownInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;

    if (indexInSiblings === siblingsArray.length - 1) return newTree; 

    siblingsArray.splice(indexInSiblings, 1); 
    siblingsArray.splice(indexInSiblings + 1, 0, targetNode); 

    return newTree;
}

/**
 * Indents an action, making it the last child of its previous sibling.
 * 
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to indent.
 * @returns A new action tree. Returns original tree if there is no previous sibling.
 */
export function indentActionInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return newTree;
    if (targetContext.indexInSiblings === 0) return newTree; 

    const { node: targetNode, siblingsArray, indexInSiblings } = targetContext;
    const previousSibling = siblingsArray[indexInSiblings - 1];

    if (!previousSibling) return newTree; 

    siblingsArray.splice(indexInSiblings, 1);
    previousSibling.children = [...(previousSibling.children || []), targetNode];

    return newTree;
}

/**
 * Outdents an action, moving it from its current parent to become a sibling of that parent.
 * 
 * The node is inserted immediately after its former parent.
 * 
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to outdent.
 * @returns A new action tree. Returns original tree if the node is already at the root level.
 */
export function outdentActionInTree(currentTree: ActionNode[], id: string): ActionNode[] {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext || !targetContext.parent) return newTree; 

    const { node: targetNode, parent, siblingsArray, indexInSiblings } = targetContext;
    
    siblingsArray.splice(indexInSiblings, 1); 

    const parentContext = findNodeAndContext(newTree, parent.id);

    if (parentContext) {
      parentContext.siblingsArray.splice(parentContext.indexInSiblings + 1, 0, targetNode);
    } else {
      // Parent was root; adding to root array after parent
      const parentIndexInRoot = newTree.findIndex(node => node.id === parent.id);
      if (parentIndexInRoot !== -1) {
        newTree.splice(parentIndexInRoot + 1, 0, targetNode);
      } else {
        newTree.push(targetNode);
      }
    }

    return newTree;
}

/**
 * Toggles the public/private visibility of a node.
 * 
 * **Propagation Rules:**
 * 1. **Making Private:** Recursively sets all descendants to private.
 * 2. **Making Public:** Recursively sets all ancestors to public (since a public child cannot exist in a private parent).
 *
 * @param currentTree - The current action tree.
 * @param id - The ID of the node to toggle.
 * @returns An object containing:
 *  - `tree`: The updated action tree.
 *  - `oldNode`: A copy of the node before the change.
 *  - `newNode`: A reference to the node in the new tree (after change).
 *  Returns `null` if the node is not found.
 */
export function toggleActionPrivacyInTree(currentTree: ActionNode[], id: string): { tree: ActionNode[], oldNode: ActionNode, newNode: ActionNode } | null {
    const newTree = deepCopyActions(currentTree);
    const targetContext = findNodeAndContext(newTree, id);

    if (!targetContext) return null;
    const { node: targetNode } = targetContext;

    const oldNode = { ...targetNode }; 

    const currentIsPublic = targetNode.is_public ?? true;
    const newIsPublic = !currentIsPublic;
    targetNode.is_public = newIsPublic;

    if (!newIsPublic) {
        // Enforce privacy downwards
        const setPrivateRecursive = (n: ActionNode) => {
            n.is_public = false;
            n.children?.forEach(setPrivateRecursive);
        };
        targetNode.children?.forEach(setPrivateRecursive);
    } else {
        // Enforce publicity upwards
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
    
    return { tree: newTree, oldNode, newNode: targetNode };
}

/**
 * Structure capturing the state of a deleted node for undo purposes.
 */
export type DeletedNodeContext = {
    node: ActionNode;
    parentId: string | null;
    index: number; 
};

/**
 * Removes an action from the tree.
 * 
 * @param currentTree - The current action tree.
 * @param id - The ID of the action to delete.
 * @returns An object containing:
 *  - `tree`: The updated tree without the node.
 *  - `deletedContext`: Information needed to restore the node (node data, parent ID, index).
 */
export function deleteActionFromTree(currentTree: ActionNode[], id: string): { tree: ActionNode[], deletedContext: DeletedNodeContext | null } {
    const newTree = deepCopyActions(currentTree);
    let deletedContext: DeletedNodeContext | null = null;

    const deleteRecursive = (nodes: ActionNode[], parentId: string | null): ActionNode[] => {
        const newNodes: ActionNode[] = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.id === id) {
                deletedContext = { node: { ...node }, parentId, index: i }; 
                continue; 
            }
            if (node.children && node.children.length > 0) {
                newNodes.push({ ...node, children: deleteRecursive(node.children, node.id) });
            } else {
                newNodes.push({ ...node }); 
            }
        }
        return newNodes;
    };
    const finalTree = deleteRecursive(newTree, null);
    return { tree: finalTree, deletedContext };
}

/**
 * Restores a previously deleted node to its original position.
 * 
 * @param currentTree - The current action tree.
 * @param context - The `DeletedNodeContext` from the deletion operation.
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