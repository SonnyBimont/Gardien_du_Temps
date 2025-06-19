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
  recentActivity: [], // Ajout pour l'activité récente
  loading: false,
  error: null,
  lastUpdate: null,

  // ===== ACTIONS UTILISATEURS (INCHANGÉES) =====
  
  fetchUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres optionnels
      if (filters.role) params.append('role', filters.role);
      if (filters.structure_id) params.append('structure_id', filters.structure_id);
      if (filters.active !== undefined) params.append('active', filters.active);
      
      const response = await api.get(`/users?${params}`);
      
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
      
      const response = await api.post('/users', userData);
      
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
    console.log('🔧 adminStore.updateUser appelé avec:', { userId, userData });
    
    try {
      const response = await api.put(`/users/${userId}`, userData);
      console.log('✅ Réponse API updateUser:', response.data);
      
      if (response.data.success) {
        // Mettre à jour la liste des utilisateurs
        set(state => ({
          users: state.users.map(user => 
            user.id === userId 
              ? { ...user, ...response.data.data }
              : user
          )
        }));
        
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('❌ Erreur updateUser:', error);
      console.error('❌ Réponse d\'erreur:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  deleteUser: async (userId) => {
    set({ error: null });
    
    try {
      const response = await api.delete(`/users/${userId}`);
      
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
    set({ error: null });
    
    try {
      console.log(`🔄 Toggle user ${userId} to ${active ? 'active' : 'inactive'}`);
      
      // UTILISER la route PATCH spécifique
      const response = await api.patch(`/users/${userId}/toggle-status`, { active });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        
        set((state) => ({
          users: state.users.map(user => 
            user.id === userId ? updatedUser : user
          ),
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateUserStats(get().users);
        
        console.log(`✅ User ${userId} ${active ? 'activé' : 'désactivé'}`);
        
        return { success: true, data: updatedUser };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la modification du statut';
      
      set({ error: errorMessage });
      
      console.error('❌ Erreur toggle user status:', errorMessage);
      
      return { success: false, error: errorMessage };
    }
  },

  // ===== ACTIONS STRUCTURES (INCHANGÉES) =====
  
  fetchStructures: async (includeStats = false) => {
    set({ loading: true, error: null });
    
    try {
      const params = includeStats ? '?include_stats=true' : '';
      const response = await api.get(`/structures${params}`);
      
      if (response.data.success) {
        const structures = response.data.data || [];
        console.log('🏢 Structures à mettre dans le store:', structures);
        
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
      
      const response = await api.post('/structures', structureData);
      
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
      const response = await api.put(`/structures/${structureId}`, structureData);
      
      if (response.data.success) {
        const updatedStructure = response.data.data;
        
        set((state) => ({
          structures: state.structures.map(structure => 
            structure.id === structureId ? updatedStructure : structure
          ),
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateStructureStats(get().structures);
        
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
      const response = await api.delete(`/structures/${structureId}`);
      
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

  // ===== 🆕 ACTIONS STATISTIQUES AVEC SUPPORT PÉRIODES FIXES =====
  
  // Fonction principale pour récupérer les statistiques avec gestion des périodes fixes
  fetchStats: async (days = null, startDate = null, endDate = null) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔄 fetchStats appelé avec:', { days, startDate, endDate });
      
      const params = new URLSearchParams();
      
      // 🆕 NOUVEAU: Support des périodes fixes via startDate/endDate
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        console.log('📅 Utilisation période fixe:', { startDate, endDate });
      } else if (days) {
        // Fallback vers la logique glissante
        params.append('days', days.toString());
        console.log('📅 Utilisation période glissante:', days, 'jours');
      } else {
        // Par défaut: 7 jours
        params.append('days', '7');
        console.log('📅 Utilisation période par défaut: 7 jours');
      }
      
      // 🆕 PRIORITÉ 1: Essayer d'abord la nouvelle route avec périodes fixes
      try {
        const response = await api.get(`/users/admin/stats-fixed?${params}`);
        console.log('📡 Réponse API stats-fixed (nouvelle route):', response.data);
        
        if (response.data?.success) {
          const statsData = response.data.data || {};
          
          set(state => ({ 
            stats: {
              ...state.stats,
              ...statsData,
              // Garder les noms de champs pour compatibilité frontend
              newUsersThisWeek: statsData.newUsersThisWeek || statsData.new_users_period || 0,
              newStructuresThisWeek: statsData.newStructuresThisWeek || statsData.new_structures_period || 0
            },
            loading: false,
            lastUpdate: new Date().toISOString()
          }));
          
          console.log('✅ Stats mises à jour via nouvelle route');
          return { success: true, data: statsData };
        }
      } catch (fixedRouteError) {
        console.warn('⚠️ Nouvelle route stats-fixed non disponible, fallback vers ancienne route:', fixedRouteError.response?.status);
        
        // 🔄 FALLBACK: Utiliser l'ancienne route
        if (fixedRouteError.response?.status === 404) {
          const response = await api.get(`/users/admin/stats?${params}`);
          console.log('📡 Réponse API stats (ancienne route):', response.data);
          
          if (response.data?.success) {
            const statsData = response.data.data || {};
            
            set(state => ({ 
              stats: {
                ...state.stats,
                ...statsData,
                // Mapping pour compatibilité
                newUsersThisWeek: statsData.newUsersThisWeek || statsData.new_users_period || 0,
                newStructuresThisWeek: statsData.newStructuresThisWeek || statsData.new_structures_period || 0
              },
              loading: false,
              lastUpdate: new Date().toISOString()
            }));
            
            console.log('✅ Stats mises à jour via ancienne route (fallback)');
            return { success: true, data: statsData };
          } else {
            throw new Error(response.data?.message || 'Réponse API invalide');
          }
        } else {
          // Re-lancer l'erreur si ce n'est pas un 404
          throw fixedRouteError;
        }
      }
    } catch (error) {
      console.error('❌ Erreur fetch stats détaillée:', error);
      
      // Fallback avec données par défaut
      const fallbackStats = {
        newUsersThisWeek: 0,
        newStructuresThisWeek: 0,
        total_entries: 0,
        active_users_period: 0,
        connectionsChange: "Service indisponible"
      };
      
      set(state => ({ 
        stats: {
          ...state.stats,
          ...fallbackStats
        },
        loading: false,
        error: error.response?.data?.message || error.message
      }));
      
      return { success: false, error: error.message };
    }
  },

  // Fonction dashboard avec support des périodes fixes
  fetchDashboardStats: async (days = null, startDate = null, endDate = null) => {
    try {
      console.log('🔄 fetchDashboardStats appelé avec:', { days, startDate, endDate });
      
      const params = new URLSearchParams();
      
      // 🆕 NOUVEAU: Support des périodes fixes via startDate/endDate
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        console.log('📅 Dashboard période fixe:', { startDate, endDate });
      } else if (days) {
        // Fallback vers la logique glissante
        params.append('days', days.toString());
        console.log('📅 Dashboard période glissante:', days, 'jours');
      } else {
        // Par défaut: 7 jours
        params.append('days', '7');
        console.log('📅 Dashboard période par défaut: 7 jours');
      }
      
      // 🆕 PRIORITÉ 1: Essayer d'abord la nouvelle route dashboard avec périodes fixes
      try {
        const response = await api.get(`/users/admin/dashboard-stats-fixed?${params}`);
        console.log('📡 Réponse API dashboard-stats-fixed (nouvelle route):', response.data);
        
        if (response.data.success) {
          const dashboardData = response.data.data || {};
          
          set(state => ({
            stats: {
              ...state.stats,
              ...dashboardData,
              // Mapping pour compatibilité
              newUsersThisWeek: dashboardData.new_users_period || 0,
              newStructuresThisWeek: dashboardData.new_structures_period || 0,
              todayEntries: dashboardData.today_entries || 0,
              activeUsersToday: dashboardData.active_users_today || 0
            }
          }));
          
          console.log('✅ Dashboard stats mises à jour via nouvelle route');
          return { success: true, data: dashboardData };
        }
      } catch (fixedRouteError) {
        console.warn('⚠️ Nouvelle route dashboard-stats-fixed non disponible, fallback vers ancienne route:', fixedRouteError.response?.status);
        
        // 🔄 FALLBACK: Utiliser l'ancienne route
        if (fixedRouteError.response?.status === 404) {
          const response = await api.get(`/users/admin/dashboard-stats?${params}`);
          console.log('📡 Réponse API dashboard-stats (ancienne route):', response.data);
          
          if (response.data.success) {
            const dashboardData = response.data.data || {};
            
            set(state => ({
              stats: {
                ...state.stats,
                ...dashboardData,
                // Mapping pour compatibilité
                newUsersThisWeek: dashboardData.new_users_period || dashboardData.newUsersThisWeek || 0,
                newStructuresThisWeek: dashboardData.new_structures_period || dashboardData.newStructuresThisWeek || 0,
                todayEntries: dashboardData.today_entries || dashboardData.todayEntries || 0,
                activeUsersToday: dashboardData.active_users_today || dashboardData.activeUsersToday || 0
              }
            }));
            
            console.log('✅ Dashboard stats mises à jour via ancienne route (fallback)');
            return { success: true, data: dashboardData };
          } else {
            throw new Error(response.data?.message || 'Réponse API invalide');
          }
        } else {
          // Re-lancer l'erreur si ce n'est pas un 404
          throw fixedRouteError;
        }
      }
    } catch (error) {
      console.error('❌ Erreur dashboard stats:', error);
      set({ error: error.response?.data?.message || error.message });
      return { success: false, error: error.message };
    }
  },

  // Fonction pour récupérer l'activité récente avec support des périodes
  fetchRecentActivity: async (limit = 10, days = 1, startDate = null, endDate = null) => {
    try {
      console.log('🔄 fetchRecentActivity appelé avec:', { limit, days, startDate, endDate });
      
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      // Support des périodes pour l'activité récente
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        console.log('📅 Activité récente période fixe:', { startDate, endDate });
      } else if (days) {
        params.append('days', days.toString());
        console.log('📅 Activité récente période glissante:', days, 'jours');
      }
      
      // 🆕 PRIORITÉ 1: Essayer d'abord la nouvelle route avec support des périodes
      try {
        const response = await api.get(`/users/admin/recent-activity-period?${params}`);
        console.log('📡 Réponse API recent-activity-period (nouvelle route):', response.data);
        
        if (response.data.success) {
          const activityData = response.data.data || [];
          
          set({ 
            recentActivity: activityData,
            lastUpdate: new Date().toISOString()
          });
          
          console.log('✅ Activité récente mise à jour via nouvelle route:', activityData.length, 'entrées');
          return { success: true, data: activityData };
        }
      } catch (fixedRouteError) {
        console.warn('⚠️ Nouvelle route recent-activity-period non disponible, fallback vers ancienne route:', fixedRouteError.response?.status);
        
        // 🔄 FALLBACK: Utiliser l'ancienne route
        if (fixedRouteError.response?.status === 404) {
          const fallbackParams = new URLSearchParams();
          fallbackParams.append('limit', limit.toString());
          
          const response = await api.get(`/users/admin/recent-activity?${fallbackParams}`);
          console.log('📡 Réponse API recent-activity (ancienne route):', response.data);
          
          if (response.data.success) {
            const activityData = response.data.data || [];
            
            set({ 
              recentActivity: activityData,
              lastUpdate: new Date().toISOString()
            });
            
            console.log('✅ Activité récente mise à jour via ancienne route (fallback):', activityData.length, 'entrées');
            return { success: true, data: activityData };
          } else {
            throw new Error(response.data?.message || 'Réponse API invalide');
          }
        } else {
          // Re-lancer l'erreur si ce n'est pas un 404
          throw fixedRouteError;
        }
      }
    } catch (error) {
      console.error('❌ Erreur activité récente:', error);
      
      // Fallback silencieux - ne pas bloquer l'interface
      set({ 
        recentActivity: [],
        error: null // Ne pas afficher d'erreur pour cette fonctionnalité optionnelle
      });
      
      return { success: false, error: error.message };
    }
  },

  // ===== FONCTIONS UTILITAIRES (INCHANGÉES) =====
  
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

    if (structureData.phone && structureData.phone.length < 10) {
    return 'Le téléphone doit contenir au moins 10 caractères';
    }

    if (structureData.capacity && (isNaN(structureData.capacity) || structureData.capacity < 1)) {
    return 'La capacité doit être un nombre positif';
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

  // Getters et utilitaires (inchangés)
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
    recentActivity: [],
    loading: false,
    error: null,
    lastUpdate: null
  }),

  // Actions de bulk (inchangées)
  bulkUpdateUsers: async (userIds, updateData) => {
    set({ error: null });
    
    try {
      const response = await api.put('/users/bulk', {
        user_ids: userIds,
        update_data: updateData
      });
      
      if (response.data.success) {
        const updatedUsers = response.data.data;
        
        set((state) => ({
          users: state.users.map(user => {
            const updated = updatedUsers.find(u => u.id === user.id);
            return updated ? updated : user;
          }),
          lastUpdate: new Date().toISOString()
        }));
        
        // Mettre à jour les statistiques
        get().updateUserStats(get().users);
        
        return { success: true, data: updatedUsers };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour en lot');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour en lot';
      
      set({ error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  },

  // Fonction pour exporter les utilisateurs (inchangée)
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