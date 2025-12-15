import {toast} from 'sonner';
import {completeHabit, deleteHabit, updateHabit} from '@/lib/supabase/habit';
import {CompletionsData} from '@/components/habits/HabitCompletionsModal';
import {Habit} from '@/lib/supabase/types';
import {useSystemTime} from '@/components/providers/SystemTimeProvider';

interface UseHabitActionsProps {
    onActivityLogged?: () => void;
    setOptimisticHabits?: (habits: Habit[] | null) => void;
    habits: Habit[];
}

/**
 * Custom hook to handle Habit CRUD operations (Update, Delete, Create, Complete).
 * Encapsulates the Supabase calls and Toast notifications.
 *
 * @param props - Configuration props including callbacks for activity logging and state updates.
 * @returns Object containing handler functions for habit actions.
 */
export const useHabitActions = ({onActivityLogged, setOptimisticHabits, habits}: UseHabitActionsProps) => {
    const {simulatedDate} = useSystemTime();

    /**
     * Updates an existing habit's details.
     */
    const handleHabitUpdate = async (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => {
        try {
            await updateHabit(habitId, {name, is_public: isPublic, goal_value: goalValue, goal_unit: goalUnit});
            toast.success('Habit updated');
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to update habit:', error);
            toast.error('Failed to update habit');
        }
    };

    /**
     * Deletes a habit and updates the local optimistic state.
     */
    const handleHabitDelete = async (habitId: string) => {
        try {
            await deleteHabit(habitId);
            toast.success('Habit deleted');
            // Remove locally for UI responsiveness
            if (setOptimisticHabits) {
                setOptimisticHabits(habits.filter(h => h.id !== habitId));
            }
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to delete habit:', error);
            toast.error('Failed to delete habit');
        }
    };

    /**
     * Handles post-creation logic for habits (closing modal, logging).
     */
    const handleCreateHabit = (setIsCreateHabitModalOpen: (open: boolean) => void) => {
        setIsCreateHabitModalOpen(false);
        toast.success('Habit created!');
        onActivityLogged?.();
    };

    /**
     * Marks a habit as complete for the simulated date.
     */
    const handleHabitComplete = async (habitId: string, data: CompletionsData) => {
        try {
            await completeHabit(habitId, data, simulatedDate || new Date());
            toast.success('Habit completed! 🔥');
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to complete habit:', error);
            toast.error('Failed to complete habit');
        }
    };

    return {
        handleHabitUpdate,
        handleHabitDelete,
        handleCreateHabit,
        handleHabitComplete
    };
};
