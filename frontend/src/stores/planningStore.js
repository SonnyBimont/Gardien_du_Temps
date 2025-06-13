// frontend/src/stores/planningStore.js
import { create } from 'zustand';
import api from '../services/api';

export const usePlanningStore = create((set, get) => ({
  yearlyPlanning: {
    annual_objective: 0,
    total_planned: 0,
    remaining_hours: 0,
    completion_rate: 0,
    planning: []
  },
  selectedYear: new Date().getFullYear(),
  loading: false,
  error: null,
  
  fetchYearlyPlanning: async (year = null) => {
    const targetYear = year || get().selectedYear;
    set({ loading: true, error: null });
    
    try {
      const response = await api.get(`/hour-planning/yearly?year=${targetYear}`);
      
      if (response.data.success) {
        set({ 
          yearlyPlanning: response.data.data,
          selectedYear: targetYear,
          loading: false 
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Erreur planningStore:', error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  upsertPlanning: async (planningData) => {
    try {
      const response = await api.post('/hour-planning/upsert', planningData);
      
      if (response.data.success) {
        await get().fetchYearlyPlanning();
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  setSelectedYear: (year) => {
    set({ selectedYear: year });
    get().fetchYearlyPlanning(year);
  },

  clearError: () => set({ error: null })
}));