import { TimeTrackingService } from '../timeTrackingService';

// Test basique pour vérifier que le service existe
describe('TimeTrackingService', () => {
  test('should have all required methods', () => {
    expect(typeof TimeTrackingService.clockIn).toBe('function');
    expect(typeof TimeTrackingService.clockOut).toBe('function');
    expect(typeof TimeTrackingService.startBreak).toBe('function');
    expect(typeof TimeTrackingService.endBreak).toBe('function');
    expect(typeof TimeTrackingService.getEntries).toBe('function');
  });
});