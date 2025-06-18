import { YEAR_TYPES, getYearByType } from './dateUtils';
/**
 * Exporte les données de comparaison heures réalisées vs planifiées en CSV
 * @param {Object} realizedHours - Données des heures réalisées
 * @param {Object} yearlyPlanning - Données de planification annuelle
 * @param {number} selectedYear - Année sélectionnée
 */
export const exportRealizedHoursToCSV = (realizedHours, yearlyPlanning, selectedYear, yearType = YEAR_TYPES.CIVIL) => {
  const csvData = [];
  csvData.push(['Date', 'Heures Réalisées', 'Heures Planifiées', 'Écart', 'Projet', 'Statut', 'Note/Description']);

  Object.entries(realizedHours)
    .filter(([date]) => {
      const dateYear = getYearByType(new Date(date), yearType);
      return dateYear === selectedYear;
    })
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .forEach(([date, realized]) => {
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === date);
      
      // ✅ CORRECTION : Conversion en nombres avec parseFloat
      const realizedHrs = parseFloat(realized.workingHours) || 0;
      const plannedHrs = parseFloat(planning?.planned_hours) || 0;
      const diff = realizedHrs - plannedHrs;
      const project = planning?.project?.name || '';
      const status = diff >= 0 ? 'Objectif atteint' : 'En retard';

      csvData.push([
        date,
        realizedHrs.toFixed(1),
        plannedHrs.toFixed(1),
        diff.toFixed(1),
        project,
        status
      ]);
    });

  // Ajouter ligne de totaux
  const totalRealized = Object.values(realizedHours)
    .reduce((sum, day) => sum + (parseFloat(day.workingHours) || 0), 0);
  const totalPlanned = yearlyPlanning.planning
    ?.filter(p => new Date(p.plan_date).getFullYear() === selectedYear)
    .reduce((sum, p) => sum + (parseFloat(p.planned_hours) || 0), 0) || 0;

  csvData.push(['', '', '', '', '', '']); // Ligne vide
  csvData.push([
    'TOTAUX',
    totalRealized.toFixed(1),
    totalPlanned.toFixed(1),
    (totalRealized - totalPlanned).toFixed(1),
    '',
    totalRealized >= totalPlanned ? 'Objectif global atteint' : 'Retard global'
  ]);

  // Créer le fichier CSV
  const csvContent = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `heures-realisees-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Exporte uniquement les heures planifiées en CSV
 * @param {Object} yearlyPlanning - Données de planification annuelle
 * @param {number} selectedYear - Année sélectionnée
 */
export const exportPlannedHoursToCSV = (yearlyPlanning, selectedYear) => {
  const csvData = [];
  csvData.push(['Date', 'Heures Planifiées', 'Projet', 'Description']);

  yearlyPlanning.planning
    ?.filter(p => new Date(p.plan_date).getFullYear() === selectedYear)
    .sort((a, b) => new Date(a.plan_date) - new Date(b.plan_date))
    .forEach(planning => {
      // ✅ CORRECTION : Conversion en nombre
      const plannedHrs = parseFloat(planning.planned_hours) || 0;
      
      csvData.push([
        planning.plan_date,
        plannedHrs.toFixed(1),
        planning.project?.name || '',
        planning.description || ''
      ]);
    });

  // Ajouter total
  const totalPlanned = yearlyPlanning.planning
    ?.filter(p => new Date(p.plan_date).getFullYear() === selectedYear)
    .reduce((sum, p) => sum + (parseFloat(p.planned_hours) || 0), 0) || 0;

  csvData.push(['', '', '', '']); // Ligne vide
  csvData.push(['TOTAL', totalPlanned.toFixed(1), '', '']);

  const csvContent = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `heures-planifiees-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export pour les RH avec détails complets
 */
export const exportRHReport = (realizedHours, yearlyPlanning, selectedYear, user) => {
  const yearType = user?.year_type || YEAR_TYPES.CIVIL;
  const csvData = [];
  csvData.push([
    'Employé',
    'Date',
    'Jour',
    'Heures Planifiées',
    'Heures Réalisées',
    'Écart',
    'Statut',
    'Projet',
    'Note/Description'
  ]);

  Object.entries(realizedHours)
    .filter(([date]) => new Date(date).getFullYear() === selectedYear)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .forEach(([date, realized]) => {
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === date);
      
      const realizedHrs = parseFloat(realized.workingHours) || 0;
      const plannedHrs = parseFloat(planning?.planned_hours) || 0;
      const diff = realizedHrs - plannedHrs;
      
      const dateObj = new Date(date);
      const jourSemaine = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      let statut = 'Absent';
      if (realizedHrs > 0) {
        if (realizedHrs >= 7) statut = 'Journée complète';
        else if (realizedHrs >= 4) statut = 'Demi-journée';
        else statut = 'Présence partielle';
      }

      csvData.push([
        `${user?.first_name || ''} ${user?.last_name || ''}`,
        date,
        jourSemaine,
        plannedHrs.toFixed(1),
        realizedHrs.toFixed(1),
        diff.toFixed(1),
        statut,
        planning?.project?.name || '',
        planning?.description || '' 
      ]);
    });

  const csvContent = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const yearSuffix = yearType === YEAR_TYPES.SCHOOL ? `-${selectedYear}-${selectedYear + 1}` : `-${selectedYear}`;
    link.setAttribute('download', `rapport-RH-${user?.last_name || 'utilisateur'}${yearSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};