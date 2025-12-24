import {useEffect, useState} from 'react';
import {Habit} from '@/lib/supabase/types';
import {processHabitLifecycle} from '@/lib/logic/habitProcessor';
import {useSimulatedTime} from '@/components/layout/SimulatedTimeProvider';
import {getReferenceDateUI, getTodayISO} from '@/lib/date';
import {updateHabit} from '@/lib/supabase/habit';
import {calculateHabitUpdates} from '@/lib/logic/habitLifecycle';
import {HabitLifecycleEvent} from '@/lib/enums';

/**
 * Hook to manage the Grace Period logic.
 * Runs the lifecycle processor on mount (or time change) and returns habits requiring grace.
 */
export function useGracePeriod(userId: string | undefined, timezone: string) {
    const {simulatedDate} = useSimulatedTime();
    const refDate = getReferenceDateUI(simulatedDate);
    // Use ISO string as stable dependency key
    const refDateKey = getTodayISO(timezone, refDate); 
    
    const [graceHabits, setGraceHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setGraceHabits([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const runLifecycle = async () => {
            setIsLoading(true);
            try {
                const {graceHabits: needed, processedCount} = await processHabitLifecycle(userId, timezone, refDate);
                if (isMounted) {
                    setGraceHabits(needed);
                    if (processedCount > 0) {
                        console.log(`Auto-resolved ${processedCount} habits.`);
                    }
                }
            } catch (error) {
                console.error("Grace period check failed:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        runLifecycle();

        return () => {
            isMounted = false;
        };
        // Depend on refDateKey (string) instead of refDate (object)
    }, [userId, timezone, refDateKey]);

    // Function to manually refresh (e.g., after resolving a grace habit)
    const refresh = async () => {
        if (!userId) return;
        setIsLoading(true);
        const {graceHabits: needed} = await processHabitLifecycle(userId, timezone, refDate);
        setGraceHabits(needed);
        setIsLoading(false);
    };

    /**
     * Resolves a habit as "Incomplete" (Skipped) during Grace Period.
     * Triggers transitions like Lively -> Junked or Yesterday -> Lively (Pile).
     */
    const resolveHabitIncomplete = async (habit: Habit) => {
        if (!userId) return;
        try {
            const todayISO = getTodayISO(timezone, refDate);
            const updates = calculateHabitUpdates(habit, HabitLifecycleEvent.GRACE_INCOMPLETE, todayISO);
            
            // Mark as resolved for today so it doesn't show up again
            updates.last_resolved_date = todayISO as unknown as Date;
            
            await updateHabit(habit.id, updates);
            await refresh(); // Refresh list to remove resolved habit
        } catch (error) {
            console.error(`Failed to resolve habit ${habit.id} as incomplete:`, error);
            throw error; // Let UI handle error
        }
    };

    return {graceHabits, isLoading, refresh, resolveHabitIncomplete};
}