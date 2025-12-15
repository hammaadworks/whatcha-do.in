# Habit Debug Panel Guide

This document explains how to access and utilize the Habit Debug Panel, a developer-only tool designed to facilitate the testing and manipulation of habit states within the application.

## 1. What is the Habit Debug Panel?

The Habit Debug Panel is a specialized UI component (`components/profile/sections/HabitDebugPanel.tsx`) that provides direct control over a user's habits. It allows developers to:

*   Select any existing habit.
*   Modify core properties of the selected habit, such as its name, visibility, and internal state.
*   "Time travel" by simulating habit completions on specific past or future dates.

This tool is invaluable for debugging streak logic, testing different habit lifecycles, and verifying UI responses to various habit states without needing to naturally complete habits over days.

## 2. Accessing the Habit Debug Panel

The Habit Debug Panel is a developer-only feature and is not accessible to regular users. It is rendered conditionally within the `HabitsSection` component (`components/profile/sections/HabitsSection.tsx`).

To access the panel:

1.  **Be Authenticated as the Profile Owner**: You must be logged in as the user whose profile you are currently viewing.
2.  **Ensure Not in Read-Only Mode**: The profile must not be in a read-only state.
3.  **Match Developer Username**: Your authenticated username (`user?.username`) must match the value set in the `NEXT_PUBLIC_DEV_USER` environment variable.

    *   **Configuration**: Ensure your `.env.local` file (or equivalent environment configuration) includes a `NEXT_PUBLIC_DEV_USER` variable set to your username. For example:
        ```dotenv
        NEXT_PUBLIC_DEV_USER=your_username_here
        ```
    *   **Visibility**: If these conditions are met, the Habit Debug Panel will appear at the bottom of the "Habits" section on the user's profile page.

## 3. Interface Guide (Buttons & Fields)

The panel is divided into two main sections: **Properties Editor** and **Time Travel**.

### 3.1. Properties Editor (Top Section)

This section allows you to modify the current state of the selected habit in the database.

*   **Select Habit (Dropdown):** Choose which habit to edit.
*   **Name (Input):** Rename the habit.
*   **Pile State (Dropdown):** Manually force the habit into a specific lifecycle state.
    *   `today`: Active for the current day.
    *   `yesterday`: Missed yesterday (Grace Period candidate).
    *   `pile`: In the general pool (inactive).
    *   `lively`: Recently missed (T-2), sitting in the pile but visually distinct.
    *   `junked`: Long-term inactive (T-3+).
    *   `active`: General active state (legacy).
*   **Current Streak (Input):** Manually set the streak number. Useful for testing "Streak Fire" (3+ days) or recovery logic.
*   **Is Public (Dropdown):** Toggle visibility for public profile viewers.
*   **"Save Changes" (Button):**
    *   **Action:** Commits all the values in the inputs above (Name, Pile State, Streak, Visibility) to the database (`habits` table).
    *   **Use Case:** Use this when you want to set up a specific scenario *now*, like forcing a habit into the `yesterday` column to test the UI.

### 3.2. Time Travel: Simulate Completion (Bottom Section)

This section allows you to generate completion records (`habit_completions`) for specific dates.

*   **Completion Date (Date Picker):** Select the date you want the completion to be recorded for. This respects the standard `YYYY-MM-DD` format.
*   **"Complete on Selected Date" (Button):**
    *   **Action:** Creates a new row in the `habit_completions` table for the selected habit and the selected date.
    *   **Use Case:** Backfilling streaks, testing future journaling, or verifying that completing a task "Yesterday" correctly saves the streak.
    *   **Note:** This does *not* automatically change the `habit_state` or `current_streak` of the habit itself unless the system logic triggers (which usually happens on page load or completion action). This button is strictly for creating the *record* of completion.

## 4. Reproduction Recipes (The 2-Day Rule)

This section explains how to faithfully reproduce specific Grace Period scenarios (T-1, T-2) to ensure the system behaves according to the "2-Day Rule".

**The Rule:**
*   **T (Today):** Habit is active.
*   **T-1 (Yesterday):** Grace Period. The "End of Day Summary" screen should appear.
*   **T-2 (Two Days Ago):** System Handling. The habit should be moved to "Lively" or "Junked". **No Grace Screen** for this specific habit.

### Recipe 1: Triggering the Grace Screen (T-1)

