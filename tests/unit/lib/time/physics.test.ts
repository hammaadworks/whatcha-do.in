
import { getStartOfTodayInTimezone, getEndOfDayInTimezone } from '@/lib/date';

describe('Time Physics (Time Travel Compatible)', () => {
  // Scenario: New York Timezone (UTC-5 EST / UTC-4 EDT)
  const TZ_NY = 'America/New_York';

  describe('getStartOfDayInTimezone', () => {
    it('should return correct UTC start for a regular day (EST)', () => {
      // Input: 2023-01-15 12:00:00 NY Time (Regular Winter Day)
      // This is 2023-01-15 17:00:00 UTC.
      const referenceDate = new Date('2023-01-15T17:00:00Z');

      // Expected Start: 2023-01-15 00:00:00 NY
      // +5 hours = 2023-01-15 05:00:00 UTC
      const expectedUTC = new Date('2023-01-15T05:00:00Z').getTime();

      const result = getStartOfTodayInTimezone(TZ_NY, referenceDate);
      
      expect(result).toBe(expectedUTC);
    });

    it('should return correct UTC start for a DST day (EDT)', () => {
      // Input: 2023-06-15 12:00:00 NY Time (Summer Day)
      // This is 2023-06-15 16:00:00 UTC (Offset is 4 hours).
      const referenceDate = new Date('2023-06-15T16:00:00Z');

      // Expected Start: 2023-06-15 00:00:00 NY
      // +4 hours = 2023-06-15 04:00:00 UTC
      const expectedUTC = new Date('2023-06-15T04:00:00Z').getTime();

      const result = getStartOfTodayInTimezone(TZ_NY, referenceDate);
      
      expect(result).toBe(expectedUTC);
    });

    it('should respect the referenceDate (Time Travel Check)', () => {
      // We simulate that "Now" is actually 3 months ago.
      // Real "Now" might be Oct, but we pass Jan.
      
      const fakeNow = new Date('2023-01-01T15:00:00Z'); // Jan 1st
      
      const result = getStartOfTodayInTimezone(TZ_NY, fakeNow);
      
      // Should give start of Jan 1st, NOT today's date.
      const expected = new Date('2023-01-01T05:00:00Z').getTime(); // Jan 1st 00:00 EST -> 05:00 UTC
      
      expect(result).toBe(expected);
    });
  });

  describe('getEndOfDayInTimezone', () => {
    it('should wrap correctly to the start of tomorrow', () => {
      // Jan 15th
      const referenceDate = new Date('2023-01-15T17:00:00Z');
      
      // End of Day = Start of Jan 16th
      // Jan 16th 00:00 NY -> 05:00 UTC
      const expected = new Date('2023-01-16T05:00:00Z').getTime();
      
      const result = getEndOfDayInTimezone(TZ_NY, referenceDate);
      
      expect(result).toBe(expected);
    });
  });
});
