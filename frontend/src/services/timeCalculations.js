export const calculatePeriodObjective = (period, weeklyHours, annualHours) => {
  switch (period) {
    case 'current_week':
    case 'previous_week':
      return weeklyHours || 35;
    case 'current_month':
    case 'previous_month':
      return (weeklyHours || 35) * 4.33;
    case 'current_quarter':
    case 'previous_quarter':
      return (weeklyHours || 35) * 13;
    case 'current_year':
    case 'previous_year':
      return annualHours || ((weeklyHours || 35) * 52);
    case 'last_30_days':
      return (weeklyHours || 35) * 4.33;
    case 'last_90_days':
      return (weeklyHours || 35) * 13;
    default:
      return (weeklyHours || 35) * 4.33;
  }
};

export const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

export const formatDecimalToTime = (decimal) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