**Goal:** See the "End of Day Summary" modal.

1.  **Preparation:**
    *   Select a habit in the Debug Panel.
    *   Set **Pile State** to `today`.
    *   Click **Save Changes**.
    *   *Verify:* The habit is visible in the "Today" column.
2.  **Execution (Time Travel):**
    *   Open the **Settings Drawer** (Gear icon).
    *   In the "Time Travel" section, set the date to **Tomorrow** (e.g., if real time is Oct 10th, set to Oct 11th).
    *   Click "Engage Flux Capacitor".
3.  **Observation:**
    *   The app reloads/refreshes.
    *   Since the habit was in `today` for Oct 10th, and it is now Oct 11th, the system detects a **T-1** missed habit.
    *   **Success:** The "End of Day Summary" screen should appear, asking you about yesterday (Oct 10th).

### Recipe 2: The "Too Late" Scenario (T-2)

**Goal:** Verify the system auto-resolves missed habits without showing the Grace Screen.

1.  **Preparation:**
    *   Select a habit in the Debug Panel.
    *   Set **Pile State** to `today`.
    *   Click **Save Changes**.
2.  **Execution (Time Travel):**
    *   Open the **Settings Drawer**.
    *   Set the date to **Two Days in the Future** (e.g., if real time is Oct 10th, set to Oct 12th).
    *   Click "Engage Flux Capacitor".
3.  **Observation:**
    *   The app reloads.
    *   The system sees the habit was last active on Oct 10th. It is now Oct 12th.
    *   The gap is > 1 day.
    *   **Success:** The "End of Day Summary" screen should **NOT** appear (unless *other* habits were missed on T-1).
    *   The habit should be found in "The Pile" (likely in `lively` or `junked` state).
    *   The streak should be reset.

## 5. Comprehensive Test Cases

Use these cases to validate the entire lifecycle.

### 5.1. The 2-Day Rule (Grace Period)

*   **Test A: The Perfect Day**
    1.  **Setup:** Create/Reset a habit to `today` state, Streak 0.
    2.  **Action:** Complete the habit (Click the checkbox).
    3.  **Verify:** Streak = 1.
    4.  **Travel:** Go to Tomorrow.
    5.  **Result:** Habit is uncompleted in `today` column. Streak is still 1. (Correct: You kept the streak alive).

*   **Test B: The Grace Period (Missed Today)**
    1.  **Setup:** Habit in `today`, uncompleted.
    2.  **Travel:** Go to Tomorrow.
    3.  **Result:**
        *   **Grace Screen** appears.
        *   Habit is listed under "Yesterday's Unfinished Habits".
        *   Streak is unchanged (at risk).

*   **Test C: The Save (Completing Yesterday's Habit)**
    1.  **Setup:** Follow Test B. You are on the Grace Screen.
    2.  **Action:** Mark the habit as "Done" inside the Grace Screen.
    3.  **Result:**
        *   Streak increments.
        *   Habit moves to `today` for the current day (optional logic, depending on implementation).
        *   Journal shows completion for **Yesterday**.

*   **Test D: The Break (T-2 System Handling)**
    1.  **Setup:** Habit in `today`, uncompleted.
    2.  **Travel:** Go forward **2 Days**.
    3.  **Result:**
        *   **NO Grace Screen**.
        *   Habit is in "The Pile".
        *   Streak is 0 (Broken).

### 5.2. Visual States

*   **Test E: Junked State**
    1.  **Setup:** Debug Panel -> Set Pile State to `junked`. Save.
    2.  **Verify:** Habit card in "The Pile" looks dusty/greyed out.

*   **Test F: Lively State**
    1.  **Setup:** Debug Panel -> Set Pile State to `lively`. Save.
    2.  **Verify:** Habit card in "The Pile" looks active/glowing (indicating it was recently active).

### 5.3. Journaling Integrity

*   **Test G: Backdating**
    1.  **Setup:** Select habit. Choose a date 5 days ago in "Completion Date".
    2.  **Action:** Click "Complete on Selected Date".
    3.  **Verify:** Go to Journal page. Navigate to 5 days ago. The completion should be listed there.

*   **Test H: Future Completion**
    1.  **Travel:** Go to Next Month.
    2.  **Action:** Complete a habit.
    3.  **Verify:** Go to Journal page for Next Month. Completion is there. Return to Present. Completion is **NOT** in today's journal.