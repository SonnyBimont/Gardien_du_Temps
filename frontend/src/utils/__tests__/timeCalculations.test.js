import {
  calculateTotalHours,
  calculateWeeklyStats,
  calculateMonthlyStats,
  getExpectedHoursForPeriod,
  getExpectedHours,
  isWorkingDay,
  formatHours,
  getTodayStatus,
  calculateCurrentWorkingTime,
  calculateDayBreakTime,
} from '../timeCalculations'; // Adjust path as needed
import { parseISO } from 'date-fns';

// Mockup for entries data
const mockEntries = [
  // Day 1: Full day with break
  { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival', task_id: 1 },
  { date_time: '2023-10-01T12:00:00Z', tracking_type: 'break_start', task_id: 1 },
  { date_time: '2023-10-01T13:00:00Z', tracking_type: 'break_end', task_id: 1 },
  { date_time: '2023-10-01T17:30:00Z', tracking_type: 'departure', task_id: 1 }, // 7.5h worked, 1h break

  // Day 2: Half day, no break
  { date_time: '2023-10-02T09:00:00Z', tracking_type: 'arrival', task_id: 2 },
  { date_time: '2023-10-02T13:00:00Z', tracking_type: 'departure', task_id: 2 }, // 4h worked

  // Day 3: Arrival but no departure (incomplete)
  { date_time: '2023-10-03T14:00:00Z', tracking_type: 'arrival', task_id: 3 },

  // Day 4: Multiple breaks
  { date_time: '2023-10-04T08:00:00Z', tracking_type: 'arrival' },
  { date_time: '2023-10-04T10:00:00Z', tracking_type: 'break_start' },
  { date_time: '2023-10-04T10:30:00Z', tracking_type: 'break_end' },
  { date_time: '2023-10-04T12:30:00Z', tracking_type: 'break_start' },
  { date_time: '2023-10-04T13:00:00Z', tracking_type: 'break_end' },
  { date_time: '2023-10-04T16:00:00Z', tracking_type: 'departure' }, // 2+2+3 = 7h worked, 0.5+0.5 = 1h break

  // Entries for a specific week for weekly/monthly stats
  // Assuming 2023-10-09 is a Monday
  { date_time: '2023-10-09T09:00:00Z', tracking_type: 'arrival' }, // Mon
  { date_time: '2023-10-09T17:00:00Z', tracking_type: 'departure' }, // 8h
  { date_time: '2023-10-10T09:00:00Z', tracking_type: 'arrival' }, // Tue
  { date_time: '2023-10-10T17:00:00Z', tracking_type: 'departure' }, // 8h
  { date_time: '2023-10-11T09:00:00Z', tracking_type: 'arrival' }, // Wed
  { date_time: '2023-10-11T12:00:00Z', tracking_type: 'departure' }, // 3h (half day)
  // Weekend - 2023-10-14 (Sat), 2023-10-15 (Sun)
];

describe('timeCalculations', () => {
  describe('calculateTotalHours', () => {
    const processed = calculateTotalHours(mockEntries);

    it('should process entries and group them by date, sorted descending', () => {
      expect(processed.length).toBe(4); // Day 3 is incomplete but processed
      expect(new Date(processed[0].date)).toBeInstanceOf(Date);
      expect(new Date(processed[0].date).getTime()).toBeGreaterThan(new Date(processed[1].date).getTime());
    });

    it('calculates working hours, break hours, and total hours correctly for a full day', () => {
      const day1 = processed.find(p => p.date === '2023-10-01');
      expect(day1.workingHours).toBe(7.5);
      expect(day1.breakHours).toBe(1);
      expect(day1.totalHours).toBe(8.5); // Total time between first arrival and last departure
      expect(day1.isComplete).toBe(true);
      expect(day1.isIncomplete).toBe(false);
    });

    it('calculates hours correctly for a day with no breaks', () => {
      const day2 = processed.find(p => p.date === '2023-10-02');
      expect(day2.workingHours).toBe(4);
      expect(day2.breakHours).toBe(0);
      expect(day2.totalHours).toBe(4);
      expect(day2.isComplete).toBe(true);
    });
    
    it('handles incomplete days (arrival, no departure)', () => {
      const day3 = processed.find(p => p.date === '2023-10-03');
      expect(day3.workingHours).toBe(0); // Or current time if logic was to calculate ongoing
      expect(day3.breakHours).toBe(0);
      expect(day3.totalHours).toBe(0);
      expect(day3.isComplete).toBe(false);
      expect(day3.isIncomplete).toBe(true);
    });

    it('calculates hours correctly for a day with multiple breaks', () => {
      const day4 = processed.find(p => p.date === '2023-10-04');
      expect(day4.workingHours).toBe(7);
      expect(day4.breakHours).toBe(1);
      expect(day4.totalHours).toBe(8);
      expect(day4.isComplete).toBe(true);
    });
  });

  describe('calculateDayBreakTime', () => {
    it('should return 0 for a day with no breaks', () => {
      const dayEntries = mockEntries.filter(e => e.date_time.startsWith('2023-10-02'));
      const breakInfo = calculateDayBreakTime(dayEntries);
      expect(breakInfo.totalMinutes).toBe(0);
    });

    it('should calculate break time for a single break', () => {
      const dayEntries = mockEntries.filter(e => e.date_time.startsWith('2023-10-01'));
      const breakInfo = calculateDayBreakTime(dayEntries);
      expect(breakInfo.totalMinutes).toBe(60); // 1 hour
    });

    it('should calculate break time for multiple breaks', () => {
      const dayEntries = mockEntries.filter(e => e.date_time.startsWith('2023-10-04'));
      const breakInfo = calculateDayBreakTime(dayEntries);
      expect(breakInfo.totalMinutes).toBe(60); // 30 min + 30 min
    });

    it('should handle unclosed breaks (break_start without break_end)', () => {
        const dayEntries = [
            { date_time: '2023-10-05T09:00:00Z', tracking_type: 'arrival' },
            { date_time: '2023-10-05T12:00:00Z', tracking_type: 'break_start' },
            { date_time: '2023-10-05T17:00:00Z', tracking_type: 'departure' },
        ];
        const breakInfo = calculateDayBreakTime(dayEntries);
        expect(breakInfo.totalMinutes).toBe(0); // Unclosed break is not counted
    });
  });

  describe('getTodayStatus', () => {
    // Mock current date to be 2023-10-01 for these tests
    const mockTodayEntries = [
      { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival' },
      { date_time: '2023-10-01T12:00:00Z', tracking_type: 'break_start' },
    ];
    // Simulate Date.now() if getTodayStatus relies on it implicitly,
    // but it seems to derive "today" from entry.date_time.startsWith(today_date_string)
    // For this test, we'll pass entries that are all "today"

    it('identifies arrival and break_start correctly', () => {
      const status = getTodayStatus(mockTodayEntries);
      expect(status.arrival).toBeDefined();
      expect(status.breakStart).toBeDefined();
      expect(status.breakEnd).toBeUndefined();
      expect(status.departure).toBeUndefined();
      expect(status.isPresent).toBe(true);
      expect(status.isOnBreak).toBe(true);
    });
  });
  
  describe('calculateCurrentWorkingTime', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');
      // Set "now" to a specific time for predictable results
      // For entries on 2023-10-01
      jest.setSystemTime(new Date('2023-10-01T14:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calculates current working time correctly with ongoing session', () => {
      const entries = [{ date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival' }];
      // From 9:00 to 14:00 = 5 hours
      expect(calculateCurrentWorkingTime(entries)).toBeCloseTo(5);
    });

    it('calculates current working time with an ongoing break', () => {
      const entries = [
        { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival' },
        { date_time: '2023-10-01T12:00:00Z', tracking_type: 'break_start' },
      ];
      // Arrival at 9:00, break at 12:00. "Now" is 14:00.
      // Worked from 9:00 to 12:00 (3 hours). On break from 12:00 to 14:00.
      expect(calculateCurrentWorkingTime(entries)).toBeCloseTo(3);
    });

    it('calculates current working time with a completed break', () => {
      const entries = [
        { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival' },
        { date_time: '2023-10-01T12:00:00Z', tracking_type: 'break_start' },
        { date_time: '2023-10-01T13:00:00Z', tracking_type: 'break_end' },
      ];
      // Arrival at 9:00, break 12:00-13:00. "Now" is 14:00.
      // Worked 9:00-12:00 (3h) and 13:00-14:00 (1h). Total 4h.
      expect(calculateCurrentWorkingTime(entries)).toBeCloseTo(4);
    });

     it('returns 0 if not clocked in', () => {
      expect(calculateCurrentWorkingTime([])).toBe(0);
    });
  });


  describe('isWorkingDay and getExpectedHours', () => {
    it('isWorkingDay identifies weekdays correctly', () => {
      expect(isWorkingDay(parseISO('2023-10-02'))).toBe(true); // Monday
      expect(isWorkingDay(parseISO('2023-10-06'))).toBe(true); // Friday
      expect(isWorkingDay(parseISO('2023-10-07'))).toBe(false); // Saturday
      expect(isWorkingDay(parseISO('2023-10-08'))).toBe(false); // Sunday
    });

    it('getExpectedHours returns correct hours for default schedule', () => {
      expect(getExpectedHours(parseISO('2023-10-02'))).toBe(7); // Monday
      expect(getExpectedHours(parseISO('2023-10-07'))).toBe(0); // Saturday
    });
  });

  describe('getExpectedHoursForPeriod', () => {
    it('calculates expected hours for a full week (Mon-Fri)', () => {
      // Monday 2023-10-02 to Friday 2023-10-06
      expect(getExpectedHoursForPeriod('2023-10-02', '2023-10-06')).toBe(35); // 5 days * 7 hours
    });

    it('calculates expected hours for a period spanning a weekend', () => {
      // Friday 2023-10-06 to Monday 2023-10-09
      // Fri (7h), Sat (0h), Sun (0h), Mon (7h)
      expect(getExpectedHoursForPeriod('2023-10-06', '2023-10-09')).toBe(14);
    });

    it('calculates expected hours for a single working day', () => {
      expect(getExpectedHoursForPeriod('2023-10-02', '2023-10-02')).toBe(7);
    });

    it('calculates 0 for a weekend period', () => {
      expect(getExpectedHoursForPeriod('2023-10-07', '2023-10-08')).toBe(0);
    });
  });

  describe('calculateWeeklyStats and calculateMonthlyStats', () => {
    // Using entries from 2023-10-09 to 2023-10-11
    // Mon: 8h, Tue: 8h, Wed: 3h = Total 19h for the week in mockData
    // Need to ensure that `isThisWeek` and `isThisMonth` correctly interpret these dates
    // relative to when the test is run. For stable tests, mock Date.now().
    
    beforeAll(() => {
      jest.useFakeTimers('modern');
      // Set "now" to a date within the week/month of mock entries for stats
      jest.setSystemTime(new Date('2023-10-11T10:00:00Z')); // A Wednesday in that week
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calculateWeeklyStats calculates totals and averages for current week', () => {
      const stats = calculateWeeklyStats(mockEntries); // mockEntries contains data for this week
      expect(stats.totalWorkingHours).toBe(19); // 8+8+3
      expect(stats.workingDays).toBe(3); // Mon, Tue, Wed
      expect(stats.averageHoursPerDay).toBeCloseTo(19 / 3);
      expect(stats.entries.length).toBe(3); // Only the 3 days of the current week
    });

    it('calculateMonthlyStats calculates totals and averages for current month', () => {
      // All mock entries from Oct 1 to Oct 11 fall in the same month
      const stats = calculateMonthlyStats(mockEntries);
      // Day1 (7.5h) + Day2 (4h) + Day4 (7h) + Mon (8h) + Tue (8h) + Wed (3h) = 37.5h
      expect(stats.totalWorkingHours).toBe(37.5); 
      expect(stats.workingDays).toBe(6); // 6 completed days in October
      expect(stats.averageHoursPerDay).toBeCloseTo(37.5 / 6);
    });
  });
  
  describe('formatHours', () => {
    it('formats hours correctly', () => {
      expect(formatHours(7.5)).toBe('7h30');
      expect(formatHours(8)).toBe('8h');
      expect(formatHours(0.25)).toBe('0h15');
      expect(formatHours(0)).toBe('0h00');
      expect(formatHours(null)).toBe('0h00');
    });
  });
});
