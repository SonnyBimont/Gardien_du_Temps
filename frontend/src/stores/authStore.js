import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import { useTimeStore } from './timeStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

// Connexion
  login: async (credentials) => {
  set({ loading: true, error: null });
  try {
    const response = await api.post('/auth/login', credentials);

    if (response.data.success && response.data.token) {
      const token = response.data.token;
      localStorage.setItem('authToken', token);

      // Recharge le user depuis /auth/me pour avoir la structure à jour
      await get().checkAuth();

      set({ token, isAuthenticated: true, loading: false, error: null });
      return { success: true };
    } else {
      throw new Error(response.data.message || 'Échec de la connexion');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
    set({ 
      error: errorMessage, 
      loading: false,
      user: null,
      token: null,
      isAuthenticated: false
    });
    return { success: false, error: errorMessage };
  }
      },

// Déconnexion
  logout: async () => {
    try {
      await api.post('/auth/logout');
      
      // ✅ NOUVEAU : Nettoyer TOUS les stores lors de la déconnexion
      const timeStore = useTimeStore.getState();
      timeStore.reset(); // Nettoyer le timeStore
      
      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Nettoyer l'authStore
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });

      console.log('✅ Déconnexion et nettoyage des stores réussis');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      
      // ✅ FORCER le nettoyage même en cas d'erreur API
      const timeStore = useTimeStore.getState();
      timeStore.reset();
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    }
  },
      
// Vérification de l'authentification
      checkAuth: async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            loading: false
          });
          return;
        }

        set({ loading: true });

        try {
          const response = await api.get('/auth/me');
          
          if (response.data.success) {
            set({ 
              user: response.data.data, 
              token, 
              isAuthenticated: true,
              loading: false,
              error: null
            });
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Erreur vérification auth:', error);
          get().logout();
        }
      },

// Mise à jour de l'utilisateur
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

// Mise à jour du type d'année
updateYearType: async (yearType) => {
  console.log('🔄 AuthStore: Mise à jour yearType vers:', yearType);
  
  try {
    const response = await api.put('/users/profile', { year_type: yearType });
    console.log('📡 Réponse API:', response.data);
    
    if (response.data.success) {
      set(state => ({
        user: { ...state.user, year_type: yearType }
      }));
      
      const currentUser = get().user;
      const updatedUser = { ...currentUser, year_type: yearType };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ User mis à jour:', updatedUser);
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour type d\'année:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
},

      clearError: () => set({ error: null }),

      // Getters
      isAdmin: () => get().user?.role === 'admin',
      isDirector: () => get().user?.role === 'director',
      isAnimator: () => get().user?.role === 'animator',
      
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        // Les admins ont toutes les permissions
        if (user.role === 'admin') return true;
        
        // Logique des permissions spécifiques selon les rôles
        const permissions = {
          director: ['manage_team', 'view_reports', 'create_projects'],
          animator: ['track_time', 'view_own_data']
        };
        
        return permissions[user.role]?.includes(permission) || false;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);