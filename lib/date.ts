/**
 * ============================================================================
 * 🧠 CANONICAL DATE SYSTEM — FINAL (NON-F***ABLE)
 * ============================================================================
 *
 * ARCHITECTURE CONTRACT (NON-NEGOTIABLE):
 *
 * 1. "Today" is derived, never stored
 * 2. UI / Server ONLY provide a reference Date ("now")
 * 3. Timezone resolution happens EXACTLY ONCE
 * 4. Business logic runs ONLY on ISODate (YYYY-MM-DD)
 * 5. DB stores ISODate, NEVER timestamps for streak logic
 * 6. NEVER cache "today"
 * 7. NEVER call new Date() outside this file
 *
 * Violate this and you WILL introduce midnight / DST bugs.
 * ============================================================================
 */

import {format} from "date-fns";
import {fromZonedTime, toZonedTime} from "date-fns-tz";
import {ISODate} from "@/lib/supabase/types.ts";

/* -------------------------------------------------------------------------- */

/* SECTION 1 — REFERENCE TIME PROVIDERS
 * Purpose: Answer ONLY “what is now?”
 * -------------------------------------------------------------------------- */

/**
 * Server reference time
 * - cookieValue is simulated_date cookie (ISO string)
 */
export function getReferenceDateServer(cookieValue?: string): Date {
    if (!cookieValue) return new Date();
    const d = parseISO(cookieValue as ISODate);
    return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * UI reference time
 * - simulatedDate comes from the provider
 */
export function getReferenceDateUI(simulatedDate: Date | null): Date {
    return simulatedDate ?? new Date();
}

/* -------------------------------------------------------------------------- */

/* SECTION 2 — TIMEZONE PHYSICS (PRIVATE)
 * -------------------------------------------------------------------------- */

function getZonedParts(timezone: string, referenceDate: Date | number) {
    const zoned = toZonedTime(new Date(referenceDate), timezone);
    return {
        year: zoned.getFullYear(), month: zoned.getMonth(), // 0-indexed
        day: zoned.getDate(),
    };
}

function utcFromZonedParts(y: number, m: number, d: number, h: number, min: number, s: number, timezone: string): number {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const isoLocal = `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
    return fromZonedTime(isoLocal, timezone).getTime();
}

/* -------------------------------------------------------------------------- */

/* SECTION 3 — TIMEZONE RESOLUTION (PUBLIC API)
 * Purpose: Define “today” EXACTLY ONCE
 * -------------------------------------------------------------------------- */

/**
 * ✅ THE ONLY VALID WAY TO GET "TODAY"
 */
export function getTodayISO(timezone: string, referenceDate: Date | number = new Date()): ISODate {
    return format(toZonedTime(new Date(referenceDate), timezone), "yyyy-MM-dd") as ISODate;
}

/**
 * Start of today (00:00) in user timezone → UTC timestamp
 * (analytics / range queries only)
 */
export function getStartOfTodayInTimezone(timezone: string, referenceDate: Date | number = new Date()): number {
    const {year, month, day} = getZonedParts(timezone, referenceDate);
    return utcFromZonedParts(year, month, day, 0, 0, 0, timezone);
}

export function getEndOfDayInTimezone(timezone: string, referenceDate: Date | number = new Date()): number {
    const {year, month, day} = getZonedParts(timezone, referenceDate);
    // End of day is start of next day
    // Using Date.UTC to increment day handles month rollover automatically
    const tomorrow = new Date(Date.UTC(year, month, day + 1));
    return utcFromZonedParts(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 0, 0, 0, timezone);
}

export function getMillisecondsUntilNextDay(timezone: string, referenceDate: Date | number = new Date()): number {
    const now = new Date(referenceDate).getTime();
    const endOfDay = getEndOfDayInTimezone(timezone, referenceDate);
    return Math.max(0, endOfDay - now);
}

/* -------------------------------------------------------------------------- */

/* SECTION 4 — PURE ISO DATE MATH (TIMEZONE-FREE)
 * -------------------------------------------------------------------------- */

export function parseISO(date: ISODate): Date {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}

export function formatISO(date: Date): ISODate {
    return date.toISOString().slice(0, 10) as ISODate;
}

export function addDays(date: ISODate, days: number): ISODate {
    const base = parseISO(date);
    base.setUTCDate(base.getUTCDate() + days);
    return formatISO(base);
}

export function diffInDays(from: ISODate | null, to: ISODate): number {
    if (!from) {
        return 0;
    }
    const a = parseISO(from).getTime();
    const b = parseISO(to).getTime();
    return Math.round((b - a) / 86_400_000);
}

export function getMonthStart(today: ISODate, offsetMonths = 0): ISODate {
    const [y, m] = today.split("-").map(Number);
    return formatISO(new Date(Date.UTC(y, m - 1 + offsetMonths, 1)));
}

export function isFirstDayOfMonth(today: ISODate): boolean {
    return today.endsWith("-01");
}

export function getCurrentMonthStartISO(timezone: string, referenceDate: Date | number = new Date(), offsetMonths = 0): ISODate {
    const today = getTodayISO(timezone, referenceDate);
    return getMonthStart(today, offsetMonths);
}


/* -------------------------------------------------------------------------- */

/* SECTION 5 — BUSINESS LOGIC (HABITS / STREAKS)
 * ISO IN → ISO OUT
 * -------------------------------------------------------------------------- */

export function daysSince(someDate: ISODate | null, today: ISODate): number {
    if (!someDate) return 0;
    return diffInDays(someDate, today);
}

/* -------------------------------------------------------------------------- */

/* SECTION 6 — UI HELPERS (INPUT PARSING)
 * -------------------------------------------------------------------------- */

/**
 * Parses a datetime-local input string (YYYY-MM-DDTHH:mm) into a Date object.
 * Used primarily for Time Travel debugging.
 *
 * @param input - The value from <input type="datetime-local" />
 */
export function parseLocalDateTime(input: string): Date | null {
    if (!input) return null;

    const [datePart, timePart] = input.split("T");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Constructing date using local browser time as intended for "Simulated Local Time"
    return new Date(year, month - 1, day, hour, minute);
}