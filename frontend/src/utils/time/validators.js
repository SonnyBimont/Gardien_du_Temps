export const getWorkDayStatus = (arrival, departure, breakStart, breakEnd) => {
  if (!arrival) return 'absent';
  if (arrival && !departure) {
    if (breakStart && !breakEnd) return 'en_pause';
    return 'present';
  }
  if (arrival && departure) return 'termine';
  return 'unknown';
};

export const isWorkingDay = (date) => {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

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