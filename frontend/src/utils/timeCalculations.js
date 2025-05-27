// src/utils/timeCalculations.js
import { format, parseISO, differenceInMinutes, startOfWeek, startOfMonth, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// Calcul des heures totales avec données structurées
export const calculateTotalHours = (entries) => {
  const grouped = groupEntriesByDate(entries);
  
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b) - new Date(a)) // Trier par date décroissante
    .map(([date, dayEntries]) => {
      const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
      const departure = dayEntries.find(e => e.tracking_type === 'departure');
      const breakStart = dayEntries.find(e => e.tracking_type === 'break_start');
      const breakEnd = dayEntries.find(e => e.tracking_type === 'break_end');
      
      let totalMinutes = 0;
      let breakMinutes = 0;
      let workingMinutes = 0;
      
      // Calculer le temps total présent
      if (arrival && departure) {
        totalMinutes = differenceInMinutes(new Date(departure.date_time), new Date(arrival.date_time));
        
        // Calculer le temps de pause
        if (breakStart && breakEnd) {
          breakMinutes = differenceInMinutes(new Date(breakEnd.date_time), new Date(breakStart.date_time));
        }
        
        // Temps de travail effectif
        workingMinutes = totalMinutes - breakMinutes;
      }
      
      const totalHours = Math.round(totalMinutes / 60 * 100) / 100;
      const workingHours = Math.round(workingMinutes / 60 * 100) / 100;
      const breakHours = Math.round(breakMinutes / 60 * 100) / 100;
      
      return {
        date,
        formattedDate: formatDate(date),
        dayName: formatDayName(date),
        arrival: arrival ? formatTime(arrival.date_time) : null,
        breakStart: breakStart ? formatTime(breakStart.date_time) : null,
        breakEnd: breakEnd ? formatTime(breakEnd.date_time) : null,
        departure: departure ? formatTime(departure.date_time) : null,
        totalMinutes,
        workingMinutes,
        breakMinutes,
        totalHours: totalHours > 0 ? totalHours : 0,
        workingHours: workingHours > 0 ? workingHours : 0,
        breakHours: breakHours > 0 ? breakHours : 0,
        formattedTotalHours: formatHours(totalHours),
        formattedWorkingHours: formatHours(workingHours),
        formattedBreakHours: formatHours(breakHours),
        isComplete: !!(arrival && departure),
        isIncomplete: !!(arrival && !departure),
        status: getWorkDayStatus(arrival, departure, breakStart, breakEnd)
      };
    });
};

