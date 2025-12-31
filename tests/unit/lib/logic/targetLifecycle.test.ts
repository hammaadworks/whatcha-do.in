import { processTargetLifecycle } from '@/lib/logic/targetLifecycle';
import { fetchRawTargets, updateTargets } from '@/lib/supabase/targets';
import { getCurrentMonthStartISO } from '@/lib/date';
import { ActionNode } from '@/lib/supabase/types';

// Mock dependencies
jest.mock('@/lib/supabase/targets', () => ({
  fetchRawTargets: jest.fn(),
  updateTargets: jest.fn(),
}));

jest.mock('@/lib/date', () => ({
  getCurrentMonthStartISO: jest.fn(),
  getTodayISO: jest.fn((tz, date) => date ? date.toISOString().slice(0, 10) : '2023-11-01')
}));

// Mock logic processors to use actual implementation for integration testing
jest.mock('@/lib/logic/actions/processors', () => {
    const originalModule = jest.requireActual('@/lib/logic/actions/processors');
    return {
        ...originalModule,
    };
});


describe('processTargetLifecycle', () => {
  const userId = 'user-123';
  const timezone = 'UTC';
  // Scenario:
  // Prev Month: Oct 2023
  // Current Month: Nov 2023
  const prevMonthDate = '2023-10-01';
  const currentMonthDate = '2023-11-01';
  const referenceDate = new Date('2023-11-15T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentMonthStartISO as jest.Mock).mockImplementation((tz, ref, offset) => {
        if (offset === 0) return currentMonthDate;
        if (offset === -1) return prevMonthDate;
        return '2023-01-01';
    });
  });

  it('should migrate active targets and retain completed ones in history', async () => {
    const prevTargets: ActionNode[] = [
        { id: '1', description: 'Active', completed: false, children: [] },
        { id: '2', description: 'Completed Old', completed: true, completed_at: '2023-10-15T10:00:00Z', children: [] },
        { id: '3', description: 'Active with Completed Child', completed: false, children: [
            { id: '3a', description: 'Child Active', completed: false, children: [] },
            { id: '3b', description: 'Child Completed Old', completed: true, completed_at: '2023-10-20T10:00:00Z', children: [] }
        ] }
    ];

    (fetchRawTargets as jest.Mock).mockImplementation((uid, date) => {
        if (date === prevMonthDate) return Promise.resolve(prevTargets);
        if (date === currentMonthDate) return Promise.resolve([]); // Empty current bucket
        return Promise.resolve([]);
    });

    await processTargetLifecycle(userId, timezone, referenceDate);

    // 1. Check Migration to Current Month (Active Items)
    expect(updateTargets).toHaveBeenCalledWith(userId, currentMonthDate, expect.any(Array));
    const migratedCall = (updateTargets as jest.Mock).mock.calls.find(call => call[1] === currentMonthDate);
    const migratedTargets = migratedCall[2] as ActionNode[];

    // Expect '1' (Active)
    expect(migratedTargets.find(t => t.id === '1')).toBeDefined();
    // Expect '2' (Completed Old) to be GONE
    expect(migratedTargets.find(t => t.id === '2')).toBeUndefined();
    
    // Expect '3' (Active Parent)
    const parent = migratedTargets.find(t => t.id === '3');
    expect(parent).toBeDefined();
    // Expect '3a' (Active Child)
    expect(parent?.children?.find(c => c.id === '3a')).toBeDefined();
    // Expect '3b' (Completed Old Child) to be GONE from the migrated parent
    expect(parent?.children?.find(c => c.id === '3b')).toBeUndefined();


    // 2. Check Previous Bucket Update (Retained History)
    const retainedCall = (updateTargets as jest.Mock).mock.calls.find(call => call[1] === prevMonthDate);
    const retainedTargets = retainedCall[2] as ActionNode[];

    // Expect '1' (Active) to be GONE (moved away)
    expect(retainedTargets.find(t => t.id === '1')).toBeUndefined();
    
    // Expect '2' (Completed Old) to be PRESENT
    expect(retainedTargets.find(t => t.id === '2')).toBeDefined();

    // Expect '3' (Parent) to be PRESENT (as container)
    const retainedParent = retainedTargets.find(t => t.id === '3');
    expect(retainedParent).toBeDefined();
    
    // Expect '3a' (Active Child) to be GONE
    expect(retainedParent?.children?.find(c => c.id === '3a')).toBeUndefined();
    // Expect '3b' (Completed Child) to be PRESENT
    expect(retainedParent?.children?.find(c => c.id === '3b')).toBeDefined();
  });

  it('should prevent duplicates during migration', async () => {
    const prevTargets: ActionNode[] = [
        { id: '1', description: 'Active', completed: false, children: [] }
    ];
    // Target '1' already exists in current month (e.g. from previous run)
    const currentTargets: ActionNode[] = [
        { id: '1', description: 'Active', completed: false, children: [] },
        { id: '99', description: 'New', completed: false, children: [] }
    ];

    (fetchRawTargets as jest.Mock).mockImplementation((uid, date) => {
        if (date === prevMonthDate) return Promise.resolve(prevTargets);
        if (date === currentMonthDate) return Promise.resolve(currentTargets);
        return Promise.resolve([]);
    });

    await processTargetLifecycle(userId, timezone, referenceDate);

    // Since '1' already exists in currentTargets, migration should be skipped
    const migratedCall = (updateTargets as jest.Mock).mock.calls.find(call => call[1] === currentMonthDate);
    expect(migratedCall).toBeUndefined();

    // But it SHOULD still update the prev bucket (removing the active item '1', resulting in empty)
    expect(updateTargets).toHaveBeenCalledWith(userId, prevMonthDate, []);
  });
});
