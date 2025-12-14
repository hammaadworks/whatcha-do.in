import { fetchOwnerHabitsServer, fetchPublicHabitsServer } from '@/lib/supabase/habit.server';
import { createServerSideClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Supabase Habit Server Client', () => {
    const mockSupabase = {
        from: jest.fn(),
    };
    const mockSelect = jest.fn();
    const mockEq = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (createServerSideClient as jest.Mock).mockResolvedValue(mockSupabase);

        mockSupabase.from.mockReturnValue({
            select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ eq: mockEq }); // For chained calls
    });

    const userId = 'user-123';
    const mockHabits = [{ id: '1', name: 'Habit 1' }];

    describe('fetchOwnerHabitsServer', () => {
        test('should fetch all habits for owner', async () => {
            mockEq.mockResolvedValue({ data: mockHabits, error: null });

            const result = await fetchOwnerHabitsServer(userId);

            expect(createServerSideClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('habits');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('user_id', userId);
            expect(result).toEqual(mockHabits);
        });

        test('should throw on error', async () => {
             const mockError = { message: 'DB Error' };
             mockEq.mockResolvedValue({ data: null, error: mockError });
             
             // Suppress console error
             const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

             await expect(fetchOwnerHabitsServer(userId)).rejects.toEqual(mockError);
             
             consoleSpy.mockRestore();
        });
    });

    describe('fetchPublicHabitsServer', () => {
        test('should fetch only public habits', async () => {
            // Setup mocking for the chain: .eq('user_id', ...).eq('is_public', ...)
            // We need `mockEq` to return itself or a promise depending on the call.
            // But strict mocking is safer.
            
            // First call: eq('user_id', userId) -> returns object with eq method
            // Second call: eq('is_public', true) -> returns promise with data
            
            // Re-setup mock for this specific chain structure
            const mockEq2 = jest.fn();
            mockEq.mockReturnValue({ eq: mockEq2 }); 
            mockEq2.mockResolvedValue({ data: mockHabits, error: null });

            const result = await fetchPublicHabitsServer(userId);

            expect(mockSupabase.from).toHaveBeenCalledWith('habits');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('user_id', userId);
            expect(mockEq2).toHaveBeenCalledWith('is_public', true);
            expect(result).toEqual(mockHabits);
        });
    });
});
