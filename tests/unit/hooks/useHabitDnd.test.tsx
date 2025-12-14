import { renderHook, act } from '@testing-library/react';
import { useHabitDnd } from '@/hooks/useHabitDnd';
import { updateHabit, unmarkHabit } from '@/lib/supabase/habit';
import { toast } from 'sonner';
import { Habit } from '@/lib/supabase/types';

jest.mock('@/lib/supabase/habit');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('@dnd-kit/core', () => ({
  useSensor: jest.fn(),
  useSensors: jest.fn().mockReturnValue('mock-sensors'),
  PointerSensor: jest.fn(),
  TouchSensor: jest.fn(),
}));

describe('useHabitDnd', () => {
    const mockHabits: Habit[] = [
        { id: '1', name: 'Habit 1', pile_state: 'pile' } as Habit,
        { id: '2', name: 'Habit 2', pile_state: 'today' } as Habit,
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.confirm
        Object.defineProperty(window, 'confirm', {
            writable: true,
            value: jest.fn().mockReturnValue(true),
        });
    });

    it('should initialize correctly', () => {
        const { result } = renderHook(() => useHabitDnd({ habits: mockHabits }));
        expect(result.current.activeId).toBeNull();
        expect(result.current.optimisticHabits).toBeNull();
    });

    it('should handle drag start', () => {
        const { result } = renderHook(() => useHabitDnd({ habits: mockHabits }));
        
        act(() => {
            result.current.handleDragStart({ active: { id: '1' } } as any);
        });

        expect(result.current.activeId).toBe('1');
        expect(result.current.activeHabit).toEqual(mockHabits[0]);
    });

    it('should handle standard move (pile -> today)', async () => {
        const onMoved = jest.fn();
        const { result } = renderHook(() => useHabitDnd({ habits: mockHabits, onHabitMoved: onMoved }));

        await act(async () => {
            await result.current.handleDragEnd({
                active: { id: '1' },
                over: { id: 'today' },
            } as any);
        });

        expect(updateHabit).toHaveBeenCalledWith('1', { pile_state: 'today' });
        expect(onMoved).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });

    it('should handle unmark move (today -> pile) with confirmation', async () => {
         const { result } = renderHook(() => useHabitDnd({ habits: mockHabits }));

         await act(async () => {
             await result.current.handleDragEnd({
                 active: { id: '2' }, // is today
                 over: { id: 'pile' },
             } as any);
         });
         
         expect(window.confirm).toHaveBeenCalled();
         expect(unmarkHabit).toHaveBeenCalledWith('2', 'pile');
    });

    it('should handle unmark move cancellation', async () => {
        (window.confirm as jest.Mock).mockReturnValue(false);
         const { result } = renderHook(() => useHabitDnd({ habits: mockHabits }));

         await act(async () => {
             await result.current.handleDragEnd({
                 active: { id: '2' }, // is today
                 over: { id: 'pile' },
             } as any);
         });

         expect(unmarkHabit).not.toHaveBeenCalled();
         expect(result.current.optimisticHabits).toBeNull(); // Reverted
    });
});
