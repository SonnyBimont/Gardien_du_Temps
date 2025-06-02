import { useTimeStore } from '../timeStore'; // Adjust path as needed
import api from '../../services/api'; // Adjust path as needed
import { getTodayStatus as getTodayStatusUtil } from '../../utils/timeCalculations';

// Mock the API service
jest.mock('../../services/api');
// Mock timeCalculations for getTodayStatus used in canPerformAction
jest.mock('../../utils/timeCalculations', () => ({
  ...jest.requireActual('../../utils/timeCalculations'), // Import and retain default behavior
  getTodayStatus: jest.fn(), // Mock specific function
}));


describe('useTimeStore', () => {
  let initialState;

  beforeEach(() => {
    // Reset store to initial state before each test
    initialState = useTimeStore.getState();
    useTimeStore.setState(initialState, true);
    // Clear all mock implementations and calls
    jest.clearAllMocks();
    getTodayStatusUtil.mockReturnValue({ // Default mock for getTodayStatus
        arrival: null,
        breakStart: null,
        breakEnd: null,
        departure: null,
    });
  });

  describe('getTimeSpentPerTask', () => {
    it('should calculate time spent on a task correctly from timeHistory', () => {
      const mockHistory = [
        { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival', task_id: 1 },
        { date_time: '2023-10-01T10:00:00Z', tracking_type: 'departure', task_id: 1 }, // 1 hour on task 1
        { date_time: '2023-10-01T11:00:00Z', tracking_type: 'arrival', task_id: 2 },
        { date_time: '2023-10-01T11:30:00Z', tracking_type: 'departure', task_id: 2 }, // 0.5 hours on task 2
        { date_time: '2023-10-01T14:00:00Z', tracking_type: 'arrival', task_id: 1 },
        { date_time: '2023-10-01T15:00:00Z', tracking_type: 'departure', task_id: 1 }, // 1 more hour on task 1
      ];
      useTimeStore.setState({ timeHistory: mockHistory });

      expect(useTimeStore.getState().getTimeSpentPerTask(1)).toBe(2);
      expect(useTimeStore.getState().getTimeSpentPerTask(2)).toBe(0.5);
      expect(useTimeStore.getState().getTimeSpentPerTask(3)).toBe(0);
    });

    it('should use cache for getTimeSpentPerTask', () => {
      const mockHistory = [
        { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival', task_id: 1 },
        { date_time: '2023-10-01T10:00:00Z', tracking_type: 'departure', task_id: 1 },
      ];
      useTimeStore.setState({ timeHistory: mockHistory });

      const result1 = useTimeStore.getState().getTimeSpentPerTask(1);
      // Modify history, but cache should prevent re-calculation immediately if called again for same task
      useTimeStore.setState({ timeHistory: [...mockHistory, { date_time: '2023-10-01T11:00:00Z', tracking_type: 'arrival', task_id: 1 }] });
      const result2 = useTimeStore.getState().getTimeSpentPerTask(1);
      
      expect(result1).toBe(1);
      expect(result2).toBe(1); // Should be cached value
      
      // Test cache expiry (requires advancing timers or more complex setup, simplified here)
      // For now, just check that the cache mechanism exists by looking at the state
      expect(useTimeStore.getState()._timeSpentPerTaskCache[1]).toBeDefined();
    });
  });

  describe('fetchEntriesForPeriod', () => {
    it('should fetch entries for a period and update reportEntries and reportStats', async () => {
      const mockUserId = 'user1';
      const mockStartDate = '2023-10-01';
      const mockEndDate = '2023-10-02';
      const mockApiData = [
        { date_time: '2023-10-01T09:00:00Z', tracking_type: 'arrival' },
        { date_time: '2023-10-01T17:00:00Z', tracking_type: 'departure' }, // 8 hours
        { date_time: '2023-10-02T09:00:00Z', tracking_type: 'arrival' },
        { date_time: '2023-10-02T13:00:00Z', tracking_type: 'departure' }, // 4 hours
      ];
      api.get.mockResolvedValue({ data: { success: true, data: mockApiData } });

      await useTimeStore.getState().fetchEntriesForPeriod(mockUserId, mockStartDate, mockEndDate);

      expect(api.get).toHaveBeenCalledWith(`/time-trackings/range?startDate=${mockStartDate}&endDate=${mockEndDate}&userId=${mockUserId}`);
      const state = useTimeStore.getState();
      expect(state.reportLoading).toBe(false);
      expect(state.reportEntries.length).toBe(2); // 2 processed days
      expect(state.reportEntries[0].date).toBe('2023-10-01'); // Assuming sort order or check content
      expect(state.reportEntries[0].workingHours).toBe(8);
      expect(state.reportEntries[1].workingHours).toBe(4);
      
      expect(state.reportStats.totalWorkingHours).toBe(12);
      expect(state.reportStats.workingDays).toBe(2);
      expect(state.reportStats.averageHoursPerDay).toBe(6);
      expect(state.error).toBeNull();
    });

    it('should handle API error for fetchEntriesForPeriod', async () => {
      api.get.mockRejectedValue({ response: { data: { message: 'API Error' } } });
      await useTimeStore.getState().fetchEntriesForPeriod('user1', '2023-10-01', '2023-10-02');
      const state = useTimeStore.getState();
      expect(state.reportLoading).toBe(false);
      expect(state.reportEntries.length).toBe(0);
      expect(state.error).toBe('API Error');
    });
  });

  describe('canPerformAction', () => {
    it('should allow arrival if not arrived yet', () => {
      getTodayStatusUtil.mockReturnValue({ arrival: null });
      expect(useTimeStore.getState().canPerformAction('arrival')).toBe(true);
    });

    it('should not allow arrival if already arrived', () => {
      getTodayStatusUtil.mockReturnValue({ arrival: { date_time: '...', tracking_type: 'arrival' } });
      expect(useTimeStore.getState().canPerformAction('arrival')).toBe(false);
    });

    it('should allow break_start if arrived, not on break, and not departed', () => {
      getTodayStatusUtil.mockReturnValue({
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: null,
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('break_start')).toBe(true);
    });
    
    it('should not allow break_start if already on break', () => {
      getTodayStatusUtil.mockReturnValue({
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: { date_time: '...', tracking_type: 'break_start' },
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('break_start')).toBe(false);
    });

    it('should allow break_end if on break and not departed', () => {
       getTodayStatusUtil.mockReturnValue({
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: { date_time: '...', tracking_type: 'break_start' },
        breakEnd: null,
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('break_end')).toBe(true);
    });

    it('should allow departure if arrived and not already departed (and break ended if started)', () => {
      getTodayStatusUtil.mockReturnValue({
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: null, // Scenario 1: No break taken
        breakEnd: null,
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('departure')).toBe(true);

      getTodayStatusUtil.mockReturnValue({ // Scenario 2: Break taken and ended
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: { date_time: '...', tracking_type: 'break_start' },
        breakEnd: { date_time: '...', tracking_type: 'break_end' },
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('departure')).toBe(true);
    });
    
    it('should not allow departure if on break (break_start but no break_end)', () => {
       getTodayStatusUtil.mockReturnValue({
        arrival: { date_time: '...', tracking_type: 'arrival' },
        breakStart: { date_time: '...', tracking_type: 'break_start' },
        breakEnd: null,
        departure: null,
      });
      expect(useTimeStore.getState().canPerformAction('departure')).toBe(false);
    });
  });
  
  // Test specific actions like clockIn, clockOut etc.
  // These mostly use performAction which in turn calls fetchTodayEntries.
  // We can test one of them to ensure the flow.
  describe('clockIn action', () => {
    it('should call performAction and then fetchTodayEntries on success', async () => {
      api.post.mockResolvedValue({ data: { success: true, data: { id: 'entry1' } } });
      // Mock fetchTodayEntries to check if it's called
      const fetchTodayEntriesMock = jest.fn().mockResolvedValue({ success: true, data: [] });
      useTimeStore.setState({ fetchTodayEntries: fetchTodayEntriesMock });

      await useTimeStore.getState().clockIn(123, 'test comment');
      
      expect(api.post).toHaveBeenCalledWith('/time-trackings/clock-in', { task_id: 123, comment: 'test comment' });
      expect(fetchTodayEntriesMock).toHaveBeenCalled();
      expect(useTimeStore.getState().error).toBeNull();
    });

    it('should use fallback to recordTimeEntry if specific endpoint fails with 404', async () => {
      api.post.mockImplementation(async (url) => {
        if (url === '/time-trackings/clock-in') {
          const error = new Error('Not Found');
          // @ts-ignore
          error.response = { status: 404, data: { message: 'Not Found' } };
          throw error;
        }
        if (url === '/time-trackings') { // This is the fallback
          return { data: { success: true, data: { id: 'fallbackEntry'} } };
        }
        return { data: { success: false, message: 'Unexpected URL' } };
      });
      
      const fetchTodayEntriesMock = jest.fn().mockResolvedValue({ success: true, data: [] });
      useTimeStore.setState({ fetchTodayEntries: fetchTodayEntriesMock });

      const result = await useTimeStore.getState().clockIn(123, 'test comment');
      
      expect(api.post).toHaveBeenCalledWith('/time-trackings/clock-in', { task_id: 123, comment: 'test comment' });
      expect(api.post).toHaveBeenCalledWith('/time-trackings', expect.objectContaining({
        tracking_type: 'arrival',
        task_id: 123,
        comment: 'test comment'
      }));
      expect(fetchTodayEntriesMock).toHaveBeenCalledTimes(2); // Once by performAction, once by recordTimeEntry
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('fallbackEntry');
    });
  });
});
