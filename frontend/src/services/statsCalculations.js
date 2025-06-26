import { CheckCircle, AlertCircle } from 'lucide-react';

export const calculateVariance = (numbers) => {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  };

export const getPerformanceStatus = (completionRate) => {
    if (completionRate >= 100) return { label: 'Objectif atteint', color: 'green', icon: CheckCircle };
    if (completionRate >= 90) return { label: 'Très bien', color: 'blue', icon: CheckCircle };
    if (completionRate >= 75) return { label: 'Satisfaisant', color: 'yellow', icon: AlertCircle };
    if (completionRate >= 60) return { label: 'À améliorer', color: 'orange', icon: AlertCircle };
    return { label: 'Insuffisant', color: 'red', icon: AlertCircle };
  };

export const getMostProductiveDay = (workingDays) => {
    const completeDays = workingDays.filter(day => day.isComplete);
    if (completeDays.length === 0) return 'Aucun';
    
    const maxDay = completeDays.reduce((max, day) => 
      day.hoursWorked > max.hoursWorked ? day : max
    );
    
    return `${maxDay.dayName} (${maxDay.hoursWorked}h)`;
  };

export const getConsistencyRating = (score) => {
    if (score >= 90) return { label: 'Très régulier', color: 'green' };
    if (score >= 75) return { label: 'Régulier', color: 'blue' };
    if (score >= 60) return { label: 'Moyennement régulier', color: 'yellow' };
    return { label: 'Irrégulier', color: 'red' };
  };

export const getWorkDayStatus = (arrival, departure, breakStart, breakEnd) => {
    if (!arrival) return 'absent';
    if (arrival && !departure) return 'en_cours';
    if (arrival && departure) return 'complet';
    return 'incomplet';
  };