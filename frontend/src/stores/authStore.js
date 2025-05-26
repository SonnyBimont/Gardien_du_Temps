// Store Zustand pour l'authentification
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post('/api/auth/login', credentials);
          
          if (response.data.success) {
            const { token, user } = response.data;
            
            // Stocker le token
            localStorage.setItem('authToken', token);
            
            // Mettre à jour l'état
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              loading: false,
              error: null
            });
            
            return { success: true, user };
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

      logout: () => {
        // Nettoyer le stockage local
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Réinitialiser l'état
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null,
          loading: false
        });
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      },

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
          const response = await api.get('/api/auth/me');
          
          if (response.data.success) {
            set({ 
              user: response.data.user, 
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

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
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