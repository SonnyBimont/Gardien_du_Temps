import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTimeStore } from '../stores/timeStore';
import { logger } from '../utils/logger';
import { calculateTotalHours } from '../utils/time/calculations';
import { calculatePeriodObjective, formatDecimalToTime } from './timeCalculations';

// Services pour la gestion des équipes
export const calculateComprehensiveStats = (entries, animator, period, dateRange) => {
  logger.log('🔄 Calcul des stats complètes...');
  logger.log('📊 Entrées reçues:', entries.length);
  logger.log('📋 Première entrée:', entries[0]);
  
  if (!entries || entries.length === 0) {
    logger.log('⚠️ Aucune entrée, retour stats vides');
    return createEmptyStats(animator, period, dateRange);
  }

  const processedDays = calculateTotalHours(entries);
  logger.log('📈 Jours traités:', processedDays.length);
  logger.log('📊 Premier jour traité:', processedDays[0]);
  
  if (processedDays.length === 0) {
    logger.log('⚠️ Aucun jour traité');
    return createEmptyStats(animator, period, dateRange);
  }

  // Calculs basiques
  const weeklyObjective = animator.weekly_hours || 35;
  const annualObjective = animator.annual_hours;
  
  let periodObjective;
  switch (period) {
    case 'current_week':
    case 'previous_week':
      periodObjective = weeklyObjective;
      break;
    case 'current_month':
    case 'previous_month':
    case 'last_30_days':
      periodObjective = weeklyObjective * 4.33;
      break;
    case 'current_year':
    case 'previous_year':
      periodObjective = annualObjective || (weeklyObjective * 52);
      break;
    default:
      periodObjective = weeklyObjective * 4.33;
  }
  
  const totalHours = processedDays.reduce((sum, day) => sum + (day.workingHours || 0), 0);
  const completeDays = processedDays.filter(day => day.isComplete).length;
  const averagePerDay = completeDays > 0 ? totalHours / completeDays : 0;
  const completionRate = periodObjective > 0 ? (totalHours / periodObjective) * 100 : 0;
  
  const workingDays = processedDays;
  
  logger.log('✅ Working days créés:', workingDays.length);
  logger.log('📊 Premier working day:', workingDays[0]);
  
  // Calculs de patterns (version simple)
  const arrivalTimes = workingDays
    .filter(day => day.arrival)
    .map(day => {
      const [hours, minutes] = day.arrival.split(':').map(Number);
      return hours + minutes / 60;
    });
  
  const averageArrival = arrivalTimes.length > 0 
    ? arrivalTimes.reduce((sum, time) => sum + time, 0) / arrivalTimes.length 
    : 0;

  const formatDecimalToTime = (decimal) => {
    if (!decimal || decimal === 0) return '--:--';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const result = {
    animator,
    period: {
      type: period,
      label: dateRange.label,
      start: dateRange.start,
      end: dateRange.end,
      totalDays: workingDays.length
    },
    hours: {
      total: Math.round(totalHours * 100) / 100,
      objective: periodObjective,
      remaining: Math.max(0, periodObjective - totalHours),
      variance: Math.round((totalHours - periodObjective) * 100) / 100,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      totalBreakTime: processedDays.reduce((sum, day) => sum + (day.breakHours || 0), 0)
    },
    performance: {
      completionRate: Math.round(completionRate),
      completeDays,
      status: { label: completionRate >= 90 ? 'Bon' : 'À améliorer', color: completionRate >= 90 ? 'green' : 'orange', icon: AlertCircle },
      isOnTrack: completionRate >= 90,
      needsAttention: completionRate < 75
    },
    patterns: {
      averageArrival: formatDecimalToTime(averageArrival),
      punctualityScore: Math.round(Math.max(0, 100 - (arrivalTimes.length > 1 ? 10 : 0))),
      mostProductiveDay: workingDays.length > 0 ? (workingDays.reduce((best, day) => day.workingHours > best.workingHours ? day : best, workingDays[0]).dayName || 'Inconnu') : 'Aucun',
      consistency: { label: 'Régulier', color: 'blue' }
    },
    workingDays: workingDays, // ✅ IMPORTANT: Les données pour le tableau
    lastUpdate: new Date().toISOString()
  };
  
  logger.log('✅ Stats complètes calculées:', result);
  logger.log('📊 Working days dans result:', result.workingDays.length);
  return result;
};

  // Fonction utilitaire pour calculer l'objectif de période
export const createEmptyStats = (animator, period, dateRange) => {
  const weeklyObjective = animator?.weekly_hours || 35;
  const annualObjective = animator?.annual_hours;
  const periodObjective = calculatePeriodObjective(period, weeklyObjective, annualObjective);
  
  return {
    animator: animator || { first_name: 'Inconnu', last_name: '', weekly_hours: 35 },
    period: {
      type: period,
      label: dateRange.label,
      start: dateRange.start,
      end: dateRange.end,
      totalDays: 0
    },
    hours: {
      total: 0,
      objective: periodObjective,
      remaining: periodObjective,
      variance: -periodObjective,
      averagePerDay: 0,
      totalBreakTime: 0
    },
    performance: {
      completionRate: 0,
      completeDays: 0,
      status: { label: 'Aucune donnée', color: 'gray', icon: AlertCircle },
      isOnTrack: false,
      needsAttention: true
    },
    patterns: {
      averageArrival: '--:--',
      punctualityScore: 0,
      mostProductiveDay: 'Aucun',
      consistency: { label: 'Aucune donnée', color: 'gray' }
    },
    workingDays: [],
    lastUpdate: new Date().toISOString()
  };
};