# Habit Lifecycle (With Explicit Grace Period Screen)

This document defines the COMPLETE habit lifecycle INCLUDING grace-period UI behavior.
It is the single source of truth for backend + frontend coordination.

All logic MUST follow this document exactly.
Creativity, inference, or shortcuts are forbidden.

---

## 1. Core Philosophy (Binding)

- Grace must be earned
- Grace is time-limited
- Undo must be lossless
- Streaks reflect truth, not motivation
- Failure compounds (negative streaks)
- UI NEVER decides logic — system state does

---

## 2. Canonical States

```ts
enum HabitState {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LIVELY = 'lively',
  JUNKED = 'junked'
}
````

---

## 3. Source-of-Truth Fields (From Schema)

```ts
habit_state: HabitState

streak: number                   // positive, zero, or negative
longest_streak: number           // analytics only, never decreases

last_non_today_state: HabitState
last_non_today_streak: number

last_completed_date: Date | null
last_resolved_date: Date | null

junked_at: Date | null
```

---

## 4. Time Model (Non-Negotiable)

* All logic operates on calendar DATE (not timestamps)
* A habit can be resolved ONCE per calendar day
* “t+1 / t+2” is calculated via DATE difference
* First app open of the day is authoritative

---

## 5. Global Invariants (Hard Errors)

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
export enum HabitLifecycleEvent {
    USER_COMPLETE = 0,
    USER_UNDO = 1,
    DAY_ROLLOVER = 2,
    DAILY_RESOLUTION = 3,
    GRACE_COMPLETE = 4,
    GRACE_INCOMPLETE = 5,
    AUTO_RESOLVE = 6,
}
```

> `GRACE_*` events are emitted ONLY from the Grace Period Screen.

---

## 7. Transition Engine Contract

ALL state changes MUST go through:

```ts
transitionHabit(habitId, event, todayDate)
```

State is a pure function of:

* the habitId of the habit record
* event
* todayDate

---

## 8. USER_COMPLETE (Reference – Already Implemented)

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

## 9. USER_UNDO (Reference – Already Implemented)

### Preconditions

* habit_state === today
* last_non_today_state IS NOT NULL

### Logic

```ts
habit_state = last_non_today_state
streak = last_non_today_streak
last_completed_date = null
```

`longest_streak` is NEVER modified.

---

## 10. DAY_ROLLOVER (System Event)

Triggered on:

* First app open after midnight

### Transition

```md
today → yesterday
```

```ts
habit_state = yesterday
last_non_today_state = null
```

* No streak changes
* No grace UI shown here

---

## 11. DAILY_RESOLUTION (System Guard)

Triggered ONCE per habit per calendar day.

```ts
if (last_resolved_date === todayDate) abort
last_resolved_date = todayDate
```

DAILY_RESOLUTION determines:

* Whether to show Grace Period Screen
* OR auto-resolve silently

---

## 12. GRACE PERIOD SCREEN — SYSTEM RULES (CRITICAL)

The Grace Period Screen is shown ONLY when:

### Condition A (Yesterday Grace)

* `habit_state === yesterday`
* `todayDate = last_completed_date + 1`

### Condition B (Lively Grace)

* `habit_state === lively`
* `last_completed_date = todayDate - 1`

If neither condition is met → **NO GRACE SCREEN**

---

## 13. DAILY_RESOLUTION — YESTERDAY

### Case A: App opened on t+1 → SHOW GRACE SCREEN

#### UI OPTIONS

* ✅ “I did it”
* ❌ “I didn’t”

#### A1. GRACE_COMPLETE

Equivalent to `USER_COMPLETE`.

#### A2. GRACE_INCOMPLETE

```ts
habit_state = lively
// streak unchanged
```

---

### Case B: App opened on t+2 or later → AUTO_RESOLVE

```ts
habit_state = lively
// streak unchanged
```

NO UI SHOWN.

---

## 14. DAILY_RESOLUTION — LIVELY

### Case A: App opened on t+1 → SHOW GRACE SCREEN

#### UI OPTIONS

* ✅ “I did it”
* ❌ “I didn’t”

#### A1. GRACE_COMPLETE

Equivalent to `USER_COMPLETE`.

#### A2. GRACE_INCOMPLETE → JUNK

```ts
habit_state = junked
junked_at = now()
streak = 0
```

---

### Case B: App opened on t+2 or later → AUTO_RESOLVE

```ts
habit_state = junked
junked_at = now()
streak = 0
```

NO UI SHOWN.

---

## 15. JUNKED STATE — NO GRACE EVER

* Junked habits NEVER show Grace Period Screen
* They silently decay

---

## 16. NEGATIVE STREAK RULE (CRITICAL)

Once habit enters `junked`:

### Entry Rule

```ts
streak = 0
```

### Daily Decay Rule

On each DAILY_RESOLUTION where:

* habit_state === junked
* last_completed_date < todayDate

```ts
streak -= 1
```

Results:

* Day 1 junked → 0
* Day 2 → -1
* Day 3 → -2
* …

### Recovery Rule

If user completes a junked habit:

```ts
streak = 1
habit_state = today
```

---

## 17. Forbidden Transitions (Hard Fail)

```ts
lively  → yesterday
junked  → yesterday
any     → today (without USER_COMPLETE / GRACE_COMPLETE)
negative streak outside junked
undo without saved state
```

---

## 18. Transition Summary (Truth Table)

| From      | Event            | To        | Streak Effect |
| --------- | ---------------- | --------- | ------------- |
| lively    | USER_COMPLETE    | today     | +1            |
| yesterday | USER_COMPLETE    | today     | +1            |
| junked    | USER_COMPLETE    | today     | reset → 1     |
| today     | USER_UNDO        | prev      | restore       |
| today     | DAY_ROLLOVER     | yesterday | none          |
| yesterday | GRACE_INCOMPLETE | lively    | none          |
| lively    | GRACE_INCOMPLETE | junked    | → 0           |
| junked    | DAILY_RESOLUTION | junked    | −1/day        |

---

## 19. Final Guarantees

If implemented exactly as written:

* Grace is shown ONLY when deserved
* Grace cannot be abused
* Undo is exact
* Negative streaks compound honestly
* UI and backend never disagree
* AI agents cannot hallucinate behavior

This document is FINAL.
Any deviation is a bug.

---