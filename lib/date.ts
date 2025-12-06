import { toZonedTime, format } from 'date-fns-tz';

/**
 * Returns the start of the current day (00:00:00.000) for a specific timezone.
 * Returns the timestamp in milliseconds.
 * 
 * @param timezone The IANA timezone string (e.g., 'America/New_York'). Defaults to 'UTC'.
 */
export function getStartOfTodayInTimezone(timezone: string = 'UTC'): number {
  const now = new Date();
  // Get the current time in the target timezone
  const zonedDate = toZonedTime(now, timezone);
  
  // Reset to midnight
  zonedDate.setHours(0, 0, 0, 0);
  
  return zonedDate.getTime();
}

/**
 * Returns the current date string (YYYY-MM-DD) for a specific timezone.
 */
export function getCurrentDateInTimezone(timezone: string = 'UTC'): string {
  const now = new Date();
  return format(toZonedTime(now, timezone), 'yyyy-MM-dd', { timeZone: timezone });
}

/**
 * Checks if a given timestamp is from a "previous day" relative to the user's current timezone.
 * Used for "Next Day Clearing" logic.
 * 
 * @param timestampISO The ISO string of the completion time.
 * @param timezone The user's preferred timezone.
 */
export function isCompletedBeforeToday(timestampISO: string, timezone: string = 'UTC'): boolean {
  if (!timestampISO) return false;
  
  const completedAt = new Date(timestampISO).getTime();
  const startOfToday = getStartOfTodayInTimezone(timezone);
  
  return completedAt < startOfToday;
}

/**
 * Returns the start date of a month (YYYY-MM-01) relative to the current date in the given timezone.
 * 
 * @param offsetMonths 0 for current month, -1 for previous month, etc.
 * @param timezone User's timezone.
 */
export function getMonthStartDate(offsetMonths: number, timezone: string = 'UTC'): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  
  // Adjust month safely handles year rollovers
  const targetDate = new Date(zonedDate.getFullYear(), zonedDate.getMonth() + offsetMonths, 1);
  
  return format(toZonedTime(targetDate, timezone), 'yyyy-MM-dd', { timeZone: timezone });
}
