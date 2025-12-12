import { fetchTargets, fetchRawTargets, fetchPublicTargets, updateTargets } from '@/lib/supabase/targets';
import { createClient } from '@/lib/supabase/client';
import { filterTreeByPublicStatus } from '@/lib/logic/actions/processors';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/logic/actions/processors', () => ({
  filterTreeByPublicStatus: jest.fn(),
}));

describe('Targets Supabase', () => {
  const mockSupabase = {
    from: jest.fn(),
  };
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockIs = jest.fn();
  const mockSingle = jest.fn();
  const mockUpsert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.from.mockReturnValue({ select: mockSelect, upsert: mockUpsert });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, is: mockIs, single: mockSingle });
    mockIs.mockReturnValue({ single: mockSingle });
    mockUpsert.mockReturnValue({ error: null }); 
  });

  const userId = 'user-123';
  const targetDate = '2023-10-01';
  // mockData represents the Row returned by Supabase. 
  const mockData = { data: [{ id: '1' }] }; 

  describe('fetchTargets', () => {
    it('should fetch targets for date', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });

      const result = await fetchTargets(userId, targetDate);

      expect(mockSupabase.from).toHaveBeenCalledWith('targets');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(mockEq).toHaveBeenCalledWith('target_date', targetDate);
      expect(result).toEqual([{ id: '1' }]);
    });

    it('should fetch future targets (null date)', async () => {
        mockSingle.mockResolvedValue({ data: mockData, error: null });
  
        const result = await fetchTargets(userId, null);
  
        expect(mockEq).toHaveBeenCalledWith('user_id', userId);
        expect(mockIs).toHaveBeenCalledWith('target_date', null);
        expect(result).toEqual([{ id: '1' }]);
      });

    it('should return empty array on 404', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const result = await fetchTargets(userId, targetDate);
      expect(result).toEqual([]);
    });
  });

  describe('fetchRawTargets', () => {
    it('should be an alias for fetchTargets', async () => {
        mockSingle.mockResolvedValue({ data: mockData, error: null });
        const result = await fetchRawTargets(userId, targetDate);
        expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('fetchPublicTargets', () => {
    it('should fetch and filter by public status', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });
      (filterTreeByPublicStatus as jest.Mock).mockReturnValue({ actions: [], privateCount: 0 });

      await fetchPublicTargets(userId, targetDate);

      expect(filterTreeByPublicStatus).toHaveBeenCalledWith([{ id: '1' }]);
    });
  });

  describe('updateTargets', () => {
    it('should upsert data', async () => {
      await updateTargets(userId, targetDate, []);
      expect(mockSupabase.from).toHaveBeenCalledWith('targets');
      expect(mockUpsert).toHaveBeenCalledWith(
          { user_id: userId, target_date: targetDate, data: [] }, 
          { onConflict: 'user_id, target_date' }
      );
    });
  });
});
