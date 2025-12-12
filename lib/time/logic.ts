import { getStartOfDayInTimezone } from './physics';

/**
 * @fileoverview Pure Business Logic for Date/Time rules.
 * 
 * This module applies the project's specific rules (Two-Day Rule, Daily Cutoffs)
 * to the raw physics of time.
 * 
 * RULE: All functions must accept an optional `referenceDate` to support
 * the application's "Time Travel" debugging mode.
 */

/**
 * Checks if a timestamp represents a completion that happened "Today"
 * relative to the user's current timezone and reference time.
 * 
 * @param completionTimestampISO - ISO string or timestamp number of the event.
 * @param timezone - User's IANA timezone.
 * @param referenceDate - "Now". Defaults to system time.
 */
export function isCompletedToday(
  completionTimestampISO: string | number | null,
  timezone: string,
  referenceDate: Date | number = new Date()
): boolean {
  if (!completionTimestampISO) return false;

  const completedAt = new Date(completionTimestampISO).getTime();
  const startOfToday = getStartOfDayInTimezone(timezone, referenceDate);
  
  // Logic: It is "Today" if it happened AFTER (or equal to) the start of today.
  // Note: We assume future completions are impossible or handled elsewhere, 
  // but strictly speaking, anything >= StartOfToday is "Today" (until tomorrow starts).
  // Ideally, we'd check `completedAt < startOfTomorrow`, but for simple logic,
  // knowing it's >= startOfToday is usually sufficient for "Done Today".
  
  return completedAt >= startOfToday;
}

/**
 * Checks if a timestamp represents a completion that happened "Yesterday".
 * 
 * @param completionTimestampISO - ISO string or timestamp number.
 * @param timezone - User's IANA timezone.
 * @param referenceDate - "Now".
 */
export function isCompletedYesterday(
  completionTimestampISO: string | number | null,
  timezone: string,
  referenceDate: Date | number = new Date()
): boolean {
  if (!completionTimestampISO) return false;

  const completedAt = new Date(completionTimestampISO).getTime();
  const startOfToday = getStartOfDayInTimezone(timezone, referenceDate);
  
  // Start of Yesterday is exactly 24 "Calendar Hours" before Start of Today?
  // NO. DST could make yesterday 23 or 25 hours long.
  // CORRECT APPROACH: Use physics to find Start of Yesterday.
  
  // We can treat "Yesterday" as the day strictly before Today.
  // So: StartOfYesterday <= completedAt < StartOfToday.
  
  // To find StartOfYesterday properly:
  const refDateObj = new Date(referenceDate);
  refDateObj.setDate(refDateObj.getDate() - 1); // JS auto-handles month/year rollovers
  const startOfYesterday = getStartOfDayInTimezone(timezone, refDateObj);
  
  return completedAt >= startOfYesterday && completedAt < startOfToday;
}

/**
 * Returns the number of "Calendar Days" elapsed since a completion.
 * 
 * 0 = Completed Today
 * 1 = Completed Yesterday
 * 2 = Completed 2 days ago (Streak Broken unless Grace Period)
 * 
 * @param completionTimestampISO - ISO string or timestamp.
 * @param timezone - User's IANA timezone.
 * @param referenceDate - "Now".
 */
export function getDaysSinceCompletion(
  completionTimestampISO: string | number | null,
  timezone: string,
  referenceDate: Date | number = new Date()
): number {
  if (!completionTimestampISO) return Infinity; // Never completed

  const completedAt = new Date(completionTimestampISO).getTime();
  const startOfToday = getStartOfDayInTimezone(timezone, referenceDate);
  
  if (completedAt >= startOfToday) return 0; // Today
  
  // We need to count backwards.
  // A naive (completedAt - startOfToday) / 24h is dangerous due to DST.
  // 
  // Robust Strategy:
  // Convert both "Now" and "CompletedAt" to their "Wall Clock Date Strings" (YYYY-MM-DD)
  // and compare the difference in days between those strings.
  
  // We can leverage `toZonedTime` from physics (if we exported it, or re-import here).
  // But let's use our `getStartOfDayInTimezone` logic iteratively? No, that's slow.
  
  // Let's rely on the physics of "Noon".
  // Compare the difference in "Local Days".
  
  // Import helper needed? 
  // Let's implement a local helper using date-fns-tz logic for clarity.
  // Actually, calculating the difference in "Local Days" is best done by:
  // 1. Get Local Date of Reference (Today) -> e.g., 2023-10-27
  // 2. Get Local Date of Completion -> e.g., 2023-10-25
  // 3. Diff is 2.
  
  const { toZonedTime } = require('date-fns-tz');
  const { differenceInCalendarDays } = require('date-fns');

  const zonedNow = toZonedTime(new Date(referenceDate), timezone);
  const zonedCompletion = toZonedTime(new Date(completedAt), timezone);

  return differenceInCalendarDays(zonedNow, zonedCompletion);
}
