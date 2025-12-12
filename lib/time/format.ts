import { toZonedTime, format } from 'date-fns-tz';

/**
 * @fileoverview Date Formatting logic.
 * 
 * Handles strictly the string representation of dates in specific timezones.
 * Separated from Physics/Logic to keep concerns pure.
 */

/**
 * Returns the current date string (YYYY-MM-DD) for a specific timezone.
 * 
 * @param timezone User's IANA timezone.
 * @param referenceDate Optional reference date (for Time Travel).
 */
export function getCurrentDateInTimezone(
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): string {
  const dateObj = new Date(referenceDate);
  return format(toZonedTime(dateObj, timezone), 'yyyy-MM-dd', { timeZone: timezone });
}

/**
 * Returns the start date of a month (YYYY-MM-01) relative to the current date in the given timezone.
 * 
 * @param offsetMonths 0 for current month, -1 for previous month, etc.
 * @param timezone User's timezone.
 * @param referenceDate Optional reference date.
 */
export function getMonthStartDate(
  offsetMonths: number,
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): string {
  const dateObj = new Date(referenceDate);
  const zonedDate = toZonedTime(dateObj, timezone);
  
  // Create a new date for the 1st of the target month
  // We use the Year and Month from the zoned date
  const targetDate = new Date(zonedDate.getFullYear(), zonedDate.getMonth() + offsetMonths, 1);
  
  return format(toZonedTime(targetDate, timezone), 'yyyy-MM-dd', { timeZone: timezone });
}

/**
 * Checks if the current date in the specified timezone is the 1st day of the month.
 * 
 * @param timezone User's timezone.
 * @param referenceDate Optional reference date.
 */
export function isFirstDayOfMonth(
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): boolean {
  const dateObj = new Date(referenceDate);
  const zonedDate = toZonedTime(dateObj, timezone);
  return zonedDate.getDate() === 1;
}
