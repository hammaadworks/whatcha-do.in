// Mock uuid before importing the module that uses it
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)
}));

import {
  addActionToTree,
  toggleActionInTree,
  deleteActionFromTree,
  findNodeAndContext,
  deepCopyActions
} from '@/lib/logic/actions/tree-utils';
import { ActionNode } from '@/lib/supabase/types';

describe('tree-utils', () => {
  const mockTree: ActionNode[] = [
    {
      id: '1',
      description: 'Root 1',
      completed: false,
      is_public: true,
      children: [
        {
          id: '1-1',
          description: 'Child 1-1',
          completed: false,
          is_public: true,
          children: []
        }
      ]
    },
    {
      id: '2',
      description: 'Root 2',
      completed: true,
      is_public: false,
      children: []
    }
  ];

  describe('addActionToTree', () => {
    it('should add a node to the root', () => {
      const newTree = addActionToTree(mockTree, 'New Root');
      expect(newTree.length).toBe(3);
      expect(newTree[2].description).toBe('New Root');
      expect(newTree[2].is_public).toBe(true);
    });

    it('should add a child node', () => {
      const newTree = addActionToTree(mockTree, 'New Child', '1');
      expect(newTree[0].children?.length).toBe(2);
      expect(newTree[0].children?.[1].description).toBe('New Child');
    });

    it('should enforce parent privacy on child', () => {
      // Parent '2' is private (is_public: false)
      const newTree = addActionToTree(mockTree, 'Private Child', '2', true); 
      // We requested is_public: true, but parent is private
      expect(newTree[1].children?.[0].is_public).toBe(false);
    });
  });

  describe('toggleActionInTree', () => {
    it('should toggle a completed status', () => {
        // First complete the child so the parent can be completed
      let newTree = toggleActionInTree(mockTree, '1-1');
      newTree = toggleActionInTree(newTree, '1');
      expect(newTree[0].completed).toBe(true);
      expect(newTree[0].completed_at).toBeDefined();
    });

    it('should un-toggle a completed status', () => {
        // '2' is completed
      const newTree = toggleActionInTree(mockTree, '2');
      expect(newTree[1].completed).toBe(false);
      expect(newTree[1].completed_at).toBeUndefined();
    });

    it('should not toggle if children are not completed', () => {
      // '1' has child '1-1' which is NOT completed.
      // Trying to complete '1' should fail.
      const newTree = toggleActionInTree(mockTree, '1');
      // Wait, my mock says '1' is completed: false.
      // So I am trying to complete it.
      // logic: if (!targetNode.completed) { if (!areAllChildrenCompleted) return currentTree; }
      
      // Child '1-1' is not completed. So '1' cannot be completed.
      expect(newTree[0].completed).toBe(false);
    });
  });

  describe('deleteActionFromTree', () => {
    it('should delete a node', () => {
      const { tree, deletedContext } = deleteActionFromTree(mockTree, '1');
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe('2');
      expect(deletedContext).toBeDefined();
      expect(deletedContext?.node.id).toBe('1');
    });

    it('should delete a child node', () => {
      const { tree, deletedContext } = deleteActionFromTree(mockTree, '1-1');
      expect(tree[0].children?.length).toBe(0);
      expect(deletedContext?.node.id).toBe('1-1');
      expect(deletedContext?.parentId).toBe('1');
    });
  });
});
