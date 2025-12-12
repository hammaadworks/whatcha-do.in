import { renderHook, act, waitFor } from '@testing-library/react';
import { useTargets } from '@/hooks/useTargets';
import * as SupabaseTargets from '@/lib/supabase/targets';
import { getMonthStartDate } from '@/lib/date';

// Mock dependencies
jest.mock('@/lib/supabase/targets', () => ({
  fetchTargets: jest.fn(),
  fetchRawTargets: jest.fn(), // Add fetchRawTargets mock
  updateTargets: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, loading: false }),
}));

jest.mock('@/components/providers/SystemTimeProvider', () => ({
  useSystemTime: () => ({ simulatedDate: null }), // Default to real time
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: () => 'mock-id',
}));

describe('useTargets Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SupabaseTargets.fetchTargets as jest.Mock).mockResolvedValue([]);
    (SupabaseTargets.fetchRawTargets as jest.Mock).mockResolvedValue([]); // Mock return for fetchRawTargets
  });

  test('should fetch targets for correct buckets', async () => {
    const { result } = renderHook(() => useTargets(true, 'UTC'));
    
    // Wait for initial load to prevent act warnings and ensure data is fetched
    await waitFor(() => {
        expect(SupabaseTargets.fetchTargets).toHaveBeenCalledTimes(4);
    });
    
    // Check arguments
    const calls = (SupabaseTargets.fetchTargets as jest.Mock).mock.calls;
    
    // Future bucket (targetDate is null)
    expect(calls).toEqual(expect.arrayContaining([['test-user', null]]));
    
    // Current bucket
    const currentBucketDate = getMonthStartDate(0, 'UTC');
    expect(calls).toEqual(expect.arrayContaining([['test-user', currentBucketDate]]));
  });

  test('should add target to "future" bucket', async () => {
    const { result } = renderHook(() => useTargets(true, 'UTC'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTarget('future', 'New Goal');
    });

    // Expecting optimistic update to reflect immediately
    expect(result.current.buckets.future).toHaveLength(1);
    expect(result.current.buckets.future[0].description).toBe('New Goal');
    
    // Check update was called with null date context
    expect(SupabaseTargets.updateTargets).toHaveBeenCalledWith('test-user', null, expect.any(Array));
  });

  test('should add target to "current" bucket', async () => {
    const { result } = renderHook(() => useTargets(true, 'UTC'));
    const currentBucketDate = getMonthStartDate(0, 'UTC');

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTarget('current', 'This Month Goal');
    });

    expect(result.current.buckets.current).toHaveLength(1);
    
    // Check update was called with current date context
    expect(SupabaseTargets.updateTargets).toHaveBeenCalledWith('test-user', currentBucketDate, expect.any(Array));
  });
});

