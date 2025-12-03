# Grace Period & End of Day Summary Logic

The "Grace Period" is a core UX pillar of *whatcha-doin*. It is an empathetic system designed for the "Ambitious Underachiever" who often logs their activity the next morning. Instead of punishing them with broken streaks immediately at midnight, we offer a "Grace Period" window.

## Core Concept

When a user opens the app on a "New Day" (defined by their local timezone), the system checks if they have unfinished business from the **immediately preceding day**.

If yes, they are intercepted by the **End of Day Summary** screen.

## 1. Triggers

The Grace Period screen is triggered **Client-Side** on app load/focus if:
1.  **Timezone Check:** The current local date (in user's timezone) > the last recorded "Grace Screen Shown Date".
2.  **Data Check:**
    *   There are **Habits** in the "Yesterday" column (which means they were not completed yesterday).
    *   There are **Actions** (Todos) that were "Cleared" overnight (completed yesterday but hidden from today's view).

## 2. The Summary Screen UI

This is a dedicated, focused modal/overlay that blocks the main dashboard until resolved.

### Content
*   **"Yesterday's Unfinished Habits":** Lists habits that are currently in the "Yesterday" state.
    *   *Action:* User can tap to mark them as "Completed Yesterday".
    *   *Action:* User can leave them as is (they will move to "The Pile").
*   **"Yesterday's Completed Actions":** Lists the Actions that were marked complete yesterday and just got cleared.
    *   *Purpose:* Celebration/Review. "Look what you did!"
    *   *Action:* User acknowledges them (teleporting them to Journal).
*   **"Add Extra":** A quick input to add a habit/action they forgot to log yesterday.

### Interaction
*   **"Finish & Start [Day Name]":** The primary button.
    *   **Commit:** Saves any habit completions for yesterday.
    *   **Transition:** Runs the "Daily State Change" (Habits move from Yesterday -> Pile, cleared Actions are archived to Journal).
    *   **Dismiss:** Sets `grace_screen_shown_for_date` to Today, preventing the screen from showing again until tomorrow.

## 3. Edge Cases & Real-World Scenarios

### A. The "True Two-Day Rule" (Skipping Days)

*   **Scenario 1: The Morning Logger (Standard Flow)**
    *   **Context:** Alice (User) forgets to log her "Reading" habit on Monday night. She sleeps.
    *   **Event:** Alice opens the app Tuesday at 8:00 AM.
    *   **System Logic:** Last active: Monday. Current: Tuesday. Gap: 1 Day.
    *   **Result:** ✅ **Grace Screen Appears.** Title: "Monday Summary". Alice checks "Reading". Her streak continues unbroken (e.g., 5 → 6).

*   **Scenario 2: The Weekend Ghost (Skipping)**
    *   **Context:** Bob logs on Friday. He goes camping and doesn't open the app Saturday or Sunday.
    *   **Event:** Bob opens the app Monday Morning.
    *   **System Logic:** Last active: Friday. Current: Monday. Gap: > 1 Day.
    *   **Result:** ❌ **NO Grace Screen.**
    *   **Why?** Saturday is "Junked". Sunday is "Lively" (or Junked depending on exact logic). The Grace Period is only for *Yesterday*. We don't ask Bob to reconstruct his entire weekend; we assume he wants a fresh start. His streaks are broken (or protected by freeze if we had that feature, but streaks are reset).

### B. Timezone Travel (The "Jet Lag" Edge Case)

*   **Scenario 3: The Time Traveler (Flying West / Gaining Time)**
    *   **Context:** Charlie is in London (GMT). It is **Tuesday 2:00 AM** (locally). He hasn't logged Monday's habits.
    *   **Action:** He flies to New York (EST, -5 hrs). He lands. His phone updates to **Monday 9:00 PM**.
    *   **Event:** Charlie opens the app.
    *   **System Logic:**
        *   Stored Profile Timezone: `Europe/London` (Tuesday).
        *   Phone Time: Monday.
        *   *Conflict:* If he kept London time, Monday is "Yesterday". But locally, Monday is "Today".
    *   **Resolution:** Ideally, the app detects the mismatch and asks: *"Update timezone to New York?"*
    *   **If Yes (Update):** "Today" becomes Monday again. The Grace Screen **DOES NOT** show because the day hasn't ended yet! He sees his Monday dashboard.
    *   **If No (Keep London):** The app thinks it is Tuesday (2 AM + flight duration). It shows the Grace Screen for "Monday".

*   **Scenario 4: The Future Traveler (Flying East / Losing Time)**
    *   **Context:** Sarah is in NY (Monday 11 PM). She flies to Paris (+6 hrs). She lands. Phone says **Tuesday 11:00 AM**.
    *   **Event:** Sarah opens the app.
    *   **System Logic:** "Today" effectively skipped the late night hours of Monday.
    *   **Result:** ✅ **Grace Screen Appears.** It asks about Monday. She logs her Monday habits.

### C. Actions (Todos) "Next Day" Logic

*   **Scenario 5: The Late Night Grind**
    *   **Context:** David finishes his project at **Monday 11:55 PM** and checks off "Finish Report".
    *   **Event:** He stays up. Clock hits **Tuesday 00:01 AM**. He refreshes the app.
    *   **System Logic:** "Finish Report" has `completed_at` = Monday. Current = Tuesday.
    *   **Result:** ✅ **Grace Screen Appears.** "Yesterday's Completed Actions" lists "Finish Report". David feels good about closing out the day. When he clicks "Start Tuesday", the item vanishes from the main list and moves to the Journal.

*   **Scenario 6: The Forgotten Task**
    *   **Context:** Emily finishes "Email Boss" on Monday at 2 PM but **forgets to check it off**.
    *   **Event:** She opens the app Tuesday morning. Grace Screen appears for Monday's *Habits*.
    *   **Action:** She sees the "Add Extra" input. She types "Email Boss" and hits Enter.
    *   **Result:** The system logs "Email Boss" as a completed Action for **Monday** (retroactively) and adds it to Monday's Journal.

## 4. Implementation Strategy

1.  **`useGracePeriod` Hook:**
    *   Calculates `isGracePeriodNeeded`.
    *   Fetches "Yesterday's Data" (Habits in Yesterday col, Actions with `completed_at` == Yesterday).
2.  **`GracePeriodScreen` Component:**
    *   Renders the UI.
    *   Calls `processGracePeriod(updates)` on submit.
3.  **State Updates:**
    *   Batch updates Supabase (Habit completions, User `grace_screen_shown_for_date`).