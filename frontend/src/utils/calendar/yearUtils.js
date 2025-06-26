import { YEAR_TYPES, monthNames } from './constants.js';
  
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