import {
    completeHabit,
    createHabit,
    deleteHabit,
    fetchOwnerHabits,
    unmarkHabit,
    updateHabit
} from '@/lib/supabase/habit';
import {createClient} from '@/lib/supabase/client';
import {JournalActivityService} from '@/lib/logic/JournalActivityService';
import {HabitState} from '@/lib/enums';

jest.mock('@/lib/supabase/client');
jest.mock('@/lib/logic/JournalActivityService');

describe('Supabase Habit Client', () => {
    const mockSupabase = {
        from: jest.fn(),
    };
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockOrder = jest.fn();
    const mockLimit = jest.fn();

    const mockJournalService = {
        logActivity: jest.fn(), removeActivity: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (JournalActivityService as unknown as jest.Mock).mockImplementation(() => mockJournalService);

        mockSupabase.from.mockReturnValue({
            select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete,
        });
        mockSelect.mockReturnValue({eq: mockEq, order: mockOrder});
        mockInsert.mockReturnValue({select: jest.fn().mockReturnValue({single: mockSingle})});
        mockUpdate.mockReturnValue({eq: mockEq, select: jest.fn().mockReturnValue({single: mockSingle})});
        mockDelete.mockReturnValue({eq: mockEq});
        mockEq.mockReturnValue({
            single: mockSingle,
            select: jest.fn().mockReturnValue({single: mockSingle}),
            eq: mockEq,
            delete: mockDelete
        }); // For chained calls
        mockSingle.mockResolvedValue({data: {}, error: null});

        // Handle chained queries like .order().limit().single()
        mockOrder.mockReturnValue({limit: mockLimit});
        mockLimit.mockReturnValue({single: mockSingle});

    });

    const mockHabitId = 'habit-123';
    const mockUserId = 'user-123';
    const mockCompletionId = 'completion-123';

    describe('createHabit', () => {
        test('should insert a new habit', async () => {
            const newHabit = {name: 'New Habit', user_id: mockUserId};
            mockSingle.mockResolvedValue({data: {id: mockHabitId, ...newHabit}, error: null});

            const result = await createHabit(newHabit);

            expect(mockSupabase.from).toHaveBeenCalledWith('habits');
            expect(mockInsert).toHaveBeenCalledWith([newHabit]);
            expect(result.data).toEqual({id: mockHabitId, ...newHabit});
        });
    });

    describe('completeHabit', () => {
        test('should complete a habit and log activity', async () => {
            const completionsData = {mood: 80};
            const date = new Date();
            const mockHabit = {
                id: mockHabitId,
                user_id: mockUserId,
                current_streak: 2,
                habit_state: HabitState.LIVELY,
                name: 'Habit Name',
                is_public: true,
                goal_value: 10
            };

            // Mock fetch habit
            mockSupabase.from.mockImplementationOnce(() => ({select: mockSelect}));
            mockSelect.mockReturnValueOnce({eq: mockEq});
            mockEq.mockReturnValueOnce({single: mockSingle});
            mockSingle.mockResolvedValueOnce({data: mockHabit, error: null}); // fetch

            // Mock insert completion
            mockSupabase.from.mockImplementationOnce(() => ({insert: mockInsert}));
            mockInsert.mockReturnValueOnce({select: jest.fn().mockReturnValue({single: mockSingle})});
            mockSingle.mockResolvedValueOnce({data: {id: mockCompletionId}, error: null}); // insert

            // Mock update habit
            mockSupabase.from.mockImplementationOnce(() => ({update: mockUpdate}));
            mockUpdate.mockReturnValueOnce({eq: mockEq});
            mockEq.mockReturnValueOnce(Promise.resolve({error: null})); // update

            await completeHabit(mockHabitId, completionsData, date);

            expect(mockSupabase.from).toHaveBeenCalledWith('habits');
            expect(mockJournalService.logActivity).toHaveBeenCalledWith(mockUserId, date, expect.objectContaining({
                id: mockCompletionId, type: 'habit', description: mockHabit.name
            }));
        });
    });

    describe('fetchOwnerHabits', () => {
        test('should fetch all habits for owner', async () => {
            const habits = [{id: '1'}, {id: '2'}];
            // Redefine mocks for simple select
            mockSupabase.from.mockReturnValue({select: mockSelect});
            mockSelect.mockReturnValue({eq: mockEq});
            mockEq.mockResolvedValue({data: habits, error: null});

            const result = await fetchOwnerHabits(mockUserId);
            expect(result).toEqual(habits);
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
        });
    });

    describe('updateHabit', () => {
        test('should update habit fields', async () => {
            const updates = {name: 'Updated Name'};
            mockSingle.mockResolvedValue({data: {id: mockHabitId, ...updates}, error: null});

            // Ensure mocks are set up for update().eq().select().single()
            mockSupabase.from.mockReturnValue({update: mockUpdate});
            mockUpdate.mockReturnValue({eq: mockEq});
            mockEq.mockReturnValue({select: jest.fn().mockReturnValue({single: mockSingle})});


            const result = await updateHabit(mockHabitId, updates);
            expect(result.name).toBe('Updated Name');
            expect(mockUpdate).toHaveBeenCalledWith(updates);
        });
    });

    describe('deleteHabit', () => {
        test('should delete habit', async () => {
            // Setup mock for delete().eq()
            mockSupabase.from.mockReturnValue({delete: mockDelete});
            mockDelete.mockReturnValue({eq: mockEq});
            mockEq.mockResolvedValue({error: null});

            await deleteHabit(mockHabitId);
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', mockHabitId);
        });
    });

    describe('unmarkHabit', () => {
        test('should unmark habit and delete today\'s completion', async () => {
            const now = new Date();
            const mockHabit = {
                id: mockHabitId,
                user_id: mockUserId,
                streak: 5,
                longest_streak: 5,
                last_non_today_streak: 4,
                habit_state: HabitState.TODAY,
                last_non_today_state: HabitState.YESTERDAY,
                is_public: true,
                last_completed_date: now.toISOString()
            };
            const mockCompletion = {
                id: mockCompletionId, habit_id: mockHabitId, completed_at: now.toISOString() // Same day
            };

            // 1. Fetch Habit
            mockSupabase.from.mockImplementationOnce(() => ({select: mockSelect}));
            mockSelect.mockReturnValueOnce({eq: mockEq});
            mockEq.mockReturnValueOnce({single: mockSingle});
            mockSingle.mockResolvedValueOnce({data: mockHabit, error: null});

            // 2. Update Habit
            mockSupabase.from.mockImplementationOnce(() => ({update: mockUpdate}));
            mockUpdate.mockReturnValueOnce({eq: mockEq});
            mockEq.mockResolvedValueOnce({error: null});

            await unmarkHabit(mockHabitId, now);

            // Verify update was called with decremented streak
            expect(mockUpdate).toHaveBeenCalledWith({
                streak: 4, // 5 - 1
                longest_streak: 5, // max(4, 5)
                habit_state: HabitState.YESTERDAY,
                last_completed_date: null
            });
        });
    });
});
