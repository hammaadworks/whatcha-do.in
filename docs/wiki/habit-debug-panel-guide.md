# Habit Debug Panel Guide

This document explains how to access and utilize the Habit Debug Panel, a developer-only tool designed to facilitate the testing and manipulation of habit states within the application.

## 1. What is the Habit Debug Panel?

The Habit Debug Panel is a specialized UI component (`components/profile/sections/HabitDebugPanel.tsx`) that provides direct control over a user's habits. It allows developers to:

*   Select any existing habit.
*   Modify core properties of the selected habit, such as its name, visibility, and internal state.
*   "Time travel" by backdating habit completions to specific past dates.

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

## 3. Using the Panel

Once the panel is visible, you can interact with it using the following features:

### 3.1. Select Habit

1.  **Dropdown**: Use the "Select Habit" dropdown to choose a habit from your list. The habits are listed by name, with a truncated ID for identification.
2.  **Effect**: Once selected, the panel will populate with the current editable properties of that habit.

### 3.2. Edit Habit Properties

After selecting a habit, you can modify its properties:

*   **Name**:
    *   **Field**: Text input labeled "Name".
    *   **Usage**: Edit the habit's displayed name.
    *   **Implication**: Changes the habit's label across the application.
*   **Pile State**:
    *   **Field**: Dropdown labeled "Pile State".
    *   **Options**: `today`, `yesterday`, `pile`, `lively`, `junked`, `active`.
    *   **Usage**: Manually set the habit's lifecycle state.
    *   **Implication**: Directly affects where the habit appears on the habit board and its interaction with streak logic.
        *   `today`: Appears in the "Today" column.
        *   `yesterday`: Appears in the "Yesterday" column (e.g., if missed completion).
        *   `pile`: General pool of habits not explicitly for today/yesterday.
        *   `lively`: A habit in "The Pile" that was recently active.
        *   `junked`: A habit in "The Pile" that has been inactive for a while.
        *   `active`: General active state.
*   **Current Streak**:
    *   **Field**: Number input labeled "Current Streak".
    *   **Usage**: Set the habit's current streak count.
    *   **Implication**: Directly influences streak displays and can be used to test streak-related UI elements (e.g., confetti for high streaks).
*   **Is Public**:
    *   **Field**: Dropdown labeled "Is Public".
    *   **Options**: `True`, `False`.
    *   **Usage**: Toggle the habit's visibility on public profiles.
    *   **Implication**: Affects whether the habit is displayed on your public profile page.
*   **Save Changes**: Click the "Save Changes" button to persist all modifications to the database. A toast notification will confirm success or failure.

### 3.3. Time Travel: Backdate Completion

This feature allows you to simulate completing a habit on a past date.

1.  **Date Selection**:
    *   **Field**: Date input labeled "Date to Mark as Completed".
    *   **Usage**: Select any date from the calendar.
2.  **Complete on Selected Date**: Click the "Complete on Selected Date" button.
3.  **Implication**:
    *   This will mark the selected habit as completed on the chosen past date.
    *   It simulates the `backdateHabitCompletion` function, which creates a `habit_completion` record for that date.
    *   This can be used to retroactively build streaks, test how the "Yesterday" or "Grace Period" logic handles past completions, and verify streak calculations.
    *   Be mindful that backdating can affect existing streaks and the overall history of the habit.

## 4. Maximizing Potential

*   **Rapid Iteration**: Quickly test UI states for habits without waiting for natural progression (e.g., setting `pile_state` to `yesterday` to test Grace Period UI).
*   **Streak Management**: Validate streak calculation logic by manually setting `current_streak` or backdating completions.
*   **Visibility Testing**: Toggle `is_public` to ensure habits appear/disappear correctly on public and private profile views.
*   **Edge Case Simulation**: Simulate complex scenarios, like a habit being `junked` or `lively`, and observe how the application responds.
*   **Collaboration**: For teams, this panel allows quick replication of specific habit states to debug user-reported issues.

**Caution**: This panel directly modifies your habit data. Use it responsibly and ideally in a development environment to avoid unintended alterations to your actual habit progress.