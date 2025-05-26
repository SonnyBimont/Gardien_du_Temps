// Store pour Admin
import { create } from 'zustand';
import api from '../services/api';

export const useAdminStore = create((set, get) => ({
  // État
  users: [],
  structures: [],
  stats: {
    totalUsers: 0,
    totalStructures: 0,
    activeUsers: 0,
    recentActivity: []
  },
  loading: false,
  error: null,
  lastUpdate: null,

  // Actions pour les utilisateurs
  fetchUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres optionnels
      if (filters.role) params.append('role', filters.role);
      if (filters.structure_id) params.append('structure_id', filters.structure_id);
      if (filters.active !== undefined) params.append('active', filters.active);
      
      const response = await api.get(`/api/users?${params}`);
      
      if (response.data.success) {
        const users = response.data.data || [];
        
        set({ 
          users,
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        
        // Mettre à jour les statistiques
        get().updateUserStats(users);
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des utilisateurs';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      
      throw error;
    }
  },

  createUser: async (userData) => {
    set({ error: null });
    
    try {
      // Validation des données côté client
      const validationError = get().validateUserData(userData);
      if (validationError) {
        throw new Error(validationError);
      }
      
      const response = await api.post('/api/users', userData);
      
      if (response.data.success) {
        const newUser = response.data.data;
        
        set((state) => ({
          users: [...state.users, newUser],
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateUserStats(get().users);
        
        return { success: true, data: newUser };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de l\'utilisateur';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  updateUser: async (userId, userData) => {
    set({ error: null });
    
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        
        set((state) => ({
          users: state.users.map(user => 
            user.id === userId ? updatedUser : user
          ),
          lastUpdate: new Date().toISOString()
        }));
        
        return { success: true, data: updatedUser };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  deleteUser: async (userId) => {
    set({ error: null });
    
    try {
      const response = await api.delete(`/api/users/${userId}`);
      
      if (response.data.success) {
        set((state) => ({
          users: state.users.filter(user => user.id !== userId),
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateUserStats(get().users);
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de l\'utilisateur';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  toggleUserStatus: async (userId, active) => {
    return get().updateUser(userId, { active });
  },

  // Actions pour les structures
  fetchStructures: async (includeStats = false) => {
    set({ loading: true, error: null });
    
    try {
      const params = includeStats ? '?include_stats=true' : '';
      const response = await api.get(`/structures${params}`);
      
      if (response.data.success) {
        const structures = response.data.data || [];
        
        set({ 
          structures,
          loading: false,
          lastUpdate: new Date().toISOString()
        });
        
        // Mettre à jour les statistiques
        get().updateStructureStats(structures);
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des structures';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      
      throw error;
    }
  },

  createStructure: async (structureData) => {
    set({ error: null });
    
    try {
      // Validation des données côté client
      const validationError = get().validateStructureData(structureData);
      if (validationError) {
        throw new Error(validationError);
      }
      
      const response = await api.post('/api/structures', structureData);
      
      if (response.data.success) {
        const newStructure = response.data.data;
        
        set((state) => ({
          structures: [...state.structures, newStructure],
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateStructureStats(get().structures);
        
        return { success: true, data: newStructure };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la structure';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  updateStructure: async (structureId, structureData) => {
    set({ error: null });
    
    try {
      const response = await api.put(`/api/structures/${structureId}`, structureData);
      
      if (response.data.success) {
        const updatedStructure = response.data.data;
        
        set((state) => ({
          structures: state.structures.map(structure => 
            structure.id === structureId ? updatedStructure : structure
          ),
          lastUpdate: new Date().toISOString()
        }));
        
        return { success: true, data: updatedStructure };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la structure';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  deleteStructure: async (structureId) => {
    set({ error: null });
    
    try {
      const response = await api.delete(`/api/structures/${structureId}`);
      
      if (response.data.success) {
        set((state) => ({
          structures: state.structures.filter(structure => structure.id !== structureId),
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateStructureStats(get().structures);
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la structure';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  // Actions pour les statistiques globales
  fetchDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        set((state) => ({
          stats: {
            ...state.stats,
            ...response.data.data
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  },

  fetchRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/admin/activity?limit=${limit}`);
      
      if (response.data.success) {
        set((state) => ({
          stats: {
            ...state.stats,
            recentActivity: response.data.data || []
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité récente:', error);
    }
  },
  
  fetchStats: async (dateRange = '7') => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get(`/api/admin/stats?days=${dateRange}`);
      
      if (response.data.success) {
        const stats = response.data.data || {};
        
        set(state => ({ 
          stats: {
            ...state.stats,
            ...stats,
            newUsersThisWeek: stats.newUsersThisWeek || 0,
            newStructuresThisWeek: stats.newStructuresThisWeek || 0,
            connectionsToday: stats.connectionsToday || 0,
            connectionsChange: stats.connectionsChange || "Aucune donnée"
          },
          loading: false
        }));
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur fetch stats:', error);
      
      // Fallback avec stats par défaut
      const defaultStats = {
        newUsersThisWeek: 0,
        newStructuresThisWeek: 0,
        connectionsToday: 0,
        connectionsChange: "Aucune donnée"
      };
      
      set(state => ({ 
        stats: {
          ...state.stats,
          ...defaultStats
        },
        error: error.response?.data?.message || 'Erreur lors du chargement des stats',
        loading: false
      }));
      
      return { success: false, error: error.message };
    }
  },

  // Utilitaires et validation
  validateUserData: (userData) => {
    if (!userData.email || !userData.email.includes('@')) {
      return 'Email invalide';
    }
    
    if (!userData.first_name || userData.first_name.trim().length < 2) {
      return 'Le prénom doit contenir au moins 2 caractères';
    }
    
    if (!userData.last_name || userData.last_name.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!userData.role || !['admin', 'director', 'animator'].includes(userData.role)) {
      return 'Rôle invalide';
    }
    
    if (!userData.password || userData.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    return null;
  },

  validateStructureData: (structureData) => {
    if (!structureData.name || structureData.name.trim().length < 3) {
      return 'Le nom de la structure doit contenir au moins 3 caractères';
    }
    
    if (!structureData.address || structureData.address.trim().length < 5) {
      return 'L\'adresse doit contenir au moins 5 caractères';
    }
    
    if (!structureData.city || structureData.city.trim().length < 2) {
      return 'La ville doit contenir au moins 2 caractères';
    }
    
    if (!structureData.postal_code || !/^\d{5}$/.test(structureData.postal_code)) {
      return 'Le code postal doit contenir exactement 5 chiffres';
    }
    
    if (structureData.email && !structureData.email.includes('@')) {
      return 'Email de la structure invalide';
    }
    
    if (structureData.manager_email && !structureData.manager_email.includes('@')) {
      return 'Email du responsable invalide';
    }
    
    return null;
  },

  updateUserStats: (users) => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.active !== false).length;
    
    // Grouper par rôle
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    set((state) => ({
      stats: {
        ...state.stats,
        totalUsers,
        activeUsers,
        usersByRole
      }
    }));
  },

  updateStructureStats: (structures) => {
    const totalStructures = structures.length;
    
    set((state) => ({
      stats: {
        ...state.stats,
        totalStructures
      }
    }));
  },

  // Getters et utilitaires
  getUserById: (userId) => {
    return get().users.find(user => user.id === userId);
  },

  getStructureById: (structureId) => {
    return get().structures.find(structure => structure.id === structureId);
  },

  getUsersByStructure: (structureId) => {
    return get().users.filter(user => user.structure_id === structureId);
  },

  getUsersByRole: (role) => {
    return get().users.filter(user => user.role === role);
  },

  getActiveUsers: () => {
    return get().users.filter(user => user.active !== false);
  },

  searchUsers: (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    return get().users.filter(user => 
      user.first_name.toLowerCase().includes(normalizedQuery) ||
      user.last_name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  },

  searchStructures: (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    return get().structures.filter(structure => 
      structure.name.toLowerCase().includes(normalizedQuery) ||
      structure.city.toLowerCase().includes(normalizedQuery)
    );
  },

  // Actions de gestion
  clearError: () => set({ error: null }),

  reset: () => set({
    users: [],
    structures: [],
    stats: {
      totalUsers: 0,
      totalStructures: 0,
      activeUsers: 0,
      recentActivity: []
    },
    loading: false,
    error: null,
    lastUpdate: null
  }),

  // Actions de bulk
  bulkUpdateUsers: async (userIds, updateData) => {
    set({ error: null });
    
    try {
      const response = await api.put('/users/bulk', {
        user_ids: userIds,
        update_data: updateData
      });
      
      if (response.data.success) {
        // Recharger les utilisateurs
        await get().fetchUsers();
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour en lot');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour en lot';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  exportUsers: async (format = 'csv') => {
    try {
      const response = await api.get(`/users/export?format=${format}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'export';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  }
}));