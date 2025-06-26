export const formatTime = (dateTime) => {
  try {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '--:--';
  }
};

export const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatDayName = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatHours = (hours) => {
  if (!hours || hours === 0) return '0h00';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) return `${h}h00`;
  return `${h}h${m.toString().padStart(2, '0')}`;
};

export const formatMinutesToHours = (minutes) => {
  return formatHours(minutes / 60);
};

export const formatDecimalHours = (hours) => {
  return formatHours(hours);
};

export const formatDateShort = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};