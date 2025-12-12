
import { isCompletedToday, isCompletedYesterday, getDaysSinceCompletion } from '@/lib/time/logic';

describe('Time Logic (Business Rules)', () => {
  const TZ_NY = 'America/New_York';

  describe('isCompletedToday', () => {
    it('should return true if completed today', () => {
      // "Now" is 2023-10-27 12:00 NY
      const now = new Date('2023-10-27T16:00:00Z'); // 12:00 EDT
      
      // Completed at 2023-10-27 09:00 NY
      const completed = '2023-10-27T13:00:00Z'; // 09:00 EDT

      expect(isCompletedToday(completed, TZ_NY, now)).toBe(true);
    });

    it('should return false if completed yesterday', () => {
      // "Now" is 2023-10-27 12:00 NY
      const now = new Date('2023-10-27T16:00:00Z'); 
      
      // Completed at 2023-10-26 23:00 NY
      const completed = '2023-10-27T03:00:00Z'; // Oct 26 23:00 EDT (UTC-4)

      expect(isCompletedToday(completed, TZ_NY, now)).toBe(false);
    });
  });

  describe('getDaysSinceCompletion', () => {
    it('should return 0 for same day', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const completed = '2023-10-27T13:00:00Z';
      expect(getDaysSinceCompletion(completed, TZ_NY, now)).toBe(0);
    });

    it('should return 1 for yesterday', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const completed = '2023-10-26T23:00:00Z'; // 11 PM Prev Night
      expect(getDaysSinceCompletion(completed, TZ_NY, now)).toBe(1);
    });

    it('should return 2 for day before yesterday', () => {
      const now = new Date('2023-10-27T16:00:00Z');
      const completed = '2023-10-25T23:00:00Z'; 
      expect(getDaysSinceCompletion(completed, TZ_NY, now)).toBe(2);
    });
  });
});
