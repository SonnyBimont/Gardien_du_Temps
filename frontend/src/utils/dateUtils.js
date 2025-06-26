/**
 * Types d'années disponibles
 */
export const YEAR_TYPES = {
  CIVIL: 'civil',      // Janvier à Décembre
  SCHOOL: 'school'     // Septembre à Août
};

/**
 * Configuration par défaut = ANNEE SCOLAIRE (peut être changée plus tard)
 */
export const DEFAULT_YEAR_TYPE = YEAR_TYPES.SCHOOL;

/**
 * Détermine l'année d'exercice scolaire (septembre à août)
 * @param {Date|string} date - Date à analyser
 * @returns {number} - Année d'exercice scolaire
 */
export const getSchoolYear = (date) => {
  const d = new Date(date);
  const month = d.getMonth(); // 0-11
  const year = d.getFullYear();
  
  // Si on est entre janvier et août (mois 0-7), on est dans l'exercice de l'année précédente
  return month >= 8 ? year : year - 1; // 8 = septembre
};

/**
 * Détermine l'année civile (janvier à décembre) 
 * @param {Date|string} date - Date à analyser
 * @returns {number} - Année civile
 */
export const getCivilYear = (date) => {
  return new Date(date).getFullYear();
};

/**
 * Obtient l'année selon le type choisi
 * @param {Date|string} date - Date à analyser
 * @param {string} yearType - Type d'année (CIVIL ou SCHOOL)
 * @returns {number} - Année correspondante
 */
export const getYearByType = (date, yearType = DEFAULT_YEAR_TYPE) => {
  switch (yearType) {
    case YEAR_TYPES.SCHOOL:
      return getSchoolYear(date);
    case YEAR_TYPES.CIVIL:
    default:
      return getCivilYear(date);
  }
};

/**
 * Obtient les bornes de l'année selon le type
 * @param {number} year - Année de référence
 * @param {string} yearType - Type d'année (CIVIL ou SCHOOL)
 * @returns {Object} - {startDate, endDate}
 */
