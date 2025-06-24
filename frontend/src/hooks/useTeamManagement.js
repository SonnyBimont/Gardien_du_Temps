// ✅ CORRIGER : frontend/src/hooks/useTeamManagement.js
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTimeStore } from '../stores/timeStore';
import { logger } from '../utils/logger';

/**
 * Hook pour gérer toute la logique de gestion d'équipe
 * @param {number|null} structureId - ID de la structure
 * @returns {Object} Toutes les fonctions et états pour la gestion d'équipe
 */
export const useTeamManagement = (structureId = null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_week');
  
  const { user } = useAuthStore();
  const { fetchTeamSummary } = useTimeStore();

  // ID structure effectif
  const effectiveStructureId = structureId || user?.structure_id;

  /**
   * Charger les données de l'équipe
   */
  const loadTeamData = useCallback(async (period = selectedPeriod) => {
    if (!effectiveStructureId) {
      logger.warn('⚠️ Pas de structure_id pour charger les données équipe');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      logger.log('🔄 Chargement données équipe via hook...', { structureId: effectiveStructureId, period });

      // ✅ UTILISER : La fonction existante du store
      const result = await fetchTeamSummary(period, effectiveStructureId);
      
      if (result.success && result.data) {
        const processedData = result.data.users || [];
        logger.log('✅ Données équipe reçues via hook:', processedData.length, 'entrées');
        setLoading(false);
        return processedData;
      } else {
        throw new Error('Pas de données reçues de l\'API');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des données équipe';
      logger.error('❌ Erreur chargement équipe via hook:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [effectiveStructureId, selectedPeriod, fetchTeamSummary]);

  /**
   * Changer la période sélectionnée
   */
  const changePeriod = useCallback(async (newPeriod) => {
    setSelectedPeriod(newPeriod);
    return await loadTeamData(newPeriod);
  }, [loadTeamData]);

  /**
   * Rafraîchir les données
   */
  const refreshTeamData = useCallback(() => {
    return loadTeamData(selectedPeriod);
  }, [loadTeamData, selectedPeriod]);

  /**
   * Formater les minutes en heures/minutes
   */
  const formatMinutes = useCallback((minutes) => {
    if (!minutes || isNaN(minutes)) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    if (effectiveStructureId) {
      loadTeamData();
    }
  }, [effectiveStructureId]); // Seulement quand la structure change

  // ✅ RETURN : Un seul return à la fin
  return {
    // État
    loading,
    error,
    selectedPeriod,
    
    // Actions
    loadTeamData,
    changePeriod,
    refreshTeamData,
    
    // Fonctions utilitaires
    formatMinutes,
    
    // Métadonnées
    effectiveStructureId,
    isReady: !!effectiveStructureId
  };
};