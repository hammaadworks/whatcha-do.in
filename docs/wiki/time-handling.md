# 🕒 Time & Date Discipline Wiki

**Canonical Rules for Handling Time in This Codebase**

> **TL;DR**
> We do NOT “handle time everywhere”.
> We resolve time **once**, convert it to a **date string**, and do **all logic on ISO dates**.

If you violate this, you *will* break:

* streaks
* habits
* analytics
* midnight behavior
* DST behavior

---

## 1. Core Philosophy (Non-Negotiable)

### ✅ Time is an input, dates are the domain

We separate concerns into **three layers**:

```
(1) Reference Time (Date)
        ↓
(2) User-relative "Today" (ISODate)
        ↓
(3) Business Logic (ISO math only)
```

---

## 2. Canonical Definitions & Data Types

Understanding the possible values for time-related data is critical for system stability.

### A. The "Simulated Date" Cookie (`simulated_date`)

Stores the user's "Time Travel" preference.

* **Values:**
    * `null` / `undefined`: User is in "Real Time".
    * `ISO 8601 String` (Full): User is time-traveling.
* **Examples:**
    * `undefined` (Normal user)
    * `"2025-12-25T09:00:00.000Z"` (Time traveling to Christmas morning)

### B. Reference Date (`Date` Object)

The single source of truth for "Now".

* **Type:** JavaScript `Date` object.
* **Origin:** Must come from `getReferenceDateUI` (Client) or `getReferenceDateServer` (Server).
* **Meaning:** "The exact moment the user performed the action."
* **Constraint:** NEVER create this manually with `new Date()` outside of `lib/date.ts` or `SimulatedTimeProvider`.

### C. ISODate (`string`)

The domain primitive. Represents a **Calendar Day**.

* **Format:** `YYYY-MM-DD`
* **Examples:** `"2025-12-25"`, `"2024-01-01"`
* **Usage:** Database columns (`last_completed_date`), Streak logic comparisons.
* **Timezone:** ALWAYS resolved. `"2025-12-25"` means "Dec 25th in the user's timezone".

---

## 3. The One File That Owns Time: `lib/date.ts`

This file is the **single source of truth**. It owns resolving today, timezone handling, ISO date math, and habit/streak
rules.

### 🚫 Banned Everywhere Else

* `new Date()` (except for UI display components like clocks)
* Timezone math (adding/subtracting hours)
* Comparing timestamps directly for habits
* Quick helpers that calculate "today"

If you need date logic and it’s not in `date.ts`, **add it there or don’t add it at all**.

---

## 4. Usage Guide: When & How to Use `lib/date.ts`

### Scenario A: "I need to know what 'Today' is for the user."

**Context:** Checking if a habit is done today, loading today's journal.
**Tool:** `getTodayISO(timezone, refDate)`

```ts
const refDate = getReferenceDateUI(simulatedDate); // Get "Now"
const todayISO = getTodayISO(user.timezone, refDate); // Resolve "Today"
// Result: "2025-12-20"
```

### Scenario B: "I need the start of the current month."

**Context:** Loading Monthly Targets.
**Tool:** `getCurrentMonthStartISO(timezone, refDate, offset)`

```ts
// Current Month (e.g., Dec 1st)
const currentMonth = getCurrentMonthStartISO(user.timezone, refDate, 0);
// Previous Month (e.g., Nov 1st)
const prevMonth = getCurrentMonthStartISO(user.timezone, refDate, -1);
```

### Scenario C: "I need to check if a habit was done yesterday."

**Context:** Grace period logic, streak calculations.
**Tool:** `completedYesterday(lastCompletedISO, todayISO)` (and `daysSince`)

```ts
if (completedYesterday(habit.last_completed_date, todayISO)) {
    // It was done yesterday!
}
// OR generic math
const gap = daysSince(habit.last_completed_date, todayISO);
if (gap === 1) { /* Yesterday */
}
```

### Scenario D: "I need to log an activity timestamp."

**Context:** Journal `activity_log`.
**Tool:** Pass the `refDate` directly.

```ts
await logActivity(..., {timestamp: refDate.toISOString()});
```

---

## 5. How Time Enters the System

### UI (Client)

**Source:** `SimulatedTimeProvider` via `useSimulatedTime()` hook.

```ts
const {simulatedDate} = useSimulatedTime();
const refDate = getReferenceDateUI(simulatedDate);
```

### Server (RSC / Actions)

**Source:** Cookies.

```ts
const cookieStore = await cookies();
const cookieValue = cookieStore.get(SIMULATED_DATE_COOKIE)?.value;
const refDate = getReferenceDateServer(cookieValue);
```

---

## 6. Business Logic Rules (ISO Only)

After `todayISO` is computed, all logic must be string-based:

### ✅ Allowed

```ts
completedToday(lastCompletedISO, todayISO);
daysSince(lastCompletedISO, todayISO);
completedYesterday(lastCompletedISO, todayISO);
getMonthStart(todayISO);
```

### ❌ Forbidden

```ts
new Date(lastCompletedAt) // ❌ Don't parse ISOs back to Dates for logic
    (Date.now() - lastCompletedAt) / 86400000 // ❌ No millisecond math
```

---

## 7. Database Rules (Very Important)

### ✅ What We Store

```ts
last_completed_date: ISODate // "2025-12-13" (DATE column)
```

### ❌ What We Never Store for Habits

* "today" status (derived)
* Timezone-adjusted timestamps for *streaks* (we use ISO date strings)

**The DB stores facts (dates), not interpretations.**

---

## 8. Midnight, DST, and Time Travel

* **Midnight:** Nothing special happens. Next call to `getTodayISO()` simply returns a new value.
* **DST:** Handled automatically by `date-fns-tz` inside `getTodayISO`. We never do `+86400000` math.
* **Time Travel:** UI sets simulated time cookie. Server + client stay consistent. Business logic remains unchanged.

---

## 9. Mandatory Usage Pattern (Memorize This)

```ts
// Step 1: get reference time X aka (server or ui)
const refDate = getReferenceDateX(...);

// Step 2: resolve today
const todayISO = getTodayISO(user.timezone, refDate);

// Step 3: ISO-only logic
daysSince(lastCompletedISO, todayISO);
```

If your code doesn’t follow this shape, it’s wrong.

---

## 10. Code Review Checklist

Before approving any PR involving dates:

* [ ] No `new Date()` outside `date.ts` (except UI display).
* [ ] No timezone math outside `date.ts`.
* [ ] No ISO logic inside UI or Server helpers.
* [ ] DB stores ISODate only for dates.
* [ ] `getTodayISO()` used exactly once per flow.
* [ ] `SIMULATED_DATE_COOKIE` is respected.

---
