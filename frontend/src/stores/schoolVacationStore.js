import { create } from 'zustand';
import api from '../services/api';

export const useSchoolVacationStore = create((set, get) => ({
  vacations: [],
  loading: false,
  error: null,
  selectedZone: 'B', // Zone par défaut

  // Récupérer les vacances pour une période donnée
fetchVacations: async (startDate, endDate, zone = 'B') => {
  set({ loading: true, error: null });
  
  try {
    const params = new URLSearchParams();
    if (zone) params.append('zone', zone);
    
    // ✅ CORRIGER : Calculer l'année scolaire correctement
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Si la période couvre septembre, c'est une année scolaire
      if (startDate.includes('-09-') || endDate.includes('-08-')) {
        const schoolYear = start.getFullYear();
        const schoolYearStr = `${schoolYear}-${schoolYear + 1}`;
        params.append('schoolYear', schoolYearStr);
        console.log('🎓 Année scolaire détectée:', schoolYearStr);
      } else {
        // Sinon, année civile
        const year = start.getFullYear();
        params.append('schoolYear', `${year}-${year + 1}`);
        console.log('📅 Année civile convertie en scolaire:', `${year}-${year + 1}`);
      }
    }
    
    console.log('🏖️ Appel API vacances:', { zone, startDate, endDate, params: params.toString() });
    
    const response = await api.get(`/school-vacations/calendar?${params}`);
    
    if (response.data.success) {
      console.log('✅ Vacances reçues:', response.data.data);
      set({ 
        vacations: response.data.data,
        loading: false 
      });
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Erreur chargement vacances:', error);
    set({ 
      error: error.response?.data?.message || error.message,
      loading: false 
    });
    return [];
  }
},

  // Vérifier si une date est en vacances
  isVacationDay: (date) => {
    const vacations = get().vacations;
    if (!vacations || vacations.length === 0) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0); // Normaliser l'heure
    
    return vacations.some(vacation => {
      // ✅ UTILISER : Les vraies dates depuis extendedProps ou les dates de base
      const startDateStr = vacation.extendedProps?.realStartDate || vacation.start_date || vacation.start;
      const endDateStr = vacation.extendedProps?.realEndDate || vacation.end_date || vacation.end;
      
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999); // Fin de journée INCLUSE
      
      return checkDate >= start && checkDate <= end;
    });
  },

  // ✅ CORRIGER : Obtenir les infos de vacances pour une date
  getVacationInfo: (date) => {
    const vacations = get().vacations;
    if (!vacations || vacations.length === 0) return null;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return vacations.find(vacation => {
      const startDateStr = vacation.extendedProps?.realStartDate || vacation.start_date || vacation.start;
      const endDateStr = vacation.extendedProps?.realEndDate || vacation.end_date || vacation.end;
      
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999); // Fin de journée INCLUSE
      
      return checkDate >= start && checkDate <= end;
    });
  },


  setZone: (zone) => set({ selectedZone: zone }),
  clearError: () => set({ error: null })
}));