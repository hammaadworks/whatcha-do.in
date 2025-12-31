import { processActionLifecycle } from '@/lib/logic/actions/lifecycle';
import { fetchRawActions, updateActions } from '@/lib/supabase/actions';
import { getTodayISO } from '@/lib/date';

// Mock dependencies
jest.mock('@/lib/supabase/actions', () => ({
  fetchRawActions: jest.fn(),
  updateActions: jest.fn(),
}));

jest.mock('@/lib/date', () => ({
  getTodayISO: jest.fn(),
}));

describe('processActionLifecycle', () => {
  const userId = 'user-123';
  const timezone = 'UTC';
  const todayISO = '2023-11-15'; // "Today"

  beforeEach(() => {
    jest.clearAllMocks();
    // Default behavior for getTodayISO(timezone) -> returns "Today"
    (getTodayISO as jest.Mock).mockImplementation((tz, date) => {
        if (!date) return todayISO;
        // If a date is provided, simulate conversion to YYYY-MM-DD
        // For testing purposes, we assume the input Date aligns with the string we expect
        return date.toISOString().slice(0, 10);
    });
  });

  it('should do nothing if no actions exist', async () => {
    (fetchRawActions as jest.Mock).mockResolvedValue([]);
    
    await processActionLifecycle(userId, timezone);

    expect(fetchRawActions).toHaveBeenCalledWith(userId);
    expect(updateActions).not.toHaveBeenCalled();
  });

  it('should clear old completed items and update DB', async () => {
    const yesterdayISO = '2023-11-14';
    // Create a timestamp that will resolve to '2023-11-14' when slice(0,10) is called
    const yesterdayTimestamp = new Date(yesterdayISO + 'T12:00:00Z').toISOString();
    
    const mockActions = [
      { id: '1', completed: true, completed_at: yesterdayTimestamp, children: [] }, // Should be cleared (2023-11-14 < 2023-11-15)
      { id: '2', completed: false, children: [] } // Should be kept
    ];

    (fetchRawActions as jest.Mock).mockResolvedValue(mockActions);

    const currentDate = new Date(todayISO + 'T12:00:00Z');
    await processActionLifecycle(userId, timezone, currentDate);

    expect(updateActions).toHaveBeenCalledTimes(1);
    // Expect updateActions to be called with ONLY the kept item
    expect(updateActions).toHaveBeenCalledWith(userId, [
       expect.objectContaining({ id: '2' })
    ]);
  });

  it('should not update DB if nothing to clear', async () => {
     // Create a timestamp that resolves to '2023-11-15'
     const todayTimestamp = new Date(todayISO + 'T10:00:00Z').toISOString(); 
     const mockActions = [
      { id: '1', completed: true, completed_at: todayTimestamp, children: [] }, // Kept (completed today)
      { id: '2', completed: false, children: [] } // Kept
    ];

    (fetchRawActions as jest.Mock).mockResolvedValue(mockActions);

    const currentDate = new Date(todayISO + 'T12:00:00Z');
    await processActionLifecycle(userId, timezone, currentDate);

    expect(updateActions).not.toHaveBeenCalled();
  });

  it('should use provided referenceDate for "today" calculation', async () => {
      // Simulate time travel to future
      const futureDate = new Date('2023-12-01T10:00:00Z');
      const futureISO = '2023-12-01';

      // Item completed on 'todayISO' (11-15), which is in the past relative to futureDate (12-01)
      const completedOnOldToday = new Date(todayISO + 'T10:00:00Z').toISOString();

      const mockActions = [
          { id: '1', completed: true, completed_at: completedOnOldToday, children: [] }
      ];

      (fetchRawActions as jest.Mock).mockResolvedValue(mockActions);

      await processActionLifecycle(userId, timezone, futureDate);

      // getTodayISO should have been called with the future date
      expect(getTodayISO).toHaveBeenCalledWith(timezone, futureDate);

      // Should have cleared the item because 11-15 < 12-01
      expect(updateActions).toHaveBeenCalledWith(userId, []);
  });
});
