// Store pour le suivi du temps
import { create } from 'zustand';
import api from '../services/api';
import { 
  calculateTotalHours, 
  groupEntriesByDate, 
  getTodayStatus,
} from '../utils/timeCalculations';

export const useTimeStore = create((set, get) => ({
  todayEntries: [],
  timeHistory: [],
  processedHistory: [], 
  monthlyReport: {},  
  stats: {},
  weeklyStats: {},
  monthlyStats: {},
  loading: false,
  error: null,
  lastUpdate: null,
    // Cache simple et efficace
  _processedCache: null, // For processedHistory
  _cacheKey: null,       // Key for processedHistory cache
  _cacheTime: 0,         // Timestamp for processedHistory cache
  _timeSpentPerTaskCache: {}, // Cache for time spent per task { taskId: { time: X, timestamp: Y } }

  // State for custom period report
  reportEntries: [],
  reportStats: {
    totalWorkingHours: 0,
    totalBreakHours: 0,
    workingDays: 0,
    averageHoursPerDay: 0,
    expectedWorkingHours: 0, // Could be calculated based on period
  },
  reportLoading: false,

  // Actions principales avec /today
  fetchTodayEntries: async (userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/time-trackings/today?${params}`);
      
      if (response.data.success) {
        set({ 
          todayEntries: response.data.data || [], 
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.warn('API today non disponible, fallback...', error.response?.status);
      
      // FALLBACK
      if (error.response?.status === 404) {
        return get().fetchTodayEntriesLegacy(userId);
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // fallback
  fetchTodayEntriesLegacy: async (userId = null) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        startDate: today,
        endDate: today
      });
      
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/time-trackings/range?${params}`);
      
      if (response.data.success) {
        set({ 
          todayEntries: response.data.data || [], 
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Actions rapides optimisées
  clockIn: async (taskId = null, comment = '') => {
    return get().performAction('/time-trackings/clock-in', 'arrival', { taskId, comment });
  },

  clockOut: async (comment = '') => {
    return get().performAction('/time-trackings/clock-out', 'departure', { comment });
  },

  startBreak: async (comment = '') => {
    return get().performAction('/time-trackings/break-start', 'break_start', { comment });
  },

  endBreak: async (comment = '') => {
    return get().performAction('/time-trackings/break-end', 'break_end', { comment });
  },

  // utilitaire pour éviter la duplication
  performAction: async (endpoint, fallbackType, { taskId = null, comment = '' }) => {
    set({ error: null });
    
    try {
      const payload = {};
      if (taskId) payload.task_id = taskId;
      if (comment) payload.comment = comment.trim();

      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        await get().fetchTodayEntries();
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors du pointage');
      }
    } catch (error) {
      // ✅ FALLBACK vers méthode générique
      if (error.response?.status === 404) {
        return get().recordTimeEntry(fallbackType, taskId, comment);
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Stats avec fallback
  fetchStats: async (days = 7, userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/time-trackings/stats?${params}`);
      
      if (response.data.success) {
        set({ 
          stats: response.data.data,
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.warn('API stats non disponible, calcul local...', error.response?.status);
      
      // FALLBACK vers calcul local
      if (error.response?.status === 404) {
        await get().fetchTimeHistory(days, userId);
        return { success: true, data: get().stats };
      }
      
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      return { success: false, error: error.message };
    }
  },

  // Rapport mensuel
  fetchMonthlyReport: async (month = null, year = null, userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/time-trackings/report/monthly?${params}`);
      
      if (response.data.success) {
        set({ 
          monthlyReport: response.data.data,
          loading: false
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      return { success: false, error: error.message };
    }
  },

  // Historique optimisé
  fetchTimeHistory: async (days = 30, userId = null) => {
    set({ loading: true, error: null });
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      const params = new URLSearchParams({ startDate, endDate });
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/time-trackings/range?${params}`);
      
      if (response.data.success) {
        const entries = response.data.data || [];
        const processedData = calculateTotalHours(entries);
        
        set({ 
          timeHistory: entries,
          processedHistory: processedData,
          loading: false,
          lastUpdate: new Date().toISOString(),
//  Invalider le cache
          _processedCache: null,
          _cacheKey: null,
          _cacheTime: 0
        });
        
        // Calculs automatiques
        get().calculateStats(entries);
        return { success: true, data: entries };
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Actions CRUD
  recordTimeEntry: async (type, taskId = null, comment = '') => {
    set({ error: null });
    
    try {
      const payload = {
        tracking_type: type,
        date_time: new Date().toISOString(),
        validated: false,
        comment: comment.trim()
      };

      if (taskId) payload.task_id = taskId;

      const response = await api.post('/time-trackings', payload);
      
      if (response.data.success) {
        await get().fetchTodayEntries();        
        //  Invalider le cache
        set({
          _processedCache: null,
          _cacheKey: null,
          _cacheTime: 0
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors du pointage');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateTimeEntry: async (entryId, updateData) => {
    try {
      const response = await api.put(`/time-trackings/${entryId}`, updateData);
      
      if (response.data.success) {
        await Promise.all([
          get().fetchTodayEntries(),
          get().fetchTimeHistory()
        ]);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteTimeEntry: async (entryId) => {
    try {
      const response = await api.delete(`/time-trackings/${entryId}`);
      
      if (response.data.success) {
        await Promise.all([
          get().fetchTodayEntries(),
          get().fetchTimeHistory()
        ]);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Calculs consolidés (utilise les utils)
  calculateStats: (entries) => {
    const grouped = groupEntriesByDate(entries);
    const now = new Date();
    
    // Semaine courante
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekEntries = entries.filter(entry => 
      new Date(entry.date_time) >= startOfWeek
    );
    
    // Mois courant
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter(entry => 
      new Date(entry.date_time) >= startOfMonth
    );

        // Calculs simples sans fonction externe manquante
    const calculateHours = (entriesByDate) => {
      let totalHours = 0;
      Object.values(entriesByDate).forEach(dayEntries => {
        const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
        const departure = dayEntries.find(e => e.tracking_type === 'departure');
        
        if (arrival && departure) {
          const hours = (new Date(departure.date_time) - new Date(arrival.date_time)) / (1000 * 60 * 60);
          totalHours += Math.max(0, hours);
        }
      });
      return Math.round(totalHours * 100) / 100;
    };

    // Utiliser la fonction des utils
    const weeklyStats = {
      totalHours: calculateHours(groupEntriesByDate(weekEntries)),
      workingDays: Object.keys(groupEntriesByDate(weekEntries)).length,
      averageHoursPerDay: 0
    };
    
    const monthlyStats = {
      totalHours: calculateHours(groupEntriesByDate(monthEntries)),
      workingDays: Object.keys(groupEntriesByDate(monthEntries)).length,
      averageHoursPerDay: 0
    };
    
    // Moyennes
    if (weeklyStats.workingDays > 0) {
      weeklyStats.averageHoursPerDay = Math.round((weeklyStats.totalHours / weeklyStats.workingDays) * 100) / 100;
    }
    
    if (monthlyStats.workingDays > 0) {
      monthlyStats.averageHoursPerDay = Math.round((monthlyStats.totalHours / monthlyStats.workingDays) * 100) / 100;
    }
    
    set({ weeklyStats, monthlyStats });
  },

  // Getters (utilise les utils)
  getTodayStatus: () => getTodayStatus(get().todayEntries),
  
  // getProcessedHistory: () => calculateTotalHours(get().timeHistory),
  getProcessedHistory: () => {
    const { timeHistory, _processedCache, _cacheKey, _cacheTime } = get();
    const currentKey = timeHistory.length > 0 ? 
      `${timeHistory.length}-${timeHistory[0]?.id}-${timeHistory[timeHistory.length-1]?.id || 'new'}` : 
      'empty';
    const now = Date.now();
    
    // Cache simple mais efficace
    if (_cacheKey === currentKey && now - _cacheTime < 2 * 60 * 1000) {
      return _processedCache;
    }
    
    // ✅ Calculer et cacher
    const result = calculateTotalHours(timeHistory);
    set({
      _processedCache: result,
      _cacheKey: currentKey,
      _cacheTime: now
    });
    
    return result;
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
    
    // Déduire les pauses
    if (todayStatus.breakStart && !todayStatus.breakEnd) {
      const breakStartTime = new Date(todayStatus.breakStart.date_time);
      workingMinutes -= (now - breakStartTime) / (1000 * 60);
    }
    
    if (todayStatus.breakStart && todayStatus.breakEnd) {
      const breakStartTime = new Date(todayStatus.breakStart.date_time);
      const breakEndTime = new Date(todayStatus.breakEnd.date_time);
      workingMinutes -= (breakEndTime - breakStartTime) / (1000 * 60);
    }
    
    return Math.max(0, workingMinutes / 60);
  },

  // Actions utilitaires
  clearError: () => set({ error: null }),

  reset: () => set({
    todayEntries: [],
    timeHistory: [],
    processedHistory: [],
    monthlyReport: {},
    stats: {},
    weeklyStats: {},
    monthlyStats: {},
    loading: false,
    error: null,
    lastUpdate: null,
    _processedCache: null,
    _cacheKey: null,
    _cacheTime: 0,
    _timeSpentPerTaskCache: {},
    reportEntries: [],
    reportStats: {
      totalWorkingHours: 0,
      totalBreakHours: 0,
      workingDays: 0,
      averageHoursPerDay: 0,
      expectedWorkingHours: 0,
    },
    reportLoading: false,
  }),

  // Action to fetch entries for a custom period
  fetchEntriesForPeriod: async (userId, startDate, endDate) => {
    set({ reportLoading: true, error: null, reportEntries: [], reportStats: {} });
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (userId) params.append('userId', userId);

      const response = await api.get(`/time-trackings/range?${params}`);
      
      if (response.data.success) {
        const entries = response.data.data || [];
        const processedEntries = calculateTotalHours(entries); // from timeCalculations.js
        
        // Calculate summary stats for the period
        let totalWorkingMinutes = 0;
        let totalBreakMinutes = 0;
        const workingDaysDates = new Set();

        processedEntries.forEach(day => {
          totalWorkingMinutes += day.workingMinutes;
          totalBreakMinutes += day.breakMinutes;
          if (day.isComplete || day.isIncomplete) { // Count day if any activity
            workingDaysDates.add(day.date);
          }
        });
        
        const workingDays = workingDaysDates.size;
        const totalWorkingHours = Math.round((totalWorkingMinutes / 60) * 100) / 100;
        const totalBreakHours = Math.round((totalBreakMinutes / 60) * 100) / 100;
        const averageHoursPerDay = workingDays > 0 ? Math.round((totalWorkingHours / workingDays) * 100) / 100 : 0;

        set({
          reportEntries: processedEntries,
          reportStats: {
            totalWorkingHours,
            totalBreakHours,
            workingDays,
            averageHoursPerDay,
            // expectedWorkingHours could be calculated here if logic is available
          },
          reportLoading: false,
          lastUpdate: new Date().toISOString()
        });
        return { success: true, data: processedEntries };
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement des pointages pour la période');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, reportLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Getter pour calculer le temps passé par tâche (version simplifiée)
  // This is a simplified calculation. A robust solution might need backend support
  // or more complex logic to handle overlapping tasks, etc.
  getTimeSpentPerTask: (taskId) => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const cached = get()._timeSpentPerTaskCache[taskId];

    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      return cached.time;
    }

    const history = get().timeHistory; // Use raw history
    let totalMinutesForTask = 0;
    let currentTaskSessionStart = null;
    let activeTaskIdInSession = null;

    // Sort entries chronologically
    const sortedHistory = [...history].sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

    for (const entry of sortedHistory) {
      const entryTime = new Date(entry.date_time);

      if (entry.tracking_type === 'arrival' || entry.tracking_type === 'break_end') {
        // If starting a new session or resuming after a break
        if (currentTaskSessionStart && activeTaskIdInSession) {
          // End previous task session if a new one starts without explicit end
          totalMinutesForTask += (entryTime - currentTaskSessionStart) / (1000 * 60);
        }
        currentTaskSessionStart = entryTime;
        activeTaskIdInSession = entry.task_id; 
      } else if (entry.tracking_type === 'departure' || entry.tracking_type === 'break_start') {
        if (currentTaskSessionStart && activeTaskIdInSession === taskId) {
          totalMinutesForTask += (entryTime - currentTaskSessionStart) / (1000 * 60);
        }
        currentTaskSessionStart = null;
        activeTaskIdInSession = null;
      }
    }
    
    // If current session is for the task and ongoing (no departure yet for the day)
    // This part is tricky because "ongoing" could span across days if not handled carefully.
    // For simplicity, this example doesn't calculate ongoing for history, only completed segments.

    const hours = Math.round((totalMinutesForTask / 60) * 100) / 100;
    
    set(state => ({
      _timeSpentPerTaskCache: {
        ...state._timeSpentPerTaskCache,
        [taskId]: { time: hours, timestamp: now }
      }
    }));
    return hours;
  }
}));

