# Habit Lifecycle & State Management

This document details the lifecycle of a Habit entity within the application, defining the strict rules for movement between the "Today", "Yesterday", and "Pile" states.

## The "3-Box" System

1.  **Today**: Habits completed for the current day.
2.  **Yesterday**: Habits from the previous day that were active but incomplete (Grace Period).
3.  **The Pile**: The backlog of all other active (`lively`) or abandoned (`junked`) habits.

## Data Models

### Habit State (`HabitState`)

| Enum Value | Description | Context |
| :--- | :--- | :--- |
| `today` | Completed for today. | **Today** Column |
| `yesterday` | Active yesterday, pending action. | **Yesterday** Column |
| `lively` | Active backlog habit. | **The Pile** |
| `junked` | Inactive/Abandoned habit (failed 2-Day Rule). | **The Pile** |

## Movement & Transition Rules

### 1. Completion (Move to Today)
**Action:** User marks a habit as done (Drag to Today or Click Check).
*   **Pile (`lively`/`junked`) → Today**: Valid.
    *   *Effect*: Streak +1. (If was `junked`, streak resets to 1).
*   **Yesterday → Today**: Valid.
    *   *Effect*: Streak +1. (Streak Saved).

### 2. Undo (Move out of Today)
**Action:** User unmarks a habit (Drag from Today to original box).
*   **Today → Pile (`lively`/`junked`)**: Valid (if habit originated in Pile).
    *   *Effect*: Streak -1, delete completion. Restores previous state.
*   **Today → Yesterday**: Valid (if habit originated in Yesterday).
    *   *Effect*: Streak -1, delete completion. Returns to Grace Period.

### 3. Giving Up (Yesterday to Pile)
**Action:** User explicitly moves a habit from Yesterday to the Pile, effectively skipping it.
*   **Yesterday → Pile (`lively`)**: Valid.
    *   *Effect*: The habit returns to the backlog. Streak logic depends on implementation (typically broken if not done by day end).

### 4. The 2-Day Rule (Automated Junking)
**Rule:** A habit transitions from `lively` to `junked` if it is missed for a second consecutive day.
*   **Pile (`lively`) → Pile (`junked`)**:
    *   *Trigger*: Time-based automation (Cron).
    *   *Logic*: If a habit was not completed Yesterday AND is not completed Today, it is considered "abandoned" and moves to `junked` state to declutter the view.

### 5. Invalid Movements
*   **Pile → Yesterday**: **STRICTLY FORBIDDEN**.
    *   *Reason*: A habit from the backlog cannot be retroactively placed in "Yesterday" to cheat the timeline or claim a grace period it didn't earn. It must go to "Today" (Completed) or stay in the Pile.

## Summary of Valid Transitions

| Source | Target | Action Type | Notes |
| :--- | :--- | :--- | :--- |
| **Pile** | **Today** | Complete | Streak Increments. |
| **Yesterday** | **Today** | Complete | Streak Saved. |
| **Today** | **Pile** | Undo | Restoration. |
| **Today** | **Yesterday** | Undo | Restoration. |
| **Yesterday** | **Pile** | Move/Skip | User returns habit to backlog. |
| **Pile** | **Yesterday** | **INVALID** | **Never Allowed.** |

