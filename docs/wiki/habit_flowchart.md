# Habit Logic & Architecture Guide

**Target Audience:** Product Managers, Developers, QA Engineers  
**Version:** 1.7  
**Status:** Approved / Handover Ready

This document is the **Source of Truth** for the Habit System in *whatcha-do.in*.

---

## 1. Core Concepts: The Two Processors

To understand how the system handles time, it's crucial to distinguish between the two main system events.

### A. DAY_ROLLOVER (The Time Traveler)

* **Purpose:** To "catch up" on history.
* **When it runs:** Inside a loop, for **every single day** the user missed since they last opened the app.
* **Logic:** It simulates what *would have happened* if the day passed.
* **Example:** If you haven't opened the app for 3 days:
    1. **Day 1 Sim:** Habit goes from `TODAY` → `YESTERDAY`.
    2. **Day 2 Sim:** Habit goes from `YESTERDAY` → `LIVELY`.
    3. **Day 3 Sim:** Habit goes from `LIVELY` → `JUNKED`.

### B. DAILY_RESOLUTION (The Present Enforcer)

* **Purpose:** To apply rules for the **current, real-time day**.
* **When it runs:** Once, immediately after the Time Travel loop finishes.
* **Logic:** It checks the final state and applies penalties for today if applicable.
* **Trigger:** Runs once per `processHabitLifecycle` call (which happens on app load/focus).
* **Example:** If a habit ends up `JUNKED` after the time travel, `DAILY_RESOLUTION` checks if you've done it *today*.
  If not, it applies the daily decay penalty (Streak -1).

---

## 2. State Transition Scenarios

### Scenario A: The "Happy Path" (User Completes Habit)

*Trigger: User clicks checkmark, marks "Done" in modal, or drags to "Today".*

```mermaid
graph LR
    %% --- STYLING ---
    classDef lively fill:#dcedc8,stroke:#33691e,stroke-width:2px;
    classDef today fill:#bbdefb,stroke:#0d47a1,stroke-width:2px;
    classDef yesterday fill:#ffe0b2,stroke:#e65100,stroke-width:2px;
    classDef junked fill:#cfd8dc,stroke:#37474f,stroke-width:2px;

    subgraph From_Standard
        L["LIVELY"]:::lively -->|"Complete (Streak +1)"| T1["TODAY"]:::today
    end

    subgraph From_Warning
        Y["YESTERDAY"]:::yesterday -->|"Complete (Streak +1)"| T2["TODAY"]:::today
    end

    subgraph From_Neglect
        J["JUNKED"]:::junked -->|"Revive (Streak = 1)"| T3["TODAY"]:::today
    end
```

### Scenario B: The "Decay Path" (Time Passes / Rollover)

*Trigger: System runs `DAY_ROLLOVER` for every day the user missed.*

```mermaid
graph TD
    %% --- STYLING ---
    classDef lively fill:#dcedc8,stroke:#33691e,stroke-width:2px;
    classDef today fill:#bbdefb,stroke:#0d47a1,stroke-width:2px;
    classDef yesterday fill:#ffe0b2,stroke:#e65100,stroke-width:2px;
    classDef junked fill:#cfd8dc,stroke:#37474f,stroke-width:2px;

    T["TODAY"]:::today -->|"Night Passes"| Y["YESTERDAY"]:::yesterday
    Y -->|"Night Passes"| L["LIVELY"]:::lively
    L -->|"Night Passes"| J["JUNKED (Streak 0)"]:::junked
    J -->|"Night Passes"| J2["JUNKED (Streak -1)"]:::junked
```

### Scenario C: The "Correction Path" (Undo)

*Trigger: User clicks "Unmark" or moves habit out of "Today".*

```mermaid
graph LR
    %% --- STYLING ---
    classDef lively fill:#dcedc8,stroke:#33691e,stroke-width:2px;
    classDef today fill:#bbdefb,stroke:#0d47a1,stroke-width:2px;
    classDef yesterday fill:#ffe0b2,stroke:#e65100,stroke-width:2px;
    classDef junked fill:#cfd8dc,stroke:#37474f,stroke-width:2px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,rx:5;

    T["TODAY"]:::today -->|"Undo"| Check{"Was it...?"}:::decision
    Check -->|"Lively"| L["LIVELY"]:::lively
    Check -->|"Yesterday"| Y["YESTERDAY"]:::yesterday
    Check -->|"Junked"| J["JUNKED"]:::junked
```

