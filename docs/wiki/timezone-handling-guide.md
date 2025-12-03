# Timezone Handling Guide

This project uses a robust **"User-Preferred Timezone"** strategy. We do not rely on the browser's system time or the server's UTC time for determining "Today" or "Daily Deadlines." Instead, we use the timezone explicitly stored in the user's profile.

This ensures that if a user travels or switches devices, their "Identity Day" remains consistent with their chosen setting (e.g., "I live in New York time").

## Core Concepts

1.  **Storage:**
    *   Database: All timestamps (`created_at`, `completed_at`) are stored in **UTC** (ISO 8601).
    *   User Preference: The `users` table has a `timezone` column (e.g., `'America/New_York'`, default `'UTC'`).

2.  **Logic:**
    *   **"Start of Today":** Calculated relative to the *User's Timezone*.
    *   **Clearing/Updates:** Logic that depends on "Has the day passed?" (like Action clearing or Habit streaks) must use the user's timezone to determine the day boundary (midnight).

## Key Helper Functions

We use `date-fns-tz` and custom helpers in `lib/date.ts`.

### 1. `getStartOfTodayInTimezone(timezone: string): number`

Returns the timestamp (ms) for 00:00:00.000 of the current day *in the specified timezone*.

**Usage:**
Use this to compare against completion timestamps. If `completed_at < startOfToday`, the item belongs to a "previous day".

```typescript
import { getStartOfTodayInTimezone } from '@/lib/date';

const userTimezone = 'Asia/Tokyo'; // From user profile
const startOfToday = getStartOfTodayInTimezone(userTimezone);

if (action.completed_at_timestamp < startOfToday) {
  // This action was completed yesterday (or earlier)
}
```

### 2. `isCompletedBeforeToday(timestampISO: string, timezone: string): boolean`

A convenience wrapper for the above logic. Returns `true` if the timestamp represents a time *before* the current day's start in the given timezone.

**Usage:**
Perfect for filtering lists (e.g., "Next Day Clearing").

```typescript
import { isCompletedBeforeToday } from '@/lib/date';

const visibleActions = allActions.filter(action => {
  // Keep if NOT completed OR completed TODAY
  return !action.completed || !isCompletedBeforeToday(action.completed_at, user.timezone);
});
```

## Integration in React Components

1.  **Get the Timezone:**
    *   If in a Profile context, use the `timezone` prop passed down from `ProfileLayout`.
    *   If in a global context, check `useAuth().user?.timezone`.

2.  **Pass to Logic:**
    *   Always pass this string to your fetchers or logic functions.
    *   Example: `fetchActions(user.id, timezone)`

## "Grace Period" & Summary Logic

When implementing the **End of Day Summary**:
1.  Use `getStartOfTodayInTimezone(user.timezone)` to determine the cut-off.
2.  Any items (Habits or Actions) completed *before* this timestamp but *after* `startOfToday - 24h` are candidates for the "Yesterday" summary.
