import { create } from 'zustand';
import api from '../services/api';
import { getYearBounds, YEAR_TYPES } from '../utils/dateUtils'; 

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
  
  // Support du yearType
  fetchYearlyPlanning: async (userId = null, startDate = null, endDate = null) => {
    set({ loading: true, error: null });
    
    try {
      let url = '/hour-planning/yearly';
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      
      if (response.data.success) {
        set({ 
          yearlyPlanning: response.data.data,
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
        // ✅ CORRIGER : Recharger les données après modification
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
  },

  clearError: () => set({ error: null })
}));