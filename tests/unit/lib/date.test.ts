
import { getStartOfTodayInTimezone, getCurrentDateInTimezone, isCompletedBeforeToday } from '@/lib/date';
import { toZonedTime } from 'date-fns-tz';

describe('Timezone Logic (lib/date.ts)', () => {
  // Set a fixed "Now" for consistent testing
  // 2023-10-10T12:00:00Z
  const MOCK_NOW = new Date('2023-10-10T12:00:00Z').getTime();

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getStartOfTodayInTimezone', () => {
    it('should return correct midnight for UTC', () => {
      const startOfDay = getStartOfTodayInTimezone('UTC');
      const expected = new Date('2023-10-10T00:00:00Z').getTime();
      expect(startOfDay).toBe(expected);
    });

    it('should return correct midnight for New York (UTC-4/5)', () => {
      // On Oct 10, NY is usually EDT (UTC-4). 
      // 12:00 UTC is 08:00 NY time.
      // Midnight NY time would be 04:00 UTC.
      const startOfDay = getStartOfTodayInTimezone('America/New_York');
      // Verification using date-fns-tz logic locally to be sure
      const expectedDate = toZonedTime(MOCK_NOW, 'America/New_York');
      expectedDate.setHours(0, 0, 0, 0);
      
      expect(startOfDay).toBe(expectedDate.getTime());
    });

    it('should return correct midnight for Tokyo (UTC+9)', () => {
      // 12:00 UTC is 21:00 Tokyo time.
      // Midnight Tokyo time (start of SAME day) would be 2023-10-10 00:00 JST = 2023-10-09 15:00 UTC.
      const startOfDay = getStartOfTodayInTimezone('Asia/Tokyo');
      
      const expectedDate = toZonedTime(MOCK_NOW, 'Asia/Tokyo');
      expectedDate.setHours(0, 0, 0, 0);

      expect(startOfDay).toBe(expectedDate.getTime());
    });

    it('should handle a user late at night (11 PM)', () => {
        // Advance time to 23:00 UTC
        jest.setSystemTime(new Date('2023-10-10T23:00:00Z'));
        const startOfDay = getStartOfTodayInTimezone('UTC');
        const expected = new Date('2023-10-10T00:00:00Z').getTime();
        expect(startOfDay).toBe(expected);
    });

    it('should handle a user early morning (1 AM)', () => {
        // Advance time to 01:00 UTC NEXT DAY
        jest.setSystemTime(new Date('2023-10-11T01:00:00Z'));
        const startOfDay = getStartOfTodayInTimezone('UTC');
        const expected = new Date('2023-10-11T00:00:00Z').getTime();
        expect(startOfDay).toBe(expected);
    });
  });

  describe('getCurrentDateInTimezone', () => {
    it('should return YYYY-MM-DD format', () => {
      const dateStr = getCurrentDateInTimezone('UTC');
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return correct date for timezone behind UTC (still yesterday locally)', () => {
      // Set time to 01:00 UTC on Oct 11
      jest.setSystemTime(new Date('2023-10-11T01:00:00Z'));
      // NY is UTC-4, so it's 21:00 on Oct 10
      const dateStr = getCurrentDateInTimezone('America/New_York');
      expect(dateStr).toBe('2023-10-10');
    });

    it('should return correct date for timezone ahead of UTC (already tomorrow locally)', () => {
      // Set time to 23:00 UTC on Oct 10
      jest.setSystemTime(new Date('2023-10-10T23:00:00Z'));
      // Tokyo is UTC+9, so it's 08:00 on Oct 11
      const dateStr = getCurrentDateInTimezone('Asia/Tokyo');
      expect(dateStr).toBe('2023-10-11');
    });
  });

  describe('isCompletedBeforeToday', () => {
    beforeEach(() => {
        // Reset to base time: 2023-10-10T12:00:00Z
        jest.setSystemTime(MOCK_NOW); 
    });

    it('should return true if completion was yesterday', () => {
      const yesterdayISO = new Date('2023-10-09T12:00:00Z').toISOString();
      const result = isCompletedBeforeToday(yesterdayISO, 'UTC');
      expect(result).toBe(true);
    });

    it('should return false if completion was today (earlier)', () => {
      const earlierTodayISO = new Date('2023-10-10T08:00:00Z').toISOString();
      const result = isCompletedBeforeToday(earlierTodayISO, 'UTC');
      expect(result).toBe(false);
    });

    it('should return false if completion was today (future timestamp edge case)', () => {
      const laterTodayISO = new Date('2023-10-10T14:00:00Z').toISOString();
      const result = isCompletedBeforeToday(laterTodayISO, 'UTC');
      expect(result).toBe(false);
    });

    it('should handle timezone differences correctly (Cleared in NY, Visible in Tokyo)', () => {
      // Scenario: It is Oct 10 12:00 UTC.
      // Item completed: Oct 10 01:00 UTC.
      
      // 1. For UTC user:
      // Start of Today UTC: Oct 10 00:00 UTC.
      // Completion (01:00) >= Start (00:00) -> FALSE (Not before today, Visible)
      expect(isCompletedBeforeToday('2023-10-10T01:00:00Z', 'UTC')).toBe(false);

      // 2. For New York user (UTC-4):
      // Current Time NY: Oct 10 08:00 EDT.
      // Start of Today NY: Oct 10 00:00 EDT = Oct 10 04:00 UTC.
      // Completion (01:00 UTC) is BEFORE Start of Today (04:00 UTC).
      // Result -> TRUE (It was completed "Yesterday" in NY time terms, so Clear it)
      expect(isCompletedBeforeToday('2023-10-10T01:00:00Z', 'America/New_York')).toBe(true);
    });

    it('should return false for null/undefined timestamp', () => {
        // @ts-ignore
        expect(isCompletedBeforeToday(null)).toBe(false);
        // @ts-ignore
        expect(isCompletedBeforeToday(undefined)).toBe(false);
    });
  });
});
