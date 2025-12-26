import { processActionLifecycle } from '@/lib/logic/actions/lifecycle';
import { fetchRawActions, updateActions } from '@/lib/supabase/actions';
import { getStartOfTodayInTimezone } from '@/lib/date';

// Mock dependencies
jest.mock('@/lib/supabase/actions', () => ({
  fetchRawActions: jest.fn(),
  updateActions: jest.fn(),
}));

jest.mock('@/lib/time/date.ts', () => ({
  getStartOfTodayInTimezone: jest.fn(),
}));

describe('processActionLifecycle', () => {
  const userId = 'user-123';
  const timezone = 'UTC';
  const startOfToday = 1700000000000;

  beforeEach(() => {
    jest.clearAllMocks();
    (getStartOfTodayInTimezone as jest.Mock).mockReturnValue(startOfToday);
  });

  it('should do nothing if no actions exist', async () => {
    (fetchRawActions as jest.Mock).mockResolvedValue([]);
    
    await processActionLifecycle(userId, timezone);

    expect(fetchRawActions).toHaveBeenCalledWith(userId);
    expect(updateActions).not.toHaveBeenCalled();
  });

  it('should clear old completed items and update DB', async () => {
    const yesterday = new Date(startOfToday - 86400000).toISOString();
    const mockActions = [
      { id: '1', completed: true, completed_at: yesterday, children: [] }, // Should be cleared
      { id: '2', completed: false, children: [] } // Should be kept
    ];

    (fetchRawActions as jest.Mock).mockResolvedValue(mockActions);

    await processActionLifecycle(userId, timezone);

    expect(updateActions).toHaveBeenCalledTimes(1);
    // Expect updateActions to be called with ONLY the kept item
    expect(updateActions).toHaveBeenCalledWith(userId, [
       expect.objectContaining({ id: '2' })
    ]);
  });

  it('should not update DB if nothing to clear', async () => {
     const today = new Date(startOfToday + 3600000).toISOString();
     const mockActions = [
      { id: '1', completed: true, completed_at: today, children: [] }, // Kept (completed today)
      { id: '2', completed: false, children: [] } // Kept
    ];

    (fetchRawActions as jest.Mock).mockResolvedValue(mockActions);

    await processActionLifecycle(userId, timezone);

    expect(updateActions).not.toHaveBeenCalled();
  });
});
