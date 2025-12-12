import { fetchActions, fetchRawActions, fetchPublicActions, updateActions } from '@/lib/supabase/actions';
import { createClient } from '@/lib/supabase/client';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/logic/actions/processors';
import { ActionNode } from '@/lib/supabase/types';

jest.mock('@/lib/supabase/client');
jest.mock('@/lib/logic/actions/processors');

describe('Supabase Actions Client', () => {
  const mockSupabase = {
    from: jest.fn(),
  };
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpsert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockUpsert.mockReturnValue({ error: null });

    // Default processor mocks
    (applyNextDayClearing as jest.Mock).mockImplementation((tree) => tree);
    (filterTreeByPublicStatus as jest.Mock).mockImplementation((tree) => ({ actions: tree, privateCount: 0 }));
  });

  const userId = 'user-123';
  const mockTree: ActionNode[] = [
    { id: '1', description: 'Task 1', completed: false, children: [] }
  ];

  describe('fetchActions', () => {
    test('should fetch data and apply next day clearing', async () => {
      mockSingle.mockResolvedValue({ data: { data: mockTree }, error: null });

      const result = await fetchActions(userId, 'UTC');

      expect(mockSupabase.from).toHaveBeenCalledWith('actions');
      expect(mockSelect).toHaveBeenCalledWith('data');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(mockSingle).toHaveBeenCalled();
      
      expect(applyNextDayClearing).toHaveBeenCalledWith(mockTree, 'UTC');
      expect(result).toEqual(mockTree);
    });

    test('should return empty array on PGRST116 (no rows)', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const result = await fetchActions(userId);

      expect(result).toEqual([]);
      expect(applyNextDayClearing).toHaveBeenCalledWith([], 'UTC');
    });

    test('should throw on other errors', async () => {
      const error = { code: 'OTHER', message: 'Fail' };
      mockSingle.mockResolvedValue({ data: null, error });

      // Suppress console error for test
      const originalError = console.error;
      console.error = jest.fn();

      await expect(fetchActions(userId)).rejects.toEqual(error);

      console.error = originalError;
    });
  });

  describe('fetchRawActions', () => {
    test('should fetch data without processing', async () => {
      mockSingle.mockResolvedValue({ data: { data: mockTree }, error: null });

      const result = await fetchRawActions(userId);

      expect(result).toEqual(mockTree);
      expect(applyNextDayClearing).not.toHaveBeenCalled(); // Important distinction
    });
  });

  describe('fetchPublicActions', () => {
    test('should fetch data and filter by public status', async () => {
      mockSingle.mockResolvedValue({ data: { data: mockTree }, error: null });

      const result = await fetchPublicActions(userId);

      expect(filterTreeByPublicStatus).toHaveBeenCalledWith(mockTree);
      expect(result).toEqual({ actions: mockTree, privateCount: 0 });
    });
  });

  describe('updateActions', () => {
    test('should upsert data', async () => {
      await updateActions(userId, mockTree);

      expect(mockSupabase.from).toHaveBeenCalledWith('actions');
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: userId,
        data: mockTree
      }, { onConflict: 'user_id' });
    });

    test('should throw on upsert error', async () => {
      const error = { message: 'Upsert failed' };
      mockUpsert.mockResolvedValue({ error });

      await expect(updateActions(userId, mockTree)).rejects.toEqual(error);
    });
  });
});
