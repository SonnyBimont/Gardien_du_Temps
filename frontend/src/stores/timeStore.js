// Store pour le suivi du temps
import { create } from 'zustand';
import api from '../services/api';
import { calculateTotalHours, groupEntriesByDate, getTodayStatus } from '../utils/timeCalculations';

export const useTimeStore = create((set, get) => ({
  // État
  todayEntries: [],
  timeHistory: [],
  weeklyStats: {},
  monthlyStats: {},
  loading: false,
  error: null,
  lastUpdate: null,

  // Actions
  fetchTodayEntries: async (userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        startDate: today,
        endDate: today
      });
      
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await api.get(`/time-trackings/range?${params}`);
      
      if (response.data.success) {
        set({ 
          todayEntries: response.data.data || [], 
          loading: false,
          lastUpdate: new Date().toISOString()
        });
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des pointages du jour';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      
      throw error;
    }
  },

  fetchTimeHistory: async (days = 30, userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await api.get(`/time-trackings/range?${params}`);
      
      if (response.data.success) {
        const entries = response.data.data || [];
        const processedData = calculateTotalHours(entries);
        
        set({ 
          timeHistory: entries,
          processedHistory: processedData,
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        
        // Calculer les statistiques
        get().calculateStats(entries);
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement de l\'historique';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      
      throw error;
    }
  },

  recordTimeEntry: async (type, taskId = null, comment = '') => {
    set({ error: null });
    
    try {
      const payload = {
        tracking_type: type,
        date_time: new Date().toISOString(),
        validated: false,
        comment: comment.trim()
      };

      if (taskId) {
        payload.task_id = taskId;
      }

      const response = await api.post('/time-trackings', payload);
      
      if (response.data.success) {
        // Recharger les entrées du jour
        await get().fetchTodayEntries();
        
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors du pointage');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du pointage';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  updateTimeEntry: async (entryId, updateData) => {
    try {
      const response = await api.put(`/time-trackings/${entryId}`, updateData);
      
      if (response.data.success) {
        // Recharger les données
        await get().fetchTodayEntries();
        await get().fetchTimeHistory();
        
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  deleteTimeEntry: async (entryId) => {
    try {
      const response = await api.delete(`/time-trackings/${entryId}`);
      
      if (response.data.success) {
        // Recharger les données
        await get().fetchTodayEntries();
        await get().fetchTimeHistory();
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  calculateStats: (entries) => {
    const grouped = groupEntriesByDate(entries);
    const now = new Date();
    
    // Statistiques de la semaine courante
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date_time);
      return entryDate >= startOfWeek;
    });
    
    // Statistiques du mois courant
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date_time);
      return entryDate >= startOfMonth;
    });
    
    const weeklyStats = {
      totalHours: calculateTotalWorkingHours(weekEntries),
      workingDays: Object.keys(groupEntriesByDate(weekEntries)).length,
      averageHoursPerDay: 0
    };
    
    const monthlyStats = {
      totalHours: calculateTotalWorkingHours(monthEntries),
      workingDays: Object.keys(groupEntriesByDate(monthEntries)).length,
      averageHoursPerDay: 0
    };
    
    // Calculer les moyennes
    if (weeklyStats.workingDays > 0) {
      weeklyStats.averageHoursPerDay = weeklyStats.totalHours / weeklyStats.workingDays;
    }
    
    if (monthlyStats.workingDays > 0) {
      monthlyStats.averageHoursPerDay = monthlyStats.totalHours / monthlyStats.workingDays;
    }
    
    set({ weeklyStats, monthlyStats });
  },

  // Getters
  getTodayStatus: () => {
    return getTodayStatus(get().todayEntries);
  },

  getProcessedHistory: () => {
    return calculateTotalHours(get().timeHistory);
  },

  canPerformAction: (actionType) => {
    const todayStatus = get().getTodayStatus();
    
    const rules = {
      arrival: !todayStatus.arrival,
      break_start: todayStatus.arrival && !todayStatus.breakStart && !todayStatus.departure,
      break_end: todayStatus.breakStart && !todayStatus.breakEnd && !todayStatus.departure,
      departure: todayStatus.arrival && !todayStatus.departure && 
                (!todayStatus.breakStart || todayStatus.breakEnd)
    };
    
    return rules[actionType] || false;
  },

  getCurrentWorkingTime: () => {
    const todayStatus = get().getTodayStatus();
    
    if (!todayStatus.arrival) return 0;
    
    const now = new Date();
    const arrivalTime = new Date(todayStatus.arrival.date_time);
    let workingMinutes = (now - arrivalTime) / (1000 * 60);
    
    // Soustraire le temps de pause si en cours
    if (todayStatus.breakStart && !todayStatus.breakEnd) {
      const breakStartTime = new Date(todayStatus.breakStart.date_time);
      const breakMinutes = (now - breakStartTime) / (1000 * 60);
      workingMinutes -= breakMinutes;
    }
    
    // Soustraire le temps de pause terminée
    if (todayStatus.breakStart && todayStatus.breakEnd) {
      const breakStartTime = new Date(todayStatus.breakStart.date_time);
      const breakEndTime = new Date(todayStatus.breakEnd.date_time);
      const breakMinutes = (breakEndTime - breakStartTime) / (1000 * 60);
      workingMinutes -= breakMinutes;
    }
    
    return Math.max(0, workingMinutes / 60); // Retourner en heures
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    todayEntries: [],
    timeHistory: [],
    weeklyStats: {},
    monthlyStats: {},
    loading: false,
    error: null,
    lastUpdate: null
  })
}));

// Fonction utilitaire pour calculer le total d'heures travaillées
function calculateTotalWorkingHours(entries) {
  const grouped = groupEntriesByDate(entries);
  let totalHours = 0;
  
  Object.values(grouped).forEach(dayEntries => {
    const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
    const departure = dayEntries.find(e => e.tracking_type === 'departure');
    
    if (arrival && departure) {
      let dayMinutes = (new Date(departure.date_time) - new Date(arrival.date_time)) / (1000 * 60);
      
      // Soustraire les pauses
      const breakStart = dayEntries.find(e => e.tracking_type === 'break_start');
      const breakEnd = dayEntries.find(e => e.tracking_type === 'break_end');
      
      if (breakStart && breakEnd) {
        const breakMinutes = (new Date(breakEnd.date_time) - new Date(breakStart.date_time)) / (1000 * 60);
        dayMinutes -= breakMinutes;
      }
      
      totalHours += Math.max(0, dayMinutes / 60);
    }
  });
  
  return Math.round(totalHours * 100) / 100;
}