// compatibilité avec le timeStore
export const calculateWorkingHours = (entries) => {
  const processed = calculateTotalHours(entries);
  return processed.reduce((total, day) => total + day.workingHours, 0);
};
// Optimisation pour de gros volumes de données
export const calculateTotalHoursOptimized = (entries, options = {}) => {
  const { 
    sortDesc = true, 
    includeIncomplete = true,
    maxDays = 365 // Limiter pour la performance
  } = options;
  
  const grouped = groupEntriesByDate(entries);
  const sortedEntries = Object.entries(grouped);
  
  // Limiter le nombre de jours si nécessaire
  const limitedEntries = maxDays ? sortedEntries.slice(0, maxDays) : sortedEntries;
  
  if (sortDesc) {
    limitedEntries.sort(([a], [b]) => new Date(b) - new Date(a));
  }
  
  return limitedEntries.map(([date, dayEntries]) => {
    // Votre logique existante...
    const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
    const departure = dayEntries.find(e => e.tracking_type === 'departure');
    const breakStart = dayEntries.find(e => e.tracking_type === 'break_start');
    const breakEnd = dayEntries.find(e => e.tracking_type === 'break_end');
    
    let totalMinutes = 0;
    let breakMinutes = 0;
    let workingMinutes = 0;
    
    if (arrival && departure) {
      totalMinutes = differenceInMinutes(new Date(departure.date_time), new Date(arrival.date_time));
      
      if (breakStart && breakEnd) {
        breakMinutes = differenceInMinutes(new Date(breakEnd.date_time), new Date(breakStart.date_time));
      }
      
      workingMinutes = totalMinutes - breakMinutes;
    }
    
    // Optimisation : éviter les calculs si journée incomplète et non demandée
    if (!includeIncomplete && (!arrival || !departure)) {
      return null;
    }
    
    const totalHours = Math.round(totalMinutes / 60 * 100) / 100;
    const workingHours = Math.round(workingMinutes / 60 * 100) / 100;
    const breakHours = Math.round(breakMinutes / 60 * 100) / 100;
    
    return {
      date,
      formattedDate: formatDate(date),
      dayName: formatDayName(date),
      arrival: arrival ? formatTime(arrival.date_time) : null,
      breakStart: breakStart ? formatTime(breakStart.date_time) : null,
      breakEnd: breakEnd ? formatTime(breakEnd.date_time) : null,
      departure: departure ? formatTime(departure.date_time) : null,
      totalMinutes,
      workingMinutes,
      breakMinutes,
      totalHours: totalHours > 0 ? totalHours : 0,
      workingHours: workingHours > 0 ? workingHours : 0,
      breakHours: breakHours > 0 ? breakHours : 0,
      formattedTotalHours: formatHours(totalHours),
      formattedWorkingHours: formatHours(workingHours),
      formattedBreakHours: formatHours(breakHours),
      isComplete: !!(arrival && departure),
      isIncomplete: !!(arrival && !departure),
      status: getWorkDayStatus(arrival, departure, breakStart, breakEnd)
    };
  }).filter(Boolean); // ✅ Retirer les null
};

// Grouper les entrées par date
export const groupEntriesByDate = (entries) => {
  return entries.reduce((acc, entry) => {
    const date = entry.date_time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});
};

// Formatage du temps
export const formatTime = (dateTime) => {
  try {
    return format(parseISO(dateTime), 'HH:mm', { locale: fr });
  } catch (error) {
    console.error('Erreur formatage time:', error);
    return '--:--';
  }
};

// Formatage de la date
export const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return dateString;
  }
};

// Formatage de la date courte
export const formatDateShort = (dateString) => {
  try {
    return format(parseISO(dateString), 'dd/MM', { locale: fr });
  } catch (error) {
    console.error('Erreur formatage date courte:', error);
    return dateString;
  }
};

// Formatage du nom du jour
export const formatDayName = (dateString) => {
  try {
    return format(parseISO(dateString), 'EEEE', { locale: fr });
  } catch (error) {
    console.error('Erreur formatage jour:', error);
    return '';
  }
};

// Formatage des heures
export const formatHours = (hours) => {
  if (!hours || hours === 0) return '0h00';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
};

// Formatage des minutes en heures
export const formatMinutesToHours = (minutes) => {
  return formatHours(minutes / 60);
};

// Obtenir le statut du jour actuel
export const getTodayStatus = (entries) => {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(entry => 
    entry.date_time.startsWith(today)
  );
  
  const arrival = todayEntries.find(e => e.tracking_type === 'arrival');
  const breakStart = todayEntries.find(e => e.tracking_type === 'break_start');
  const breakEnd = todayEntries.find(e => e.tracking_type === 'break_end');
  const departure = todayEntries.find(e => e.tracking_type === 'departure');
  
  return {
    arrival,
    breakStart,
    breakEnd,
    departure,
    isPresent: !!(arrival && !departure),
    isOnBreak: !!(breakStart && !breakEnd),
    hasLeft: !!departure,
    canTakeBreak: !!(arrival && !breakStart && !departure),
    canEndBreak: !!(breakStart && !breakEnd && !departure),
    canLeave: !!(arrival && (!breakStart || breakEnd) && !departure)
  };
};

// Obtenir le statut d'une journée de travail
export const getWorkDayStatus = (arrival, departure, breakStart, breakEnd) => {
  if (!arrival) return 'not_started';
  if (arrival && !departure) {
    if (breakStart && !breakEnd) return 'on_break';
    return 'in_progress';
  }
  if (arrival && departure) return 'completed';
  return 'unknown';
};

