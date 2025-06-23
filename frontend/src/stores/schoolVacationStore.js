import { create } from 'zustand';
import api from '../services/api';

export const useSchoolVacationStore = create((set, get) => ({
  vacations: [],
  loading: false,
  error: null,
  selectedZone: 'B', // Zone par défaut
  availableZones: ['A', 'B', 'C'], //  Zones disponibles

  // ✅ MODIFIER : fetchVacations pour supporter zone null = toutes les zones
  fetchVacations: async (startDate, endDate, zone = null) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      // ✅ NOUVEAU : Si zone = null, on ne filtre pas par zone
      if (zone) {
        params.append('zone', zone);
      }
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (startDate.includes('-09-') || endDate.includes('-08-')) {
          const schoolYear = start.getFullYear();
          const schoolYearStr = `${schoolYear}-${schoolYear + 1}`;
          params.append('schoolYear', schoolYearStr);
          console.log('🎓 Année scolaire détectée:', schoolYearStr);
        } else {
          const year = start.getFullYear();
          params.append('schoolYear', `${year}-${year + 1}`);
          console.log('📅 Année civile convertie en scolaire:', `${year}-${year + 1}`);
        }
      }
      
      console.log('🏖️ Appel API vacances:', { zone: zone || 'TOUTES', startDate, endDate, params: params.toString() });
      
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

  // ✅ NOUVEAU : Fonctions pour filtrer les vacances selon la zone sélectionnée
  getVacationsForZone: (zone) => {
    const vacations = get().vacations;
    if (!zone) return vacations; // Toutes les zones
    return vacations.filter(v => v.extendedProps?.zone === zone);
  },

  isVacationDay: (date, zone = null) => {
    const vacations = zone ? get().getVacationsForZone(zone) : get().vacations;
    if (!vacations || vacations.length === 0) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return vacations.some(vacation => {
      const startDateStr = vacation.extendedProps?.realStartDate || vacation.start_date || vacation.start;
      const endDateStr = vacation.extendedProps?.realEndDate || vacation.end_date || vacation.end;
      
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      
      return checkDate >= start && checkDate <= end;
    });
  },

  getVacationInfo: (date, zone = null) => {
    const vacations = zone ? get().getVacationsForZone(zone) : get().vacations;
    if (!vacations || vacations.length === 0) return null;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return vacations.find(vacation => {
      const startDateStr = vacation.extendedProps?.realStartDate || vacation.start_date || vacation.start;
      const endDateStr = vacation.extendedProps?.realEndDate || vacation.end_date || vacation.end;
      
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      
      return checkDate >= start && checkDate <= end;
    });
  },

  // ✅ NOUVEAU : Setters pour la zone sélectionnée
  setZone: (zone) => set({ selectedZone: zone }),
  clearError: () => set({ error: null })
}));