export const getYearBounds = (year, yearType = DEFAULT_YEAR_TYPE) => {
  switch (yearType) {
    case YEAR_TYPES.SCHOOL:
      return {
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-08-31`,
        label: `Année scolaire ${year}-${year + 1}`
      };
    case YEAR_TYPES.CIVIL:
    default:
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        label: `Année civile ${year}`
      };
  }
};

/**
 * Filtre les entrées par année selon le type choisi
 * @param {Array} entries - Données à filtrer
 * @param {number} year - Année de référence
 * @param {string} yearType - Type d'année (CIVIL ou SCHOOL)
 * @param {string} dateField - Nom du champ date ('date', 'plan_date', etc.)
 * @returns {Array} - Données filtrées
 */
export const filterByYearType = (entries, year, yearType = DEFAULT_YEAR_TYPE, dateField = 'date') => {
  return entries.filter(entry => {
    const entryDate = entry[dateField];
    if (!entryDate) return false;
    
    const entryYear = getYearByType(entryDate, yearType);
    return entryYear === year;
  });
};

/**
 * Obtient une liste d'années pour un sélecteur selon le type
 * @param {string} yearType - Type d'année
 * @param {number} nbYears - Nombre d'années à afficher
 * @returns {Array} - Liste des années avec labels
 */
export const getYearOptions = (yearType = DEFAULT_YEAR_TYPE, nbYears = 5) => {
  const currentYear = getYearByType(new Date(), yearType);
  const years = [];
  
  for (let i = -2; i < nbYears - 2; i++) {
    const year = currentYear + i;
    const bounds = getYearBounds(year, yearType);
    
    years.push({
      value: year,
      label: yearType === YEAR_TYPES.SCHOOL 
        ? `${year}-${year + 1}` 
        : `${year}`,
      fullLabel: bounds.label,
      isCurrent: year === currentYear
    });
  }
  
  return years;
};

/**
 * Vérifie si une date appartient à une année donnée selon le type
 * @param {Date|string} date - Date à vérifier
 * @param {number} year - Année de référence
 * @param {string} yearType - Type d'année
 * @returns {boolean}
 */
export const isDateInYear = (date, year, yearType = DEFAULT_YEAR_TYPE) => {
  const bounds = getYearBounds(year, yearType);
  const checkDate = new Date(date);
  const startDate = new Date(bounds.startDate);
  const endDate = new Date(bounds.endDate);
  
  return checkDate >= startDate && checkDate <= endDate;
};

/**
 * Formate l'affichage d'une année selon le type
 * @param {number} year - Année
 * @param {string} yearType - Type d'année
 * @returns {string} - Label formaté
 */
export const formatYearDisplay = (year, yearType = DEFAULT_YEAR_TYPE) => {
  return yearType === YEAR_TYPES.SCHOOL 
    ? `${year}-${year + 1}` 
    : `${year}`;
};

/**
 * Obtient l'année actuelle selon le type (pour les composants)
 * @param {string} yearType - Type d'année
 * @returns {number}
 */
export const getCurrentYear = (yearType = DEFAULT_YEAR_TYPE) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  if (yearType === YEAR_TYPES.SCHOOL) {
    const schoolYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    
    // ✅ CORRIGER : Logs conditionnels pour éviter le spam
    if (Math.random() < 0.001) { // Log seulement 0.1% du temps
      console.log('🎓 getCurrentYear SCHOOL:', {
        dateActuelle: today.toLocaleDateString('fr-FR'),
        mois: currentMonth,
        annéeCivile: currentYear,
        annéeScolaire: `${schoolYear}-${schoolYear + 1}`,
        période: `${schoolYear}-09-01 → ${schoolYear + 1}-08-31`
      });
    }
    
    return schoolYear;
  }
  
  return currentYear;
};

  // Calcule les dates de la période sélectionnée
export const calculatePeriodDates = (period, customStart = null, customEnd = null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    switch (period) {
      case 'current_week':
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return {
          start: monday.toISOString().split('T')[0],
          end: sunday.toISOString().split('T')[0],
          label: 'Semaine en cours'
        };

      case 'current_month':
        return {
          start: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0],
          label: 'Mois en cours'
        };

      case 'current_quarter':
        const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
        const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        return {
          start: quarterStart.toISOString().split('T')[0],
          end: quarterEnd.toISOString().split('T')[0],
          label: 'Trimestre en cours'
        };

      case 'current_year':
        return {
          start: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          end: new Date(currentYear, 11, 31).toISOString().split('T')[0],
          label: 'Année en cours'
        };

      case 'previous_week':
        const prevWeekMonday = new Date(now);
        prevWeekMonday.setDate(now.getDate() - now.getDay() - 6);
        const prevWeekSunday = new Date(prevWeekMonday);
        prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
        return {
          start: prevWeekMonday.toISOString().split('T')[0],
          end: prevWeekSunday.toISOString().split('T')[0],
          label: 'Semaine précédente'
        };

      case 'previous_month':
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return {
          start: new Date(prevYear, prevMonth, 1).toISOString().split('T')[0],
          end: new Date(prevYear, prevMonth + 1, 0).toISOString().split('T')[0],
          label: 'Mois précédent'
        };

      case 'last_30_days':
        const thirty = new Date(now);
        thirty.setDate(now.getDate() - 30);
        return {
          start: thirty.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0],
          label: '30 derniers jours'
        };

      case 'custom':
        return {
          start: customStart,
          end: customEnd,
          label: 'Période personnalisée'
        };

      default:
        return calculatePeriodDates('current_month');
    }
  };


{ /* Fonction pour debug - affiche l'année scolaire actuelle
 */}
export const debugCurrentSchoolYear = () => {
  const today = new Date();
  const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
  console.log('🎓 Debug année scolaire:');
  console.log('- Date du jour:', today.toLocaleDateString('fr-FR'));
  console.log('- Mois actuel:', today.getMonth() + 1); // +1 car getMonth() retourne 0-11
  console.log('- Année scolaire actuelle:', `${currentSchoolYear}-${currentSchoolYear + 1}`);
  console.log('- Période:', `${currentSchoolYear}-09-01 → ${currentSchoolYear + 1}-08-31`);
  return currentSchoolYear;
};