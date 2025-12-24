'use client';

import {Habit, ISODate} from "@/lib/supabase/types";
import {HabitLifecycleEvent, HabitState} from "@/lib/enums";
import {calculateHabitUpdates} from "@/lib/logic/habitLifecycle";
import {addDays, daysSince, diffInDays, getTodayISO} from "@/lib/date";
import {fetchOwnerHabits, updateHabit} from "@/lib/supabase/habit";

/**
 * Result of the lifecycle processing.
 */
export interface LifecycleResult {
    graceHabits: Habit[];
    processedCount: number;
}

/**
 * Processes the lifecycle for all habits of a user.
 * - Auto-resolves habits that don't need user input (e.g. Day Rollover, AutoJunk).
 * - Identifies habits eligible for Grace Period.
 *
 * @param userId The user's ID.
 * @param timezone The user's timezone.
 * @param refDate The reference date (simulated or real now).
 */
export async function processHabitLifecycle(userId: string, timezone: string, refDate: Date): Promise<LifecycleResult> {
    const todayISO = getTodayISO(timezone, refDate);
    const habits = await fetchOwnerHabits(userId);

    const graceHabits: Habit[] = [];
    let processedCount = 0;

    for (const habit of habits) {
        console.log(`[HabitProcessor] checking habit: ${habit.name} (${habit.id})`, {
            state: habit.habit_state,
            last_completed: habit.last_completed_date,
            last_resolved: habit.last_resolved_date,
            today: todayISO,
        });

        // System Guard: Check if already resolved for today
        const lastResolvedISO = habit.last_resolved_date ? ((habit.last_resolved_date as unknown as string).slice(0, 10) as ISODate) : null;

        if (lastResolvedISO === todayISO) {
            console.log(`[HabitProcessor] Skipping ${habit.name} - Already resolved for today.`);
            continue;
        }

        // 1. Determine Start Date for Simulation
        // If last_resolved exists, start from next day.
        // If NEW habit (last_resolved null), start from created_at + 1 day.
        // (A habit created TODAY should not roll over TODAY).
        const createdISO = habit.created_at ? ((habit.created_at as unknown as string).slice(0, 10) as ISODate) : todayISO;

        const startDateISO = lastResolvedISO ? addDays(lastResolvedISO, 1) : addDays(createdISO, 1);

        let currentSimDate = startDateISO;
        let runningHabitState = {...habit};
        let changesMade = false;

        console.log(`[HabitProcessor] Simulating history for ${habit.name}`, {
            startSim: startDateISO, today: todayISO, diff: diffInDays(todayISO, currentSimDate),
        });

        // 2. Run Rollover Loop (Time Travel)
        // We catch up from startDate until TODAY (inclusive).
        // If I open app on T+1, I need to process T+1's rollover (TODAY -> YESTERDAY).
        while (diffInDays(todayISO, currentSimDate) >= 0) {
            // debugger; // <--- Uncomment this line to pause execution in Chrome DevTools!
            try {
                // Pass currentSimDate as the "today" for the transition context
                const updates = calculateHabitUpdates(runningHabitState, HabitLifecycleEvent.DAY_ROLLOVER, currentSimDate);

                // If updates are empty, it means no transition (e.g. Junked -> Junked)
                // But calculateHabitUpdates usually returns something or empty object.
                // We strictly apply changes.
                if (Object.keys(updates).length > 0) {
                    console.log(`[HabitProcessor] Rolling over for date: ${currentSimDate} | State: ${runningHabitState.habit_state} ->`, updates);
                    runningHabitState = {...runningHabitState, ...updates};
                    changesMade = true;
                }
            } catch (e) {
                console.warn(`[HabitProcessor] Rollover failed for ${currentSimDate}`, e);
            }

            // Move to next day
            currentSimDate = addDays(currentSimDate, 1);
        }

        // 3. Check Grace Eligibility & Final Resolution (On Updated State)
        const lastCompletedISO = runningHabitState.last_completed_date ? ((runningHabitState.last_completed_date as unknown as string).slice(0, 10) as ISODate) : null;
        const daysGap = daysSince(lastCompletedISO, todayISO);
        let needsGrace = false;

        // Condition A (Yesterday Grace): Yesterday state, missed yesterday (gap=1)
        if (runningHabitState.habit_state === HabitState.YESTERDAY && daysGap === 1) {
            console.log(`[HabitProcessor] Grace Candidate (Condition A): ${habit.name}`);
            needsGrace = true;
        }
        // Condition B (Lively Grace): Lively state, missed yesterday (gap=1)
        else if (runningHabitState.habit_state === HabitState.LIVELY && daysGap === 1) {
            console.log(`[HabitProcessor] Grace Candidate (Condition B): ${habit.name}`);
            needsGrace = true;
        } else {
            console.log(`[HabitProcessor] No Grace for ${habit.name}. State: ${runningHabitState.habit_state}, Gap: ${daysGap}`);

            // Extra Check: DAILY_RESOLUTION Decay for Junked
            // If we are JUNKED and NOT Grace, we might need to apply decay?
            // calculateHabitUpdates(DAILY_RESOLUTION) handles this.
            // But we usually do this inside the loop?
            // Doc says "On each DAILY_RESOLUTION... streak -= 1".
            // We haven't run DAILY_RESOLUTION in the loop, only DAY_ROLLOVER.
            // We should check it now for 'today'.
            try {
                const resUpdates = calculateHabitUpdates(runningHabitState, HabitLifecycleEvent.DAILY_RESOLUTION, todayISO);
                if (Object.keys(resUpdates).length > 0) {
                    console.log(`[HabitProcessor] Daily Resolution Update:`, resUpdates);
                    runningHabitState = {...runningHabitState, ...resUpdates};
                    changesMade = true;
                }
            } catch (e) {
                // ignore
            }
        }

        if (needsGrace) {
            graceHabits.push(runningHabitState); // Push the UPDATED state

            // If we have state changes (Rollover happened), we MUST save them.
            // But if we save, we must also update last_resolved_date?
            // If we update last_resolved_date, we won't detect grace next refresh.
            // DECISION: We update the state, but we DO NOT update last_resolved_date to today.
            // We set it to yesterday (or keep it as is if it was yesterday)?
            // Actually, if we update the DB with new State, the next fetch will see New State.
            // If we leave last_resolved_date as OLD, the processor runs again.
            // Loop: Start = Old + 1.
            // It runs rollover AGAIN.
            // YESTERDAY -> LIVELY.
            // This is BAD. Double Rollover.

            // We MUST update last_resolved_date if we update state.
            // So how does the UI know to show Grace?
            // The UI must detect Grace from the STATE (Yesterday + Gap 1), not from this list.
            // OR this list is used for the "Modal".
            // Since we are "Processing", we should return the list.

            // We Will commit the changes AND mark resolved.
            // The UI is responsible for looking at the Habit and seeing it matches Grace Conditions.
            // (Assuming UI logic mirrors Conditions A/B).
        }

        // Commit if changes made OR if we need to mark resolved
        if (changesMade || lastResolvedISO !== todayISO) {
            const finalUpdates: Partial<Habit> = {
                last_resolved_date: todayISO as unknown as Date,
            };

            // Only include state/streak updates if actual changes occurred during simulation
            if (changesMade) {
                finalUpdates.habit_state = runningHabitState.habit_state;
                finalUpdates.streak = runningHabitState.streak;
                finalUpdates.junked_at = runningHabitState.junked_at;
            }

            console.log(`[HabitProcessor] Committing updates for ${habit.name}:`, finalUpdates);
            await updateHabit(habit.id, finalUpdates);
            processedCount++;
        }
    }

    return {graceHabits, processedCount};
}
