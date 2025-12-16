# Habit Lifecycle

This document defines the COMPLETE habit lifecycle. It is the single source of truth for all remaining implementations.

All logic MUST follow this document exactly. Creativity, inference, or shortcuts are forbidden.

---

## 1. Core Philosophy (Binding)

- Grace must be earned
- Undo must be lossless
- Streaks reflect **truth**, not motivation
- Failure compounds (negative streaks)

---

## 2. Canonical States

```ts
enum HabitState {
    TODAY = 'today', YESTERDAY = 'yesterday', LIVELY = 'lively', JUNKED = 'junked'
}

````

---

## 3. Source-of-Truth Fields (From Schema)

```ts
habit_state: HabitState

streak: number                   // can be positive, zero, or negative
longest_streak: number           // analytics only, never decreases

last_non_today_state: HabitState
last_non_today_streak: number

last_completed_date: Date | null
last_resolved_date: Date | null

junked_at: Date | null
```

---

## 4. Time Model (Non-Negotiable)

* All logic operates on **calendar DATE**, not timestamps
* A habit can be resolved **once per date only**
* “Day t+1 / t+2” is calculated using DATE difference

---

## 5. Global Invariants (Hard Errors)

The AI MUST enforce ALL of the following:

1. `today → yesterday` is the ONLY way to enter `yesterday`
2. `lively → yesterday` is forbidden
3. `junked → yesterday` is forbidden
4. Streak increases ONLY via `USER_COMPLETE`
5. At most ONE completion per calendar day
6. Undo restores EXACT prior state and streak
7. `longest_streak` NEVER decreases
8. If habit is `junked`, streak MUST be ≤ 0
9. Negative streaks ONLY occur in `junked`
10. No state mutation without an event

Violations MUST throw errors.

---

## 6. Events (Exhaustive)

```ts
USER_COMPLETE
USER_UNDO
DAY_ROLLOVER
DAILY_RESOLUTION
AUTO_RESOLVE
```

---

## 7. Transition Engine Contract

ALL changes must go through:

```ts
transitionHabit(habit, event, todayDate)
```

State is a pure function of:

* previous habit record
* event
* todayDate

---

## 8. USER_COMPLETE (Already Implemented) [Reference](/lib/supabase/habit.ts)

### Valid From

* lively
* yesterday
* junked

### Rules

```ts
if (last_completed_date === todayDate) abort
```

```ts
last_non_today_state = habit_state
last_non_today_streak = streak

habit_state = today
last_completed_date = todayDate
junked_at = null
```

#### Streak Logic

* From junked → `streak = 1`
* Else → `streak += 1`

```ts
longest_streak = max(longest_streak, streak)
```

---

## 9. USER_UNDO (Already Implemented) [Reference](/lib/supabase/habit.ts)

### Preconditions

* habit_state === today
* last_non_today_state IS NOT NULL

### Logic

```ts
habit_state = last_non_today_state
streak = last_non_today_streak
last_completed_date = null
```

> `longest_streak` is NEVER modified by undo.

---

## 10. DAY_ROLLOVER (System Event)

Triggered at:

* First app open after midnight

### Valid Transition

```md
today → yesterday
```

### Rules

```ts
habit_state = yesterday
last_non_today_state = null
```

* No streak changes
* No resolution happens here

---

## 11. DAILY_RESOLUTION (System Guard)

Triggered ONCE per habit per calendar day.

```ts
if (last_resolved_date === todayDate) abort
last_resolved_date = todayDate
```

Resolution depends on current state and date delta.

---

## 12. DAILY_RESOLUTION — YESTERDAY

### Case A: App opened on day t+1

User must choose.

#### A1. User marks COMPLETE

Equivalent to `USER_COMPLETE`.

#### A2. User marks INCOMPLETE

```ts
habit_state = lively
// streak unchanged
```

---

### Case B: App opened on day t+2 or later (AUTO)

```ts
habit_state = lively
// streak unchanged
```

---

## 13. DAILY_RESOLUTION — LIVELY

### Case A: App opened on day t+1

User must choose.

#### A1. User marks COMPLETE

Equivalent to `USER_COMPLETE`.

#### A2. User marks INCOMPLETE → JUNK

```ts
habit_state = junked
junked_at = now()
streak = 0
```

---

### Case B: App opened on day t+2 or later (AUTO)

```ts
habit_state = junked
junked_at = now()
streak = 0
```

---

## 14. NEGATIVE STREAK RULE (NEW — CRITICAL)

Once a habit is in `junked`:

### Rule 1: Streak becomes 0 on entry

Already enforced.

### Rule 2: Each subsequent unresolved day DECREASES streak

On every DAILY_RESOLUTION where:

* habit_state === junked
* habit is NOT completed
* last_completed_date < todayDate

Apply:

```ts
streak -= 1
```

This results in:

* Day 1 junked → streak = 0
* Day 2 junked → streak = -1
* Day 3 junked → streak = -2
* …

### Rule 3: Negative streaks ONLY exist in junked

If habit leaves junked via completion:

* streak resets to `1`

---

## 15. AUTO_RESOLVE — JUNKED (Silent)

Junked habits NEVER show grace UI.

On DAILY_RESOLUTION:

```ts
if (habit_state === junked && last_completed_date < todayDate) {
    streak -= 1
}
```

---

## 16. Forbidden Transitions (Hard Fail)

```ts
lively  → yesterday
junked  → yesterday
any     → today(without
USER_COMPLETE
)
negative
streak
outside
junked
undo
without
saved
state
```

---

## 17. Transition Summary (Truth Table)

| From      | Event              | To        | Streak Effect |
|-----------|--------------------|-----------|---------------|
| lively    | USER_COMPLETE      | today     | +1            |
| yesterday | USER_COMPLETE      | today     | +1            |
| junked    | USER_COMPLETE      | today     | reset → 1     |
| today     | USER_UNDO          | prev      | restore       |
| today     | DAY_ROLLOVER       | yesterday | none          |
| yesterday | RESOLVE_INCOMPLETE | lively    | none          |
| lively    | RESOLVE_INCOMPLETE | junked    | → 0           |
| junked    | DAILY_RESOLUTION   | junked    | −1/day        |

---

## 18. Final Guarantees

If implemented exactly as above:

* Undo is mathematically exact
* Streaks never lie
* Failure compounds visibly
* AI agents cannot invent paths
* Timeline integrity is preserved

This document is FINAL.
Any deviation is a bug.

---