// Calculer les statistiques hebdomadaires
export const calculateWeeklyStats = (entries) => {
  const weekEntries = entries.filter(entry => isThisWeek(parseISO(entry.date_time), { locale: fr }));
  const processedWeek = calculateTotalHours(weekEntries);
  
  const totalWorkingHours = processedWeek.reduce((sum, day) => sum + day.workingHours, 0);
  const totalBreakHours = processedWeek.reduce((sum, day) => sum + day.breakHours, 0);
  const workingDays = processedWeek.filter(day => day.isComplete).length;
  
  return {
    totalWorkingHours,
    totalBreakHours,
    workingDays,
    averageHoursPerDay: workingDays > 0 ? totalWorkingHours / workingDays : 0,
    formattedTotalHours: formatHours(totalWorkingHours),
    formattedAverageHours: formatHours(workingDays > 0 ? totalWorkingHours / workingDays : 0),
    entries: processedWeek
  };
};

// Calculer les statistiques mensuelles
export const calculateMonthlyStats = (entries) => {
  const monthEntries = entries.filter(entry => isThisMonth(parseISO(entry.date_time)));
  const processedMonth = calculateTotalHours(monthEntries);
  
  const totalWorkingHours = processedMonth.reduce((sum, day) => sum + day.workingHours, 0);
  const totalBreakHours = processedMonth.reduce((sum, day) => sum + day.breakHours, 0);
  const workingDays = processedMonth.filter(day => day.isComplete).length;
  
  return {
    totalWorkingHours,
    totalBreakHours,
    workingDays,
    averageHoursPerDay: workingDays > 0 ? totalWorkingHours / workingDays : 0,
    formattedTotalHours: formatHours(totalWorkingHours),
    formattedAverageHours: formatHours(workingDays > 0 ? totalWorkingHours / workingDays : 0),
    entries: processedMonth
  };
};

// Calculer le temps de travail en cours
export const calculateCurrentWorkingTime = (todayEntries) => {
  const status = getTodayStatus(todayEntries);
  
  if (!status.arrival) return 0;
  
  const now = new Date();
  const arrivalTime = new Date(status.arrival.date_time);
  let workingMinutes = differenceInMinutes(now, arrivalTime);
  
  // Soustraire le temps de pause si en cours
  if (status.breakStart && !status.breakEnd) {
    const breakStartTime = new Date(status.breakStart.date_time);
    const breakMinutes = differenceInMinutes(now, breakStartTime);
    workingMinutes -= breakMinutes;
  }
  
  // Soustraire le temps de pause terminée
  if (status.breakStart && status.breakEnd) {
    const breakStartTime = new Date(status.breakStart.date_time);
    const breakEndTime = new Date(status.breakEnd.date_time);
    const breakMinutes = differenceInMinutes(breakEndTime, breakStartTime);
    workingMinutes -= breakMinutes;
  }
  
  return Math.max(0, workingMinutes / 60); // Retourner en heures
};

// Obtenir les heures prévues (configurable)
export const getExpectedHours = (date = new Date()) => {
  const dayOfWeek = date.getDay();
  
  // Configuration par défaut (peut être externalisée)
  const weeklySchedule = {
    0: 0,    // Dimanche
    1: 7,    // Lundi
    2: 7,    // Mardi
    3: 7,    // Mercredi
    4: 7,    // Jeudi
    5: 7,    // Vendredi
    6: 0     // Samedi
  };
  
  return weeklySchedule[dayOfWeek] || 0;
};

// Calculer les heures supplémentaires
export const calculateOvertime = (workedHours, expectedHours = 7) => {
  const overtime = workedHours - expectedHours;
  return {
    overtime: Math.max(0, overtime),
    undertime: Math.max(0, -overtime),
    formattedOvertime: formatHours(Math.max(0, overtime)),
    formattedUndertime: formatHours(Math.max(0, -overtime))
  };
};

// Vérifier si une journée est un jour ouvrable
export const isWorkingDay = (date) => {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // Lundi à Vendredi
};

