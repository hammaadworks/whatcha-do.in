import {
  applyNextDayClearing,
  partitionActionsByClearingStatus,
  filterTreeByPublicStatus
} from '@/lib/logic/actions/processors';
import { ActionNode } from '@/lib/supabase/types';

describe('Action Processors', () => {
  const startOfToday = 1700000000000; // Arbitrary timestamp for "Start of Today"
  const yesterday = new Date(startOfToday - 86400000).toISOString();
  const today = new Date(startOfToday + 3600000).toISOString(); // 1 hour into today

  const mockNodes: ActionNode[] = [
    {
      id: '1',
      description: 'Completed Yesterday',
      completed: true,
      completed_at: yesterday,
      children: []
    },
    {
      id: '2',
      description: 'Completed Today',
      completed: true,
      completed_at: today,
      children: []
    },
    {
      id: '3',
      description: 'Not Completed',
      completed: false,
      children: []
    },
    {
      id: '4',
      description: 'Parent Completed Yesterday with Active Child',
      completed: true,
      completed_at: yesterday,
      children: [
        {
          id: '4-1',
          description: 'Active Child',
          completed: false,
          children: []
        }
      ]
    },
     {
      id: '5',
      description: 'Parent Completed Yesterday with Completed Yesterday Child',
      completed: true,
      completed_at: yesterday,
      children: [
        {
          id: '5-1',
          description: 'Child Completed Yesterday',
          completed: true,
          completed_at: yesterday,
          children: []
        }
      ]
    }
  ];

  describe('partitionActionsByClearingStatus', () => {
    it('should clear items completed before startOfToday', () => {
      const { kept, removed } = partitionActionsByClearingStatus(mockNodes, startOfToday);
      
      const keptIds = kept.map(n => n.id);
      const removedIds = removed.map(n => n.id);

      expect(keptIds).toContain('2'); // Completed Today
      expect(keptIds).toContain('3'); // Not Completed
      expect(keptIds).toContain('4'); // Parent kept because of active child
      expect(keptIds).not.toContain('1'); // Completed Yesterday
      expect(keptIds).not.toContain('5'); // Parent and child both completed yesterday

      expect(removedIds).toContain('1');
      expect(removedIds).toContain('5');
      expect(removedIds).toContain('5-1');
    });

    it('should recursively clear children', () => {
         const { removed } = partitionActionsByClearingStatus(mockNodes, startOfToday);
         const removedIds = removed.map(n => n.id);
         expect(removedIds).toContain('5-1');
    });
  });

  describe('filterTreeByPublicStatus', () => {
    const publicNodes: ActionNode[] = [
        {
            id: 'p1',
            description: 'Public Item',
            is_public: true,
            completed: false,
            children: []
        },
        {
            id: 'p2',
            description: 'Private Item',
            is_public: false,
            completed: false,
            children: []
        },
        {
            id: 'p3',
            description: 'Private Parent with Public Child',
            is_public: false,
            completed: false,
            children: [
                {
                    id: 'p3-1',
                    description: 'Public Child',
                    is_public: true,
                    completed: false,
                    children: []
                }
            ]
        }
    ];

    it('should only return public nodes', () => {
        const { actions, privateCount } = filterTreeByPublicStatus(publicNodes);
        const ids = actions.map(n => n.id);

        expect(ids).toContain('p1');
        expect(ids).not.toContain('p2');
        expect(ids).toContain('p3'); // Kept as container
        expect(privateCount).toBeGreaterThan(0);
    });

    it('should count private uncompleted items', () => {
        const { privateCount } = filterTreeByPublicStatus(publicNodes);
        // p2 is private (1)
        // p3 is private but shown as container. Does it count?
        // Logic says: if isPublic OR children.length > 0 -> Show.
        // p3 has children, so it is SHOWN.
        // p2 is hidden.
        
        // Let's check p2.
        expect(privateCount).toBe(1);
    });
  });
});