### Scenario D: The "Grace Period" Flow

*Trigger: App opens, and the system detects the user missed yesterday (Gap = 1).*

```mermaid
graph TD
    %% --- STYLING ---
    classDef lively fill:#dcedc8,stroke:#33691e,stroke-width:2px;
    classDef today fill:#bbdefb,stroke:#0d47a1,stroke-width:2px;
    classDef yesterday fill:#ffe0b2,stroke:#e65100,stroke-width:2px;
    classDef junked fill:#cfd8dc,stroke:#37474f,stroke-width:2px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,rx:5;
    classDef ui fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;

    Start(("Start Check")) --> Detect{"Gap == 1 Day?<br/>(Only Yesterday/Lively picked)"}:::decision
    Detect -- No --> NoGrace["No UI Shown"]
    Detect -- Yes --> UI["Show Grace Modal"]:::ui
    
    UI -->|"'I did it!'"| T["YESTERDAY"]:::yesterday
    
    UI -->|"'I missed it'"| Context{"Current State?"}:::decision
    Context -->|"Yesterday"| L["LIVELY"]:::lively
    Context -->|"Lively"| J["JUNKED"]:::junked
```

---

## 3. Master Architecture (Combined)

```mermaid
stateDiagram-v2
    %% --- STYLING ---
    classDef lively fill:#dcedc8,stroke:#33691e,stroke-width:2px;
    classDef today fill:#bbdefb,stroke:#0d47a1,stroke-width:2px;
    classDef yesterday fill:#ffe0b2,stroke:#e65100,stroke-width:2px;
    classDef junked fill:#cfd8dc,stroke:#37474f,stroke-width:2px;
    classDef error fill:#ffcdd2,stroke:#b71c1c,stroke-width:2px,stroke-dasharray: 5 5;

    [*] --> LIVELY

    %% --- STATE: TODAY ---
    state "TODAY (Done)" as TODAY :::today
    TODAY --> YESTERDAY : DAY_ROLLOVER
    TODAY --> LIVELY : USER_UNDO (Restores LIVELY)
    TODAY --> YESTERDAY : USER_UNDO (Restores YESTERDAY)
    TODAY --> JUNKED : USER_UNDO (Restores JUNKED)
    TODAY --> Error : USER_COMPLETE (Already done)

    %% --- STATE: YESTERDAY ---
    state "YESTERDAY (Warning)" as YESTERDAY :::yesterday
    YESTERDAY --> LIVELY : DAY_ROLLOVER (Missed - Return to pool)
    YESTERDAY --> LIVELY : GRACE_INCOMPLETE (User skipped)
    YESTERDAY --> TODAY : USER_COMPLETE (Streak increases)
    YESTERDAY --> YESTERDAY : GRACE_COMPLETE (Retroactive Complete)

    %% --- STATE: LIVELY ---
    state "LIVELY (Standard)" as LIVELY :::lively
    LIVELY --> JUNKED : DAY_ROLLOVER (Missed - JUNKED)
    LIVELY --> JUNKED : GRACE_INCOMPLETE (User skipped)
    LIVELY --> TODAY : USER_COMPLETE (Streak + 1)
    LIVELY --> YESTERDAY : GRACE_COMPLETE (Retroactive Complete)

    %% --- STATE: JUNKED ---
    state "JUNKED (Neglected)" as JUNKED :::junked
    JUNKED --> JUNKED : DAY_ROLLOVER (Streak -1)
    JUNKED --> JUNKED : DAILY_RESOLUTION (Streak -1)
    JUNKED --> TODAY : USER_COMPLETE (Revive - Streak = 1)
    JUNKED --> YESTERDAY : GRACE_COMPLETE (Retroactive Revival)
```

---

## 4. QA Validation Guide (Detailed)

This table details the exact data transformations and side effects for every scenario.

