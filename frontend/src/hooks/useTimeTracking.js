import { useState, useCallback, useMemo } from 'react';
import { useTimeStore } from '../stores/timeStore';
import { useAuthStore } from '../stores/authStore';
import { TimeTrackingService } from '../services/timeTrackingService';
import { TRACKING_TYPES } from '../constants/timeTracking';
import { logger } from '../utils/logger';
import { calculateTotalHours, getTodayStatus } from '../utils/time/calculations';
/**
 * Hook pour gérer toute la logique de pointage
 * @param {number|null} userId - ID de l'utilisateur (optionnel, prend l'utilisateur connecté par défaut)
 * @returns {Object} Toutes les fonctions et états pour le pointage
 */
export const useTimeTracking = (userId = null) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  
  // Stores
  const { todayEntries, fetchTodayEntries } = useTimeStore();
  const { user } = useAuthStore();
  
  // ID utilisateur effectif
  const effectiveUserId = userId || user?.id;
  
  // Entrées de l'utilisateur pour aujourd'hui
  const myTodayEntries = useMemo(() => {
    if (!effectiveUserId) return [];
    return todayEntries.filter(entry => entry?.user_id === effectiveUserId);
  }, [todayEntries, effectiveUserId]);

  /**
   * Calculer le statut du jour pour l'utilisateur
   */
  const getTodayStatus = useCallback(() => {
    const status = {
      arrival: null,
      departure: null,
      breakStart: null,
      breakEnd: null,
    };

    myTodayEntries.forEach(entry => {
      switch (entry.tracking_type) {
        case TRACKING_TYPES.ARRIVAL:
          if (!status.arrival || new Date(entry.date_time) > new Date(status.arrival.date_time)) {
            status.arrival = entry;
          }
          break;
        case TRACKING_TYPES.DEPARTURE:
          if (!status.departure || new Date(entry.date_time) > new Date(status.departure.date_time)) {
            status.departure = entry;
          }
          break;
        case TRACKING_TYPES.BREAK_START:
          status.breakStart = entry; // Prendre le dernier
          break;
        case TRACKING_TYPES.BREAK_END:
          status.breakEnd = entry; // Prendre le dernier
          break;
        default:
          break;
      }
    });

    return status;
  }, [myTodayEntries]);

  /**
   * Calculer toutes les pauses de la journée
   */
  const getPauses = useCallback((entries = myTodayEntries) => {
    const pauses = [];
    let currentBreakStart = null;

    entries
      .filter(e => e.tracking_type === TRACKING_TYPES.BREAK_START || e.tracking_type === TRACKING_TYPES.BREAK_END)
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
      .forEach(entry => {
        if (entry.tracking_type === TRACKING_TYPES.BREAK_START) {
          currentBreakStart = entry;
        } else if (entry.tracking_type === TRACKING_TYPES.BREAK_END && currentBreakStart) {
          pauses.push({ start: currentBreakStart, end: entry });
          currentBreakStart = null;
        }
      });

    // Si une pause est en cours
    if (currentBreakStart) {
      pauses.push({ start: currentBreakStart, end: null });
    }

    return pauses;
  }, [myTodayEntries]);

  /**
   * Vérifier si l'utilisateur est actuellement en pause
   */
  const isOnBreak = useCallback((entries = myTodayEntries) => {
    const pauses = getPauses(entries);
    return pauses.length > 0 && pauses[pauses.length - 1].end === null;
  }, [getPauses, myTodayEntries]);

  /**
   * Déterminer les actions possibles
   */
  const canClockIn = useMemo(() => {
    const status = getTodayStatus();
    return !status.arrival && !status.departure;
  }, [getTodayStatus]);

  const canPauseOrResume = useMemo(() => {
    const status = getTodayStatus();
    return status.arrival && !status.departure;
  }, [getTodayStatus]);

  const canClockOut = useMemo(() => {
    const status = getTodayStatus();
    return status.arrival && !status.departure;
  }, [getTodayStatus]);

  /**
   * Fonction principale pour gérer toutes les actions de pointage
   */
  const handleClockAction = useCallback(async (action, taskId = null) => {
    if (!effectiveUserId) {
      const error = 'Utilisateur non connecté';
      logger.error('❌ HandleClockAction:', error);
      setError(error);
      return { success: false, error };
    }

    if (actionLoading) {
      logger.warn('⚠️ Action déjà en cours');
      return { success: false, error: 'Action en cours' };
    }

    setActionLoading(action);
    setError(null);

    try {
      let result;

      switch (action) {
        case TRACKING_TYPES.ARRIVAL:
          logger.log('🕐 Début pointage arrivée pour:', effectiveUserId);
          result = await TimeTrackingService.clockIn(effectiveUserId, taskId);
          break;

        case TRACKING_TYPES.DEPARTURE:
          logger.log('🚪 Début pointage sortie pour:', effectiveUserId);
          result = await TimeTrackingService.clockOut(effectiveUserId);
          break;

        case TRACKING_TYPES.BREAK_START:
          logger.log('☕ Début pause pour:', effectiveUserId);
          result = await TimeTrackingService.startBreak(effectiveUserId);
          break;

        case TRACKING_TYPES.BREAK_END:
          logger.log('🔄 Fin pause pour:', effectiveUserId);
          result = await TimeTrackingService.endBreak(effectiveUserId);
          break;

        default:
          throw new Error(`Action non reconnue: ${action}`);
      }

      // Rafraîchir les données
      await fetchTodayEntries();

      logger.log('✅ Action réussie:', action, result);
      return { success: true, data: result };

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du pointage';
      logger.error('❌ Erreur handleClockAction:', action, errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setActionLoading(null);
    }
  }, [effectiveUserId, actionLoading, fetchTodayEntries]);

  /**
   * Actions spécifiques (raccourcis)
   */
  const clockIn = useCallback((taskId = null) => {
    return handleClockAction(TRACKING_TYPES.ARRIVAL, taskId);
  }, [handleClockAction]);

  const clockOut = useCallback(() => {
    return handleClockAction(TRACKING_TYPES.DEPARTURE);
  }, [handleClockAction]);

  const startBreak = useCallback(() => {
    return handleClockAction(TRACKING_TYPES.BREAK_START);
  }, [handleClockAction]);

  const endBreak = useCallback(() => {
    return handleClockAction(TRACKING_TYPES.BREAK_END);
  }, [handleClockAction]);

  /**
   * Action intelligente pour le bouton principal
   */
  const handleIntelligentClockAction = useCallback(async () => {
    const status = getTodayStatus();
    
    if (!status.arrival) {
      // Pas encore arrivé -> Pointage d'arrivée
      return await clockIn();
    } else if (!status.departure) {
      // Déjà arrivé mais pas parti -> Pointage de sortie
      return await clockOut();
    } else {
      // Journée terminée
      return { success: false, error: 'Journée déjà terminée' };
    }
  }, [getTodayStatus, clockIn, clockOut]);

  /**
   * Action intelligente pour les pauses
   */
  const handleIntelligentBreakAction = useCallback(async () => {
    const status = getTodayStatus();
    
    if (!status.arrival) {
      return { success: false, error: 'Pointez d\'abord votre arrivée' };
    }
    
    if (status.departure) {
      return { success: false, error: 'Journée déjà terminée' };
    }
    
    if (isOnBreak()) {
      // En pause -> Reprendre le travail
      return await endBreak();
    } else {
      // Au travail -> Commencer une pause
      return await startBreak();
    }
  }, [getTodayStatus, isOnBreak, startBreak, endBreak]);

  // Retourner toutes les données et fonctions nécessaires
  return {
    // État
    myTodayEntries,
    actionLoading,
    error,
    
    // Statut et vérifications
    getTodayStatus,
    getPauses,
    isOnBreak,
    canClockIn,
    canPauseOrResume,
    canClockOut,
    
    // Actions de base
    handleClockAction,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    
    // Actions intelligentes
    handleIntelligentClockAction,
    handleIntelligentBreakAction,
    
    // Métadonnées
    effectiveUserId,
    isReady: !!effectiveUserId
  };
};