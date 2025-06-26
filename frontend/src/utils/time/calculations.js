import { differenceInMinutes, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatTime, formatDate, formatDayName, formatHours } from './formatters';
import { getWorkDayStatus } from './validators';


// ===== FONCTION PRINCIPALE =====
export const calculateTotalHours = (entries) => {
  // Grouper par jour
  const dayGroups = entries.reduce((groups, entry) => {
    const date = entry.date_time.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  return Object.entries(dayGroups).map(([date, dayEntries]) => {
    const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
    const departure = dayEntries.find(e => e.tracking_type === 'departure');
    
    const breakStarts = dayEntries.filter(e => e.tracking_type === 'break_start');
    const breakEnds = dayEntries.filter(e => e.tracking_type === 'break_end');
    
    let workingHours = 0;
    let breakHours = 0;
    
    if (arrival && departure) {
      const start = new Date(arrival.date_time);
      const end = new Date(departure.date_time);
      let totalMinutes = (end - start) / (1000 * 60);
      
      // Soustraire toutes les pauses
      for (let i = 0; i < Math.min(breakStarts.length, breakEnds.length); i++) {
        const breakStart = new Date(breakStarts[i].date_time);
        const breakEnd = new Date(breakEnds[i].date_time);
        const breakDuration = (breakEnd - breakStart) / (1000 * 60);
        totalMinutes -= breakDuration;
        breakHours += breakDuration / 60;
      }
      
      workingHours = Math.max(0, totalMinutes / 60);
    }
    
    return {
      date,
      workingHours: Math.round(workingHours * 100) / 100,
      breakHours: Math.round(breakHours * 100) / 100,
      arrival: arrival ? formatTime(arrival.date_time) : null,
      departure: departure ? formatTime(departure.date_time) : null,
      breakStart: breakStarts[0] ? formatTime(breakStarts[0].date_time) : null,
      breakEnd: breakEnds[0] ? formatTime(breakEnds[0].date_time) : null,
      isComplete: !!(arrival && departure),
      status: arrival && departure ? 'complete' : arrival ? 'in_progress' : 'absent',
      formattedWorkingHours: formatHours(workingHours),
      dayName: formatDayName(date),
      formattedDate: formatDate(date)
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const calculateTotalHoursWithMultipleBreaks = calculateTotalHours;

// Compatibilité avec le timeStore
export const calculateWorkingHours = (entries) => {
  const processed = calculateTotalHours(entries);
  return processed.reduce((total, day) => total + day.workingHours, 0);
};

// ===== STATISTIQUES =====
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

// Obtenir le statut d'aujourd'hui
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
