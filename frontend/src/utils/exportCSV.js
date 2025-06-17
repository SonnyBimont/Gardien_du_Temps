/**
 * Exporte les données de comparaison heures réalisées vs planifiées en CSV
 * @param {Object} realizedHours - Données des heures réalisées
 * @param {Object} yearlyPlanning - Données de planification annuelle
 * @param {number} selectedYear - Année sélectionnée
 */
export const exportRealizedHoursToCSV = (realizedHours, yearlyPlanning, selectedYear) => {
  const csvData = [];
  csvData.push(['Date', 'Heures Réalisées', 'Heures Planifiées', 'Écart', 'Projet']);

  Object.entries(realizedHours)
    .filter(([date]) => new Date(date).getFullYear() === selectedYear)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .forEach(([date, realized]) => {
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === date);
      const realizedHrs = realized.workingHours || 0;
      const plannedHrs = planning?.planned_hours || 0;
      const diff = realizedHrs - plannedHrs;
      const project = planning?.project?.name || '';

      csvData.push([
        date,
        realizedHrs.toFixed(1),
        plannedHrs.toFixed(1),
        diff.toFixed(1),
        project
      ]);
    });

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
      csvData.push([
        planning.plan_date,
        planning.planned_hours.toFixed(1),
        planning.project?.name || '',
        planning.description || ''
      ]);
    });

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