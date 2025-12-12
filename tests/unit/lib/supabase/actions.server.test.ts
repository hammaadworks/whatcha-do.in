import { fetchActionsServer, fetchRawActionsServer, fetchPublicActionsServer, updateActionsServer } from '@/lib/supabase/actions.server';
import { createServerSideClient } from '@/lib/supabase/server';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/logic/actions/processors';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServerSideClient: jest.fn(),
}));

jest.mock('@/lib/logic/actions/processors', () => ({
  applyNextDayClearing: jest.fn(),
  filterTreeByPublicStatus: jest.fn(),
}));

describe('Actions Server', () => {
  const mockSupabase = {
    from: jest.fn(),
  };
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpsert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerSideClient as jest.Mock).mockResolvedValue(mockSupabase);
    mockSupabase.from.mockReturnValue({ select: mockSelect, upsert: mockUpsert });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockUpsert.mockReturnValue({ error: null }); // Default success for upsert
  });

  const userId = 'user-123';
  // mockData represents the Row returned by Supabase. 
  // The table has a column 'data' which contains the JSON tree.
  const mockData = { data: [{ id: '1' }] };

  describe('fetchActionsServer', () => {
    it('should fetch and apply clearing', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });
      (applyNextDayClearing as jest.Mock).mockReturnValue([{ id: '1' }]);

      const result = await fetchActionsServer(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('actions');
      expect(mockSelect).toHaveBeenCalledWith('data');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(applyNextDayClearing).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1' }]);
    });

    it('should return empty array on 404', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const result = await fetchActionsServer(userId);
      expect(result).toEqual([]);
    });
  });

  describe('fetchRawActionsServer', () => {
    it('should fetch raw data without clearing', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });

      const result = await fetchRawActionsServer(userId);

      expect(applyNextDayClearing).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('fetchPublicActionsServer', () => {
    it('should fetch and filter by public status', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });
      (filterTreeByPublicStatus as jest.Mock).mockReturnValue({ actions: [], privateCount: 0 });

      await fetchPublicActionsServer(userId);

      expect(filterTreeByPublicStatus).toHaveBeenCalled();
    });
  });

  describe('updateActionsServer', () => {
    it('should upsert data', async () => {
      await updateActionsServer(userId, []);
      expect(mockSupabase.from).toHaveBeenCalledWith('actions');
      expect(mockUpsert).toHaveBeenCalledWith({ user_id: userId, data: [] }, { onConflict: 'user_id' });
    });
  });
});
