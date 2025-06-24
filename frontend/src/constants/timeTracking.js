export const TRACKING_TYPES = {
  ARRIVAL: 'arrival',
  DEPARTURE: 'departure',
  BREAK_START: 'break_start',
  BREAK_END: 'break_end'
};

export const PERIOD_OPTIONS = [
  { 
    value: 'today', 
    label: 'Aujourd\'hui',
    description: 'Données du jour en cours'
  },
  { 
    value: 'yesterday', 
    label: 'Hier',
    description: 'Données d\'hier'
  },
  { 
    value: 'current_week', 
    label: 'Semaine en cours',
    description: 'Du lundi au dimanche'
  },
  { 
    value: 'last_week', 
    label: 'Semaine dernière',
    description: 'Semaine précédente complète'
  },
  { 
    value: 'current_month', 
    label: 'Mois en cours',
    description: 'Du 1er au dernier jour du mois'
  },
  { 
    value: 'last_month', 
    label: 'Mois dernier',
    description: 'Mois précédent complet'
  },
  { 
    value: 'current_quarter', 
    label: 'Trimestre en cours',
    description: 'Trimestre actuel'
  },
  { 
    value: 'last_quarter', 
    label: 'Trimestre dernier',
    description: 'Trimestre précédent'
  },
  { 
    value: 'current_year', 
    label: 'Année en cours',
    description: 'Du 1er janvier à aujourd\'hui'
  },
  { 
    value: 'last_year', 
    label: 'Année dernière',
    description: 'Année précédente complète'
  },
  { 
    value: 'custom', 
    label: 'Période personnalisée',
    description: 'Choisir les dates de début et fin'
  }
];

export const TIME_FORMATS = {
  DISPLAY: 'HH:mm',
  DISPLAY_WITH_SECONDS: 'HH:mm:ss',
  DATE_DISPLAY: 'DD/MM/YYYY',
  DATE_TIME_DISPLAY: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};