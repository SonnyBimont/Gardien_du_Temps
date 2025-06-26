import { formatHours } from "../time/formatters";
import { getCalendarYear } from "../calendar/calendarYearUtils";
import { YEAR_TYPES } from "../calendar/constants";

export const getMonthlyRealizedHours = (realizedHours, currentMonth, selectedYear, yearType) => {
  if (!realizedHours || Object.keys(realizedHours).length === 0) {
    return '0h00';
  }
  
  try {
    const calendarYear = getCalendarYear(currentMonth, selectedYear, yearType);
    
    const monthlyTotal = Object.entries(realizedHours)
      .filter(([date, data]) => {
        if (!date || !data) return false;
        
        const workDate = new Date(date + 'T00:00:00');
        if (isNaN(workDate.getTime())) return false;
        
        return workDate.getFullYear() === calendarYear && workDate.getMonth() === currentMonth;
      })
      .reduce((total, [, data]) => {
        const hours = parseFloat(data.workingHours) || 0;
        return total + hours;
      }, 0);
    
    return formatHours(monthlyTotal);
    
  } catch (error) {
    console.error('Erreur calcul heures mensuelles réalisées:', error);
    return '0h00';
  }
};

export const calculateMonthlyStats = (realizedHours, selectedYear, currentMonth) => {
  const monthData = Object.entries(realizedHours)
    .filter(([date]) => {
      const d = new Date(date);
      return d.getFullYear() === selectedYear && d.getMonth() === currentMonth;
    })
    .reduce((acc, [, data]) => acc + (data.workingHours || 0), 0);

  return Math.round(monthData * 100) / 100;
};