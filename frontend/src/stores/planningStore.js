/**
 * ===== PLANNING STORE - STORE ZUSTAND PLANIFICATION HORAIRE =====
 * 
 * Store spécialisé dans la gestion de la planification d'heures de travail annuelle.
 * Permet de définir des objectifs horaires et suivre leur réalisation.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Récupération de la planification annuelle avec calculs automatiques
 * - Support des types d'année (civile/scolaire) via dateUtils
 * - Upsert (création/mise à jour) de plannings individuels
 * - Calculs automatiques : objectif annuel, planifié, restant, taux de completion
 * - Gestion d'année sélectionnée avec persistance d'état
 * 
 * DONNÉES GÉRÉES :
 * - annual_objective : Objectif d'heures annuel
 * - total_planned : Total des heures planifiées
 * - remaining_hours : Heures restantes à planifier
 * - completion_rate : Pourcentage de réalisation
 * - planning[] : Détail des plannings par période
 * 
 * ARCHITECTURE SIMPLE ET EFFICACE :
 * - Store Zustand léger et focalisé
 * - Intégration avec dateUtils pour gestion année scolaire/civile
 * - Gestion d'erreurs basique mais suffisante
 * - API REST standard avec paramètres optionnels
 * 
 * POINTS POSITIFS :
 * - Code concis et bien structuré
 * - Intégration propre avec les utilitaires de dates
 * - Gestion d'état simple et prévisible
 * - API claire et cohérente
 * 
 * AMÉLIORATIONS MINEURES POSSIBLES :
 * - Ajouter cache local pour éviter les appels API répétés
 * - Logging conditionnel pour debug (actuellement console.error toujours)
 * - Validation côté client des données de planning
 */

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

  // Fonction pour récupérer les bornes de l'année sélectionnée
  upsertPlanning: async (planningData) => {
    try {
      const response = await api.post('/hour-planning/upsert', planningData);
      
      if (response.data.success) {
        // Recharger les données après modification
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