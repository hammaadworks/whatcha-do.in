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

## 2. Canonical Definitions

### Reference Date

* A `Date` object
* Represents **now**
* May be real time or simulated time
* Comes from UI or Server
* Has **NO business meaning**

### ISODate

* String in format: `YYYY-MM-DD`
* Example: `"2025-12-13"`
* Represents a **calendar day**
* Is timezone-resolved
* Is what we store in the DB
* Is what business logic runs on

---

## 3. The One File That Owns Time

### 📁 `lib/date.ts`

This file is the **single source of truth**.

It owns:

* resolving today
* timezone handling
* ISO date math
* habit / streak rules

### 🚫 Banned Everywhere Else

* `new Date()`
* timezone math
* comparing timestamps for habits
* quick helpers that calculate today

If you need date logic and it’s not in `date.ts`, **add it there or don’t add it at all**.

---

## 4. How Time Enters the System

### UI (Client)

Source of time:

* `SimulatedTimeProvider`

Usage:

```ts
const { simulatedDate } = useSimulatedTime();
const refDate = getReferenceDateUI(simulatedDate);
```

What this means:

* If simulated time exists → use it
* Otherwise → real current time
* Still just a `Date`, nothing more

---

### Server (RSC / Actions)

Source of time:

* Cookie set by `SimulatedTimeProvider`

Usage:

```ts
const cookieValue = cookies().get("simulated_date")?.value;
const refDate = getReferenceDateServer(cookieValue);
```

Again:

* Returns a `Date`
* No timezone logic yet
* No business meaning yet

---

## 5. Resolving “Today” (The Only Way)

> **There is exactly ONE way to get “today”.**

```ts
const todayISO = getTodayISO(user.timezone, refDate);
```

That’s it.

Rules:

* Happens **once per flow**
* Requires user timezone
* Uses reference date
* Returns `ISODate`

### 🚫 What is NOT allowed

```ts
new Date().toISOString().slice(0, 10); // ❌
```

```ts
simulatedDate?.toISOString(); // ❌
```

```ts
const today = useState("2025-12-13"); // ❌
```

---

## 6. Business Logic Rules (ISO Only)

After `todayISO` is computed:

### ✅ Allowed

```ts
completedToday(lastCompletedISO, todayISO);
daysSince(lastCompletedISO, todayISO);
completedYesterday(lastCompletedISO, todayISO);
getMonthStart(todayISO);
```

### ❌ Forbidden

```ts
new Date(lastCompletedAt) // ❌
(Date.now() - lastCompletedAt) / 86400000 // ❌
```

**Business logic must NEVER see `Date`.**

---

## 7. Database Rules (Very Important)

### ✅ What We Store

```ts
last_completed_date: ISODate // "2025-12-13"
```

### ❌ What We Never Store

* “today”
* Date objects
* timezone-adjusted timestamps for streaks
* derived state

**The DB stores facts, not interpretations.**

---

## 8. Midnight, DST, and Time Travel

### Midnight

* Nothing special happens
* Next call to `getTodayISO()` returns a new value
* No timers
* No cron
* No cache invalidation

### DST

* Handled automatically
* We never do `+86400000` math
* We never count hours

### Time Travel (Simulation)

* UI sets simulated time
* Cookie syncs it to server
* Server + client stay consistent
* Business logic remains unchanged

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

## 10. Code Review Checklist (Use This)

Before approving any PR involving dates:

* [ ] No `new Date()` outside `date.ts`
* [ ] No timezone math outside `date.ts`
* [ ] No ISO logic inside UI or Server helpers
* [ ] DB stores ISODate only
* [ ] `getTodayISO()` used exactly once per flow
* [ ] No cached “today” values

Fail any → request changes.

---

## 11. Why We Are This Strict

Because:

* time bugs are silent
* date bugs are expensive
* streak bugs destroy user trust
* DST bugs show up months later
* just this once helpers multiply

Discipline here saves **weeks of debugging** later.

---

## 12. Final Rule

> **If you’re confused about time, you’re probably skipping a step.
> Go back to: reference date → todayISO → ISO logic.**

---