| ID        | Scenario                                | Trigger Event      | Result State | Streak          | Longest Streak | Junked At    | Last Non-Today Streak | Last Non-Today State | Last Completed Date | Last Resolved Date       | Journal Side Effects                  |
|:----------|:----------------------------------------|:-------------------|:-------------|:----------------|:---------------|:-------------|:----------------------|:---------------------|:--------------------|:-------------------------|:--------------------------------------|
| **TC-01** | **Normal Complete**<br/>(From Lively)   | `USER_COMPLETE`    | `TODAY`      | Current + 1     | Max(Old, New)  | `null`       | (Saved Current)       | `LIVELY`             | **Today**           | *Updated at end of loop* | **Log:** "Habit Name" added (Today).  |
| **TC-02** | **Save Yesterday**<br/>(From Yesterday) | `USER_COMPLETE`    | `TODAY`      | Current + 1     | Max(Old, New)  | `null`       | (Saved Current)       | `YESTERDAY`          | **Today**           | *Updated at end of loop* | **Log:** "Habit Name" added (Today).  |
| **TC-03** | **Revive Junk**<br/>(From Junked)       | `USER_COMPLETE`    | `TODAY`      | **1**           | Unchanged      | `null`       | (Saved Current)       | `JUNKED`             | **Today**           | *Updated at end of loop* | **Log:** "Habit Name" added (Today).  |
| **TC-04** | **Undo**<br/>(From Today)               | `USER_UNDO`        | `[PREV]`     | `[PREV]`        | Unchanged      | `[RESTORED]` | Unchanged             | Unchanged            | `null`              | *Updated at end of loop* | **Remove:** Entry removed from log.   |
| **TC-05** | **Missed 1 Day**<br/>(From Today)       | `DAY_ROLLOVER`     | `YESTERDAY`  | Unchanged       | Unchanged      | `null`       | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-06** | **Missed 2 Days**<br/>(From Yesterday)  | `DAY_ROLLOVER`     | `LIVELY`     | Unchanged       | Unchanged      | `null`       | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-07** | **Neglect**<br/>(From Lively)           | `DAY_ROLLOVER`     | `JUNKED`     | **0**           | Unchanged      | **Now**      | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-08** | **Deep Neglect**<br/>(From Junked)      | `DAY_ROLLOVER`     | `JUNKED`     | **Current - 1** | Unchanged      | Unchanged    | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-09** | **Grace: Did it**<br/>(From Yesterday)  | `GRACE_COMPLETE`   | `YESTERDAY`  | Current + 1     | Max(Old, New)  | `null`       | (Saved Current)       | `YESTERDAY`          | **Yesterday**       | *Updated at end of loop* | **Log:** Entry added for *Yesterday*. |
| **TC-10** | **Grace: Missed**<br/>(From Yesterday)  | `GRACE_INCOMPLETE` | `LIVELY`     | Unchanged       | Unchanged      | `null`       | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-11** | **Grace: Missed**<br/>(From Lively)     | `GRACE_INCOMPLETE` | `JUNKED`     | **0**           | Unchanged      | **Now**      | Unchanged             | Unchanged            | Unchanged           | *Updated at end of loop* | None.                                 |
| **TC-12** | **Grace: Did it**<br/>(From Lively)     | `GRACE_COMPLETE`   | `YESTERDAY`  | Current + 1     | Max(Old, New)  | `null`       | (Saved Current)       | `LIVELY`             | **Yesterday**       | *Updated at end of loop* | **Log:** Entry added for *Yesterday*. |
| **TC-13** | **Grace: Did it**<br/>(From Junked)     | `GRACE_COMPLETE`   | `YESTERDAY`  | **1**           | Unchanged      | `null`       | (Saved Current)       | `JUNKED`             | **Yesterday**       | *Updated at end of loop* | **Log:** Entry added for *Yesterday*. |

---

## 5. Technical Implementation (Triggers)

* **USER_COMPLETE**: `HabitCompletionsModal` -> `onConfirm` -> `completeHabit` (`habitLifecycle.ts`)
* **USER_UNDO**: `UnmarkConfirmationModal` -> `onConfirm` -> `unmarkHabit` (`habitLifecycle.ts`)
* **GRACE_INCOMPLETE**: `GracePeriodScreen` -> "Skip" (`habitLifecycle.ts`)
* **GRACE_COMPLETE**: `GracePeriodScreen` -> "I did it" (`habitLifecycle.ts`).
* **DAY_ROLLOVER**: `habitProcessor.ts` loop (System initiated).
* **DAILY_RESOLUTION**: `habitProcessor.ts` post-loop (System initiated).


