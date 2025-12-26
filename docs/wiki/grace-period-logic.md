# Grace Period & End of Day Summary Logic

The "Grace Period" is a core UX pillar of *whatcha-do.in*. It is an empathetic system designed for the "Ambitious Underachiever" who often logs their activity the next morning. Instead of punishing them with broken streaks immediately at midnight, we offer a "Grace Period" window.

## Core Concept

When a user opens the app on a "New Day" (defined by their local timezone), the system checks if they have unfinished business from the **immediately preceding day**.

If yes, they are intercepted by the **End of Day Summary** screen.

## 1. Triggers

The Grace Period screen is triggered **Client-Side** on app load/focus via the `useGracePeriod` hook (implemented in `hooks/useGracePeriod.ts`).

1.  **Timezone Check:** Handled by `processHabitLifecycle`.
2.  **Data Check:**
    *   **Habits:** Specifically habits in `YESTERDAY` or `LIVELY` state that were not completed yesterday but are eligible for grace (gap = 1 day).
    *   **Actions:** (Future Implementation) Actions cleared overnight.

## 2. The Summary Screen UI

This is a dedicated, focused modal/overlay (`components/grace-period/GracePeriodScreen.tsx`) that blocks the main dashboard until resolved.

### Content
*   **"Unfinished Habits":** Prompts specifically for habits eligible for grace either Yesterday or Lively.
    *   *Action:* User can tap to mark them as "Completed Yesterday".
    *   *Action:* User can skip ("I didn't do it"), which transitions them to the appropriate state (Yesterday -> Lively or Lively -> Junked).

### Interaction
*   **"Did you complete [Habit Name] yesterday?":**
    *   **Yes:** Opens completion modal. Upon confirmation, marks habit as completed for **Yesterday** (using `yesterdayRefDate`).
    *   **No:** Calls `resolveHabitIncomplete`, triggering `GRACE_INCOMPLETE` event (Habit moves to Yesterday -> Lively or Lively -> Junked).

## 3. Edge Cases & Real-World Scenarios

### A. The "True Two-Day Rule" (Skipping Days)

*   **Scenario 1: The Morning Logger (Standard Flow)**
    *   **Context:** Alice (User) forgets to log her "Reading" habit on Monday night. She sleeps.
    *   **Event:** Alice opens the app Tuesday at 8:00 AM.
    *   **System Logic:** Last active: Monday. Current: Tuesday. Gap: 1 Day.
    *   **Result:** ✅ **Grace Screen Appears.**

*   **Scenario 2: The Weekend Ghost (Skipping)**
    *   **Context:** Bob logs on Friday. He goes camping and doesn't open the app Saturday or Sunday.
    *   **Event:** Bob opens the app Monday Morning.
    *   **System Logic:** Last active: Friday. Current: Monday. Gap: > 1 Day.
    *   **Result:** ❌ **NO Grace Screen.**
    *   **Why?** Habits are auto-resolved to `JUNKED` by `processHabitLifecycle` because the gap is >= 2 days.

### B. Timezone Travel (The "Jet Lag" Edge Case)

*   **Scenario 3: The Time Traveler (Flying West / Gaining Time)**
    *   **Context:** Charlie is in London (GMT). It is **Tuesday 2:00 AM** (locally). He hasn't logged Monday's habits.
    *   **Action:** He flies to New York (EST, -5 hrs). He lands. His phone updates to **Monday 9:00 PM**.
    *   **Event:** Charlie opens the app.
    *   **System Logic:** `getTodayISO` resolves to Monday. No Grace Period needed (it's still today).

## 4. Implementation Strategy

1.  **`useGracePeriod` Hook (`hooks/useGracePeriod.ts`):**
    *   Orchestrates the lifecycle check.
    *   Calls `processHabitLifecycle`.
    *   Exposes `graceHabits` list and `resolveHabitIncomplete` function.
2.  **`processHabitLifecycle` (`lib/logic/habitProcessor.ts`):**
    *   Iterates through habits.
    *   Auto-resolves straightforward cases (Day Rollover, Junking).
    *   Identifies habits needing user input (Grace).
3.  **`GracePeriodScreen` Component (`components/grace-period/GracePeriodScreen.tsx`):**
    *   Renders the modal for the list of `graceHabits`.
    *   Delegates completion to `useHabitActions` (with date override).
    *   Delegates skipping to `useGracePeriod`.
