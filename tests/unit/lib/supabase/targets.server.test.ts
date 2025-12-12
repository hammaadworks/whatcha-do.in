import { fetchPublicTargetsServer } from '@/lib/supabase/targets.server';
import { createServerSideClient } from '@/lib/supabase/server';
import { filterTreeByPublicStatus } from '@/lib/logic/actions/processors';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServerSideClient: jest.fn(),
}));

jest.mock('@/lib/logic/actions/processors', () => ({
  filterTreeByPublicStatus: jest.fn(),
}));

describe('Targets Server Supabase', () => {
  const mockSupabase = {
    from: jest.fn(),
  };
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockIs = jest.fn();
  const mockSingle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerSideClient as jest.Mock).mockResolvedValue(mockSupabase);
    mockSupabase.from.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, is: mockIs, single: mockSingle });
    mockIs.mockReturnValue({ single: mockSingle });
  });

  const userId = 'user-123';
  const targetDate = '2023-10-01';
  const mockData = { data: [{ id: '1' }] };

  describe('fetchPublicTargetsServer', () => {
    it('should fetch and filter by public status', async () => {
      mockSingle.mockResolvedValue({ data: mockData, error: null });
      (filterTreeByPublicStatus as jest.Mock).mockReturnValue({ actions: [], privateCount: 0 });

      await fetchPublicTargetsServer(userId, targetDate);

      expect(mockSupabase.from).toHaveBeenCalledWith('targets');
      expect(filterTreeByPublicStatus).toHaveBeenCalledWith([{ id: '1' }]);
    });

    it('should return empty on 404', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
        const result = await fetchPublicTargetsServer(userId, targetDate);
        expect(result).toEqual({ targets: [], privateCount: 0 });
    });
  });
});
