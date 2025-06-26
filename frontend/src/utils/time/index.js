// Exports principaux
export * from './calculations';
export * from './formatters';
export * from './validators';

// Export par défaut
export { calculateTotalHours as default } from './calculations';

// Re-exports pour compatibilité avec l'ancien timeCalculations.js
export { calculateTotalHours as calculateTotalHoursWithMultipleBreaks } from './calculations';
export { getTodayStatus } from './calculations';