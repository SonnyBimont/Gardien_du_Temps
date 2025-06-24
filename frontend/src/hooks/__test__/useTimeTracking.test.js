import { renderHook } from '@testing-library/react';
import { useTimeTracking } from '../useTimeTracking';

// Test basique pour vérifier que le hook fonctionne
describe('useTimeTracking', () => {
  test('should return all required functions and data', () => {
    const { result } = renderHook(() => useTimeTracking());
    
    // Vérifier que toutes les fonctions sont présentes
    expect(typeof result.current.handleClockAction).toBe('function');
    expect(typeof result.current.clockIn).toBe('function');
    expect(typeof result.current.clockOut).toBe('function');
    expect(typeof result.current.startBreak).toBe('function');
    expect(typeof result.current.endBreak).toBe('function');
    expect(typeof result.current.getTodayStatus).toBe('function');
    expect(typeof result.current.getPauses).toBe('function');
    expect(typeof result.current.isOnBreak).toBe('function');
    
    // Vérifier les booléens
    expect(typeof result.current.canClockIn).toBe('boolean');
    expect(typeof result.current.canPauseOrResume).toBe('boolean');
    expect(typeof result.current.canClockOut).toBe('boolean');
    
    // Vérifier les données
    expect(Array.isArray(result.current.myTodayEntries)).toBe(true);
  });
});