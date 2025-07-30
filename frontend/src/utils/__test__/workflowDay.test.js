/**
 * TESTS SIMPLES SANS DÉPENDANCES EXTERNES
 * Parfait pour présentation jury
 */

const timeUtils = {
  // Convertir minutes en format HH:MM
  formatDuration: (minutes) => {
    if (!minutes || minutes < 0) return '00:00';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  // Calculer temps de travail entre deux heures
  calculateWorkTime: (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
  },

  // Vérifier format email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Calculer pourcentage de présence
  calculateAttendanceRate: (presentDays, totalDays) => {
    if (!totalDays || totalDays <= 0) return 0;
    return Math.round((presentDays / totalDays) * 100);
  },

  // Déterminer statut basé sur heures travaillées
  getWorkStatus: (hoursWorked, expectedHours = 8) => {
    if (hoursWorked >= expectedHours) return 'complet';
    if (hoursWorked >= expectedHours * 0.75) return 'partiel';
    if (hoursWorked > 0) return 'insuffisant';
    return 'absent';
  }
};

describe('🔧 Utilitaires Simples - Tests Unitaires', () => {

  // TEST 1 : Formatage durée
  test('✅ formatDuration convertit les minutes en HH:MM', () => {
    expect(timeUtils.formatDuration(65)).toBe('01:05');
    expect(timeUtils.formatDuration(120)).toBe('02:00');
    expect(timeUtils.formatDuration(30)).toBe('00:30');
    expect(timeUtils.formatDuration(0)).toBe('00:00');
    expect(timeUtils.formatDuration(-10)).toBe('00:00');
    
    console.log('✅ Test formatDuration réussi');
  });

  // TEST 2 : Calcul temps de travail
  test('✅ calculateWorkTime calcule la différence entre deux heures', () => {
    expect(timeUtils.calculateWorkTime('09:00', '17:00')).toBe(480); // 8h
    expect(timeUtils.calculateWorkTime('14:30', '16:15')).toBe(105); // 1h45
    expect(timeUtils.calculateWorkTime('10:00', '10:30')).toBe(30);  // 30min
    expect(timeUtils.calculateWorkTime('17:00', '09:00')).toBe(0);   // Invalide
    expect(timeUtils.calculateWorkTime('', '17:00')).toBe(0);        // Erreur
    
    console.log('✅ Test calculateWorkTime réussi');
  });

  // TEST 3 : Validation email
  test('✅ isValidEmail valide le format des emails', () => {
    // Emails valides
    expect(timeUtils.isValidEmail('admin@gardien-temps.com')).toBe(true);
    expect(timeUtils.isValidEmail('user.test@example.org')).toBe(true);
    
    // Emails invalides
    expect(timeUtils.isValidEmail('email-sans-arobase')).toBe(false);
    expect(timeUtils.isValidEmail('@domain.com')).toBe(false);
    expect(timeUtils.isValidEmail('')).toBe(false);
    
    console.log('✅ Test isValidEmail réussi');
  });

  // TEST 4 : Calcul taux de présence
  test('✅ calculateAttendanceRate calcule le pourcentage de présence', () => {
    expect(timeUtils.calculateAttendanceRate(20, 22)).toBe(91); // 91%
    expect(timeUtils.calculateAttendanceRate(5, 5)).toBe(100);  // 100%
    expect(timeUtils.calculateAttendanceRate(0, 10)).toBe(0);   // 0%
    expect(timeUtils.calculateAttendanceRate(10, 0)).toBe(0);   // Division par 0
    
    console.log('✅ Test calculateAttendanceRate réussi');
  });

  // TEST 5 : Statut de travail
  test('✅ getWorkStatus détermine le statut basé sur les heures', () => {
    expect(timeUtils.getWorkStatus(8, 8)).toBe('complet');      // 8h/8h
    expect(timeUtils.getWorkStatus(9, 8)).toBe('complet');      // Heures sup
    expect(timeUtils.getWorkStatus(6, 8)).toBe('partiel');      // 75% = 6h
    expect(timeUtils.getWorkStatus(3, 8)).toBe('insuffisant');  // < 75%
    expect(timeUtils.getWorkStatus(0, 8)).toBe('absent');       // 0h
    
    console.log('✅ Test getWorkStatus réussi');
  });
});