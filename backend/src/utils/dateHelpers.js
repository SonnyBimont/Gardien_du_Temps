
// Calculer le début et fin de semaine (Lundi à Dimanche)
export const getCurrentWeekRange = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Dimanche, 1 = Lundi...
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Ajuster pour commencer lundi
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

// Calculer le début et fin de mois (1er au dernier jour)
export const getCurrentMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Calculer le début et fin d'année (Janvier à Décembre)
export const getCurrentYearRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1); // 1er janvier
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), 11, 31); // 31 décembre
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Semaine précédente
export const getPreviousWeekRange = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const currentDay = lastWeek.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const monday = new Date(lastWeek);
  monday.setDate(lastWeek.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

// Mois précédent
export const getPreviousMonthRange = () => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Fonction utilitaire pour calculer les dates selon le type de période
export const calculateDateRange = (period) => {
  switch (period) {
    case 'current_week':
      return getCurrentWeekRange();
    case 'current_month':
      return getCurrentMonthRange();
    case 'current_year':
      return getCurrentYearRange();
    case 'previous_week':
      return getPreviousWeekRange();
    case 'previous_month':
      return getPreviousMonthRange();
    case 'last_7_days':
      // Fallback vers 7 jours glissants si nécessaire
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const today7 = new Date();
      today7.setHours(23, 59, 59, 999);
      return { start: sevenDaysAgo, end: today7 };
    case 'last_30_days':
      // Fallback vers 30 jours glissants si nécessaire
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const today30 = new Date();
      today30.setHours(23, 59, 59, 999);
      return { start: thirtyDaysAgo, end: today30 };
    default:
      return getCurrentWeekRange();
  }
};

// Ajouter un jour à une date
export const subDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

// Obtenir le début de la journée
export const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

// Obtenir la fin de la journée
export const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};