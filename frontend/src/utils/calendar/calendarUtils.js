import { getCalendarYear } from "./calendarYearUtils.js";
import { getCurrentYear } from "./yearUtils.js";
import { YEAR_TYPES } from "./constants.js";

export const getMonthBounds = (year, yearType) => {
  if (yearType === YEAR_TYPES.SCHOOL) {
    return {
      startMonth: 8,
      endMonth: 7,
      startYear: year,
      endYear: year + 1
    };
  } else {
    return {
      startMonth: 0,
      endMonth: 11,
      startYear: year,
      endYear: year
    };
  }
};

const calculateNewMonth = (direction, currentMonth, selectedYear, yearType) => {
  const bounds = getMonthBounds(selectedYear, yearType);
  
  if (yearType === YEAR_TYPES.SCHOOL) {
    if (direction === 'prev') {
      if (currentMonth === bounds.startMonth) {
        return bounds.endMonth;
      } else if (currentMonth === 0) {
        return 11;
      } else {
        return currentMonth - 1;
      }
    } else {
      if (currentMonth === bounds.endMonth) {
        return bounds.startMonth;
      } else if (currentMonth === 11) {
        return 0;
      } else {
        return currentMonth + 1;
      }
    }
  } else {
    if (direction === 'prev') {
      return currentMonth === 0 ? 11 : currentMonth - 1;
    } else {
      return currentMonth === 11 ? 0 : currentMonth + 1;
    }
  }
};

export const getCalendarGrid = (year, month, realizedHours, yearlyPlanning, yearType = YEAR_TYPES.CIVIL) => {
  const calendarYear = getCalendarYear(month, year, yearType);
  
  const firstDayOfMonth = new Date(calendarYear, month, 1);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(calendarYear, month, 1 - startDay);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  console.log('🔍 getCalendarGrid DEBUG:');
  console.log('- year:', year, 'month:', month, 'yearType:', yearType);
  console.log('- calendarYear:', calendarYear);
  console.log('- realizedHours keys:', Object.keys(realizedHours).slice(0, 5));
  console.log('- yearlyPlanning:', yearlyPlanning?.planning?.length || 0, 'entries');

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    const dayData = realizedHours[dateStr];
    const planning = yearlyPlanning?.planning?.find(
      (p) => p.plan_date === dateStr
    );

    // ✅ DEBUG pour quelques jours
    if (i < 3) {
      console.log(`Jour ${dateStr}:`, {
        dayData,
        planning,
        workingHours: dayData?.workingHours
      });
    }

    return {
      date,
      dateStr,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateStr === todayStr,
      realized: dayData ? {
        workingHours: dayData.workingHours || 0,
        arrival: dayData.arrival || null,
        departure: dayData.departure || null,
        breakStart: dayData.breakStart || null,
        breakEnd: dayData.breakEnd || null,
        status: dayData.status || null
      } : null,
      planning: planning ? {
        planned_hours: planning.planned_hours || 0,
        color: planning.color || "#3B82F6",
        project: planning.project || null,
        description: planning.description || null
      } : null,
    };
  });
};

export const navigateMonth = (direction, currentMonth, setCurrentMonth, selectedYear, yearType) => {
  const newMonth = calculateNewMonth(direction, currentMonth, selectedYear, yearType);
  setCurrentMonth(newMonth);
};

export const goToToday = (yearType, selectedYear, setSelectedYear, setCurrentMonth) => {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  
  if (yearType === YEAR_TYPES.SCHOOL) {
    const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
    if (selectedYear !== currentSchoolYear) {
      setSelectedYear(currentSchoolYear);
    }
  } else {
    if (selectedYear !== todayYear) {
      setSelectedYear(todayYear);
    }
  }
  
  setCurrentMonth(todayMonth);
};