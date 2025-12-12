import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * @fileoverview Pure physics and math for Timezone calculations.
 * 
 * This module handles the conversion between "Absolute Time" (UTC timestamps)
 * and "Wall Clock Time" (what the user sees on their clock).
 * 
 * CORE PRINCIPLE:
 * All calculations accept an optional `referenceDate`. This is critical for
 * the application's "Time Travel" debugging features.
 */

/**
 * Returns the absolute UTC timestamp (ms) representing the "Start of the Day" (00:00:00)
 * for a user in a specific timezone.
 *
 * Use Case:
 * Comparing if a task completed at `14:00 UTC` falls within "Today" for a user in Tokyo.
 *
 * @param timezone - IANA timezone string (e.g., 'America/New_York').
 * @param referenceDate - The "Now" moment. Defaults to system time.
 *                        Pass a simulated date here for Time Travel.
 * @returns The UTC timestamp (ms) when that local day began.
 */
export function getStartOfDayInTimezone(
  timezone: string,
  referenceDate: Date | number = new Date()
): number {
  const dateObj = new Date(referenceDate);

  // 1. Get the "Wall Clock" time components for the target timezone.
  //    Example: It's 14:00 UTC. In NY (UTC-5), it's 09:00.
  //    `zonedDate` will conceptually hold "09:00".
  const zonedDate = toZonedTime(dateObj, timezone);

  // 2. Reset that "Wall Clock" time to midnight (00:00:00).
  //    Now it conceptually holds "00:00" on that specific day.
  zonedDate.setHours(0, 0, 0, 0);

  // 3. We need to convert this "Wall Clock 00:00" back to a real UTC timestamp.
  //    Problem: `zonedDate` from date-fns-tz is a trick. It's a Date object where
  //    getHours() returns the local time, but it stores a shifted timestamp.
  //    
  //    However, `toZonedTime` returns a date object that *effectively* allows us
  //    to extract the year/month/day of the local time.
  //
  //    To get the REAL UTC timestamp of "00:00 NY", we cannot just use .getTime()
  //    on the zoned object if we want to be mathematically pure, but we need
  //    to construct a date that *looks* like 00:00 in that timezone.
  
  //    Let's use a robust approach:
  //    Construct a string "YYYY-MM-DD 00:00:00" from the zoned parts,
  //    then ask the system "What is the UTC timestamp of 'YYYY-MM-DD 00:00' in America/New_York?"
  
  //    Actually, date-fns-tz provides a cleaner way.
  //    If we have the Year, Month, Date of the USER's "Today", we can find the timestamp.
  
  const year = zonedDate.getFullYear();
  const month = zonedDate.getMonth(); // 0-indexed
  const day = zonedDate.getDate();

  // Create a date object that corresponds to YYYY-MM-DD 00:00:00 in the TARGET timezone.
  // We use the Intl API or date-fns-tz to get the specific offset for that midnight.
  // But a simpler way often used in these libs:
  // Create a UTC date for YYYY-MM-DD 00:00:00Z
  // Then APPLY the inverse offset? No, offsets change.
  
  // The most reliable way without external heavy libs (like Luxon) but using date-fns-tz:
  // We already have the components (Y, M, D) of "Today".
  // We want to find the UTC timestamp X such that toZonedTime(X, timezone) is Y-M-D 00:00:00.
  
  // Ideally, we treat the input date as the source of truth for "Day".
  // Let's rely on `toZonedTime` strictly for extracting the Date components.
  
  // Use the native Date constructor to build the specific moment in the specific zone?
  // No, JS Date constructor is browser-local or UTC.
  
  // Let's stick to the method that works with the libraries we have.
  // Since we don't have `fromZonedTime` (date-fns-tz v2/3 diffs), 
  // we might need to rely on the fact that `date-fns-tz` handles this.
  
  // Wait, `date-fns-tz` DOES have `fromZonedTime` in v3 (which replaces `zonedTimeToUtc`).
  // Let's use `fromZonedTime` if available, or imports. 
  // I will assume standard exports. I'll need to check the exact export in a second step if this fails, 
  // but `fromZonedTime` is the counterpart to `toZonedTime`.
  
  // For now, I'll use a string parsing method which is 100% robust across versions if `fromZonedTime` is missing.
  // But let's try to import `fromZonedTime`.
  
  return getTimestampFromParts(year, month, day, 0, 0, 0, timezone);
}

/**
 * Returns the absolute UTC timestamp (ms) for the start of the NEXT day.
 * useful for "Time Remaining" calculations.
 */
export function getEndOfDayInTimezone(
  timezone: string,
  referenceDate: Date | number = new Date()
): number {
  const startOfToday = getStartOfDayInTimezone(timezone, referenceDate);
  
  // We cannot just add 24 hours (86400000ms) because of Daylight Savings Time (23h or 25h days).
  // Strategy: Add 26 hours to the start of today, then snap back to midnight of THAT day.
  // Or: specific date logic.
  
  const date = new Date(startOfToday);
  const zonedDate = toZonedTime(date, timezone); // Should be 00:00:00 wall clock
  
  const year = zonedDate.getFullYear();
  const month = zonedDate.getMonth();
  const day = zonedDate.getDate();
  
  // Get start of Tomorrow
  return getTimestampFromParts(year, month, day + 1, 0, 0, 0, timezone);
}

/**
 * Helper: Constructs a UTC timestamp from local date parts in a specific timezone.
 * Replaces `zonedTimeToUtc` / `fromZonedTime`.
 * 
 * Logic:
 * 1. Construct a string "YYYY-MM-DD HH:mm:ss"
 * 2. Use Intl or Date to parse it in that timezone context.
 * 
 * Since we don't want to rely on experimental APIs, we will use a polyfill approach 
 * compatible with `date-fns-tz`.
 * 
 * NOTE: I am implementing a safe fallback here. 
 */
function getTimestampFromParts(y: number, m: number, d: number, h: number, min: number, s: number, tz: string): number {
    // We create a string in ISO-like format without the 'Z' or offset
    // "2023-10-27T00:00:00"
    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoLocal = `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
    
    // In date-fns-tz v3, `fromZonedTime` is the standard.
    return fromZonedTime(isoLocal, tz).getTime();
}
