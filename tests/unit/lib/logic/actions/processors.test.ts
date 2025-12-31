import {
  applyNextDayClearing,
  partitionActionsByClearingStatus,
  filterTreeByPublicStatus
} from '@/lib/logic/actions/processors';
import { ActionNode } from '@/lib/supabase/types';
import { getTodayISO } from '@/lib/date';

jest.mock('@/lib/date', () => ({
  getTodayISO: jest.fn()
}));

describe('Action Processors', () => {
  const todayISO = "2023-11-15";
  const timezone = "UTC";
  
  // Timestamps
  const yesterdayTimestamp = "2023-11-14T12:00:00Z";
  const todayTimestamp = "2023-11-15T12:00:00Z";

  beforeEach(() => {
      // Mock getTodayISO behavior
      (getTodayISO as jest.Mock).mockImplementation((tz, date) => {
          if (!date) return todayISO;
          // Return YYYY-MM-DD from the date object
          return date.toISOString().slice(0, 10);
      });
  });

  const mockNodes: ActionNode[] = [
    {
      id: '1',
      description: 'Completed Yesterday',
      completed: true,
      completed_at: yesterdayTimestamp,
      children: []
    },
    {
      id: '2',
      description: 'Completed Today',
      completed: true,
      completed_at: todayTimestamp,
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
      completed_at: yesterdayTimestamp,
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
      completed_at: yesterdayTimestamp,
      children: [
        {
          id: '5-1',
          description: 'Child Completed Yesterday',
          completed: true,
          completed_at: yesterdayTimestamp,
          children: []
        }
      ]
    }
  ];

  describe('partitionActionsByClearingStatus', () => {
    it('should clear items completed before todayISO', () => {
      const { kept, removed } = partitionActionsByClearingStatus(mockNodes, todayISO, timezone);
      
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
         const { removed } = partitionActionsByClearingStatus(mockNodes, todayISO, timezone);
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
        expect(privateCount).toBe(1);
    });
  });
});