// Obtenir la période de la semaine en cours
export const getCurrentWeekRange = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Commencer le lundi
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    formattedStart: format(start, 'dd/MM', { locale: fr }),
    formattedEnd: format(end, 'dd/MM', { locale: fr })
  };
};

// Obtenir la période du mois en cours
export const getCurrentMonthRange = () => {
  const start = startOfMonth(new Date());
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    formattedStart: format(start, 'dd/MM', { locale: fr }),
    formattedEnd: format(end, 'dd/MM', { locale: fr }),
    monthName: format(start, 'MMMM yyyy', { locale: fr })
  };
};

// Valider un pointage
export const validateTimeEntry = (type, currentStatus) => {
  const validTransitions = {
    arrival: () => !currentStatus.arrival,
    break_start: () => currentStatus.arrival && !currentStatus.breakStart && !currentStatus.departure,
    break_end: () => currentStatus.breakStart && !currentStatus.breakEnd && !currentStatus.departure,
    departure: () => currentStatus.arrival && !currentStatus.departure && 
                     (!currentStatus.breakStart || currentStatus.breakEnd)
  };
  
  return validTransitions[type] ? validTransitions[type]() : false;
};

// Exporter un résumé des temps
export const exportTimeEntries = (entries, format = 'csv') => {
  const processed = calculateTotalHours(entries);
  
  if (format === 'csv') {
    const headers = ['Date', 'Arrivée', 'Début pause', 'Fin pause', 'Départ', 'Heures travaillées'];
    const rows = processed.map(day => [
      day.formattedDate,
      day.arrival || '',
      day.breakStart || '',
      day.breakEnd || '',
      day.departure || '',
      day.formattedWorkingHours
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  // Format JSON par défaut
  return JSON.stringify(processed, null, 2);
};

// Utilitaire pour déboguer
export const debugTimeEntry = (entry) => {
  console.group(`🕐 Debug Time Entry - ${entry.date}`);
  console.log('Arrival:', entry.arrival || 'Non pointé');
  console.log('Break Start:', entry.breakStart || 'Pas de pause');
  console.log('Break End:', entry.breakEnd || 'Pause non terminée');
  console.log('Departure:', entry.departure || 'Non pointé');
  console.log('Working Hours:', entry.formattedWorkingHours);
  console.log('Status:', entry.status);
  console.groupEnd();
};


// Calculer le temps de pause total d'une journée
export const calculateDayBreakTime = (dayEntries) => {
  const breaks = [];
  let currentBreakStart = null;
  
  dayEntries
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
    .forEach(entry => {
      if (entry.tracking_type === 'break_start') {
        currentBreakStart = entry.date_time;
      } else if (entry.tracking_type === 'break_end' && currentBreakStart) {
        breaks.push({
          start: currentBreakStart,
          end: entry.date_time,
          duration: differenceInMinutes(new Date(entry.date_time), new Date(currentBreakStart))
        });
        currentBreakStart = null;
      }
    });
  
  const totalBreakMinutes = breaks.reduce((sum, breakPeriod) => sum + breakPeriod.duration, 0);
  
  return {
    breaks,
    totalMinutes: totalBreakMinutes,
    totalHours: Math.round(totalBreakMinutes / 60 * 100) / 100,
    formattedTotal: formatMinutesToHours(totalBreakMinutes)
  };
};

// Analyser les patterns de travail
export const analyzeWorkPatterns = (entries) => {
  const processed = calculateTotalHours(entries);
  const workingDays = processed.filter(day => day.isComplete);
  
  if (workingDays.length === 0) {
    return {
      averageArrival: null,
      averageDeparture: null,
      averageWorkingHours: 0,
      mostCommonArrivalHour: null,
      mostCommonDepartureHour: null
    };
  }
  
  // Moyennes des heures d'arrivée/départ
  const arrivalTimes = workingDays.map(day => {
    const [hours, minutes] = day.arrival.split(':').map(Number);
    return hours + minutes / 60;
  });
  
  const departureTimes = workingDays.map(day => {
    const [hours, minutes] = day.departure.split(':').map(Number);
    return hours + minutes / 60;
  });
  
  const averageArrival = arrivalTimes.reduce((sum, time) => sum + time, 0) / arrivalTimes.length;
  const averageDeparture = departureTimes.reduce((sum, time) => sum + time, 0) / departureTimes.length;
  
  // Heures les plus fréquentes
  const arrivalHours = arrivalTimes.map(time => Math.floor(time));
  const departureHours = departureTimes.map(time => Math.floor(time));
  
  const mostCommonArrivalHour = getMostFrequent(arrivalHours);
  const mostCommonDepartureHour = getMostFrequent(departureHours);
  
  return {
    averageArrival: formatDecimalToTime(averageArrival),
    averageDeparture: formatDecimalToTime(averageDeparture),
    averageWorkingHours: workingDays.reduce((sum, day) => sum + day.workingHours, 0) / workingDays.length,
    mostCommonArrivalHour,
    mostCommonDepartureHour,
    totalWorkingDays: workingDays.length,
    consistency: calculateConsistency(arrivalTimes, departureTimes)
  };
};

// Fonction utilitaire pour trouver l'élément le plus fréquent
const getMostFrequent = (arr) => {
  const frequency = {};
  arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
};

// Convertir décimal en format HH:MM
const formatDecimalToTime = (decimal) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculer la régularité des horaires
const calculateConsistency = (arrivalTimes, departureTimes) => {
  const arrivalVariance = calculateVariance(arrivalTimes);
  const departureVariance = calculateVariance(departureTimes);
  
  // Plus la variance est faible, plus c'est régulier (score sur 100)
  const arrivalScore = Math.max(0, 100 - arrivalVariance * 10);
  const departureScore = Math.max(0, 100 - departureVariance * 10);
  
  return {
    arrival: Math.round(arrivalScore),
    departure: Math.round(departureScore),
    overall: Math.round((arrivalScore + departureScore) / 2)
  };
};

const calculateVariance = (numbers) => {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
};

// Générer un rapport de productivité
export const generateProductivityReport = (entries, expectedHoursPerDay = 7) => {
  const processed = calculateTotalHours(entries);
  const workingDays = processed.filter(day => day.isComplete);
  
  const totalWorkedHours = workingDays.reduce((sum, day) => sum + day.workingHours, 0);
  const expectedTotalHours = workingDays.length * expectedHoursPerDay;
  const efficiency = expectedTotalHours > 0 ? (totalWorkedHours / expectedTotalHours) * 100 : 0;
  
  const overtime = workingDays.filter(day => day.workingHours > expectedHoursPerDay);
  const undertime = workingDays.filter(day => day.workingHours < expectedHoursPerDay);
  
  return {
    period: {
      totalDays: processed.length,
      workingDays: workingDays.length,
      incompleteDays: processed.filter(day => day.isIncomplete).length
    },
    hours: {
      totalWorked: Math.round(totalWorkedHours * 100) / 100,
      expectedTotal: expectedTotalHours,
      difference: Math.round((totalWorkedHours - expectedTotalHours) * 100) / 100,
      averagePerDay: workingDays.length > 0 ? Math.round((totalWorkedHours / workingDays.length) * 100) / 100 : 0
    },
    efficiency: {
      percentage: Math.round(efficiency * 100) / 100,
      rating: getEfficiencyRating(efficiency)
    },
    patterns: {
      overtimeDays: overtime.length,
      undertimeDays: undertime.length,
      perfectDays: workingDays.filter(day => Math.abs(day.workingHours - expectedHoursPerDay) < 0.1).length
    },
    analysis: analyzeWorkPatterns(entries)
  };
};

const getEfficiencyRating = (efficiency) => {
  if (efficiency >= 95) return 'Excellent';
  if (efficiency >= 85) return 'Très bien';
  if (efficiency >= 75) return 'Bien';
  if (efficiency >= 65) return 'Acceptable';
  return 'À améliorer';
};