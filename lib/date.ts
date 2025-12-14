/**
 * @fileoverview Legacy Entry Point for Date/Time Logic.
 * 
 * DEPRECATED: Prefer importing directly from `@/lib/time/physics`, `@/lib/time/logic`, or `@/lib/time/format`.
 * This file delegates to the new modular architecture.
 */

import { getStartOfDayInTimezone, getEndOfDayInTimezone } from './time/physics';
import { isCompletedToday } from './time/logic';
import { getCurrentDateInTimezone as formatCurrentDate, getMonthStartDate as formatMonthStart, isFirstDayOfMonth as checkFirstDay } from './time/format';

/**
 * Returns the start of the current day (00:00:00.000) for a specific timezone.
 * Returns the timestamp in milliseconds.
 * 
 * @param timezone The IANA timezone string (e.g., 'America/New_York'). Defaults to 'UTC'.
 * @param referenceDate Optional reference date for Time Travel.
 */
export function getStartOfTodayInTimezone(
  timezone: string = 'UTC', 
  referenceDate: Date | number = new Date()
): number {
  return getStartOfDayInTimezone(timezone, referenceDate);
}

/**
 * Returns the current date string (YYYY-MM-DD) for a specific timezone.
 */
export function getCurrentDateInTimezone(
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): string {
  return formatCurrentDate(timezone, referenceDate);
}

/**
 * Checks if a given timestamp is from a "previous day" relative to the user's current timezone.
 * Used for "Next Day Clearing" logic.
 * 
 * @param timestampISO The ISO string of the completion time.
 * @param timezone The user's preferred timezone.
 * @param referenceDate Optional reference date for Time Travel.
 */
export function isCompletedBeforeToday(
  timestampISO: string | null | undefined, 
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): boolean {
  if (!timestampISO) return false;
  
  // It is before today if it is NOT "Today" (and we assume it's in the past).
  // Strictly: completed < startOfToday
  // Our logic module has `isCompletedToday`.
  return !isCompletedToday(timestampISO, timezone, referenceDate);
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
  return formatMonthStart(offsetMonths, timezone, referenceDate);
}

/**
 * Returns the number of milliseconds until the next midnight (start of the next day) 
 * for a specific timezone.
 * 
 * @param timezone User's timezone.
 * @param referenceDate Optional reference date.
 */
export function getMillisecondsUntilNextDay(
  timezone: string = 'UTC',
  referenceDate: Date | number = new Date()
): number {
  const now = new Date(referenceDate).getTime();
  const endOfDay = getEndOfDayInTimezone(timezone, referenceDate);
  
  return endOfDay - now;
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
  return checkFirstDay(timezone, referenceDate);
}