# Habit Lifecycle — Canonical Ruleset (AI-Safe Spec)

This document defines the **single source of truth** for the Habit lifecycle.
All logic MUST follow this spec exactly. No implicit assumptions are allowed.

---

## The 3-Box System (User-Facing)

1. **Today** — Habits completed for the current calendar day.
2. **Yesterday** — Habits eligible for a one-day grace period.
3. **The Pile** — All other habits (lively or junked).

---

## Canonical Habit States (Internal)

```ts
export enum HabitState {
    TODAY = 'today', YESTERDAY = 'yesterday', LIVELY = 'lively', JUNKED = 'junked',
}
````

---

## Required Habit Fields (Non-Negotiable)

Each habit MUST contain:

```ts
state: HabitState
streak: number
lastCompletedDate: Date | null
lastNonTodayState: 'yesterday' | 'lively' | 'junked'
```

`lastNonTodayState` exists solely to make **Undo deterministic**.

---

## System Events (Explicit)

The system recognizes ONLY the following events:

```ts
USER_COMPLETE
USER_UNDO
DAY_ROLLOVER
DAILY_RESOLUTION
```

No other implicit events are allowed.

---

## Invariants (Must Always Hold)

1. A habit may exist in **Yesterday for at most one calendar day**.
2. A habit may enter **Yesterday ONLY from Today**.
3. **Pile → Yesterday is strictly forbidden**.
4. Streak can only increase via `USER_COMPLETE`.
5. Streak can increase **at most once per calendar day**.
6. Any habit in `junked` MUST have `streak = 0`.
7. Direct state mutation is forbidden — all changes go through transitions.

---

## Event Rules

---

### 1. USER_COMPLETE (User marks habit done)

#### Valid Transitions

* `lively → today`
* `junked → today`
* `yesterday → today`

#### Effects

* `streak += 1`
* `lastCompletedDate = today`
* If previous state was `junked`, streak resets to `1`
* `lastNonTodayState` is preserved

---

### 2. USER_UNDO (User unmarks habit)

Undo MUST return the habit to its **previous non-today state**.

#### Valid Transitions

* `today → lastNonTodayState`

#### Effects

* `streak -= 1`
* Delete completion record for today
* Restore exact prior state (`yesterday`, `lively`, or `junked`)

#### Constraint

* If `lastNonTodayState = yesterday`, the habit MUST return to Yesterday
* User is never allowed to choose the destination manually

---

### 3. DAY_ROLLOVER (System, calendar boundary)

Triggered at:

* Local midnight OR
* First app open after midnight

#### Rules

* Every habit in `today` moves to `yesterday`
* Only habits completed on day `t` are eligible
* No streak changes occur

#### Valid Transition

* `today → yesterday`

---

### 4. DAILY_RESOLUTION (System, once per day per habit)

Triggered **once per habit per calendar day**, on first app open.

This resolves habits left incomplete.

---

## DAILY_RESOLUTION — Case A: Habit in Yesterday

### Scenario A1 — App opened on day `t+1`

User is shown a grace-period modal.

* **User marks Complete**

    * `yesterday → today`
    * `streak += 1` (streak saved)

* **User marks Incomplete**

    * `yesterday → lively`
    * `streak unchanged`

### Scenario A2 — App opened on day `t+2` or later

* Auto-resolve as incomplete

    * `yesterday → lively`
    * `streak unchanged`

---

## DAILY_RESOLUTION — Case B: Habit in Pile (Lively)

### Scenario B1 — App opened on day `t+1`

User is shown a grace-period modal.

* **User marks Complete**

    * `lively → today`
    * `streak += 1`

* **User marks Incomplete**

    * `lively → junked`
    * `streak = 0`

### Scenario B2 — App opened on day `t+2` or later

* Auto-resolve as incomplete

    * `lively → junked`
    * `streak = 0`

---

## Forbidden Transitions (Hard Errors)

The following MUST NEVER occur:

* `lively → yesterday`
* `junked → yesterday`
* `pile → yesterday` (any form)
* Any state change without a declared event
* Any streak increment without `USER_COMPLETE`

If encountered, the system must throw an error.

---

## Canonical Transition Contract

All logic MUST flow through the following function:

```ts
transitionHabit(habit, event, currentDate)
```

* Direct state mutation is forbidden
* UI actions emit events
* System actions emit events
* State is a pure function of `(previousState, event, date)`

---

## Design Intent (Non-Functional, Mandatory)

* Yesterday is **earned**, never granted.
* Grace is **limited**, never stackable.
* Time cannot be gamed.
* The system favors **honesty over streak preservation**.

This intent MUST guide all future extensions.

```
