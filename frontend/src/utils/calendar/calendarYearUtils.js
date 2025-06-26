import { YEAR_TYPES } from './constants';
import { monthNames } from './constants';
  
  /**
   * Calcule l'année du calendrier à afficher selon le mois
   * En mode scolaire : septembre-décembre = année N, janvier-août = année N+1
   * @param {number} month - Mois (0-11)
   * @returns {number} Année à afficher dans le calendrier
   */
export const getCalendarYear = (month, selectedYear, yearType) => {
  if (yearType === YEAR_TYPES.SCHOOL) {
    return month >= 8 ? selectedYear : selectedYear + 1;
  } else {
    return selectedYear;
  }
};

export const getDisplayMonth = (currentMonth, selectedYear, yearType) => {
  const year = getCalendarYear(currentMonth, selectedYear, yearType);
  return `${monthNames[currentMonth]} ${year}`;
};

export const getCurrentYear = (yearType = YEAR_TYPES.CIVIL) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  if (yearType === YEAR_TYPES.SCHOOL) {
    return currentMonth >= 8 ? currentYear : currentYear - 1;
  }
  
  return currentYear;
};