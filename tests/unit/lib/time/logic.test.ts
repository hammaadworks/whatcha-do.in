import { completedToday, completedYesterday, daysSince, getTodayISO, ISODate } from '@/lib/date';

describe('Time Logic (Business Rules)', () => {
  const TZ_NY = 'America/New_York';

  describe('completedToday', () => {
    it('should return true if completed today', () => {
      // "Now" is 2023-10-27 12:00 NY
      const now = new Date('2023-10-27T16:00:00Z'); // 12:00 EDT
      const todayISO = getTodayISO(TZ_NY, now);
      
      // Completed at 2023-10-27 09:00 NY
      const completedDate = new Date('2023-10-27T13:00:00Z'); // 09:00 EDT
      const completedISO = getTodayISO(TZ_NY, completedDate);

      expect(completedToday(completedISO, todayISO)).toBe(true);
    });

    it('should return false if completed yesterday', () => {
      // "Now" is 2023-10-27 12:00 NY
      const now = new Date('2023-10-27T16:00:00Z'); 
      const todayISO = getTodayISO(TZ_NY, now);
      
      // Completed at 2023-10-26 23:00 NY
      const completedDate = new Date('2023-10-27T03:00:00Z'); // Oct 26 23:00 EDT (UTC-4)
      const completedISO = getTodayISO(TZ_NY, completedDate);

      expect(completedToday(completedISO, todayISO)).toBe(false);
    });
  });

  describe('daysSince', () => {
    it('should return 0 for same day', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const todayISO = getTodayISO(TZ_NY, now);
      const completedDate = new Date('2023-10-27T13:00:00Z');
      const completedISO = getTodayISO(TZ_NY, completedDate);
      expect(daysSince(completedISO, todayISO)).toBe(0);
    });

    it('should return 1 for yesterday', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const todayISO = getTodayISO(TZ_NY, now);
      const completedDate = new Date('2023-10-27T03:00:00Z'); // Oct 26 23:00 EDT (UTC-4)
      // Note: 2023-10-26 23:00 NY is 2023-10-27 03:00 UTC
      // getTodayISO('America/New_York', 2023-10-27T03:00:00Z) -> 2023-10-26
      const completedISO = getTodayISO(TZ_NY, completedDate);
      expect(daysSince(completedISO, todayISO)).toBe(1);
    });

    it('should return 2 for day before yesterday', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const todayISO = getTodayISO(TZ_NY, now);
      const completedDate = new Date('2023-10-26T03:00:00Z'); // Oct 25 23:00 EDT
      const completedISO = getTodayISO(TZ_NY, completedDate);
      expect(daysSince(completedISO, todayISO)).toBe(2);
    });
  });
});