import api from '../services/api';
import { logger } from '../utils/logger';
import { TRACKING_TYPES } from '../constants/timeTracking';

export class TimeTrackingService {
  /**
   * Pointer l'arrivée d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number|null} taskId - ID de la tâche (optionnel)
   * @returns {Promise<Object>} Données de l'entrée créée
   */
  static async clockIn(userId, taskId = null) {
    try {
      logger.log('🕐 Service clockIn pour utilisateur:', userId);
      
      const response = await api.post('/time-tracking/clock-in', {
        user_id: userId,
        task_id: taskId,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        logger.log('✅ ClockIn réussi:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors du pointage d\'arrivée');
      
    } catch (error) {
      logger.error('❌ Erreur TimeTrackingService.clockIn:', error);
      throw error;
    }
  }

  /**
   * Pointer la sortie d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Données de l'entrée mise à jour
   */
  static async clockOut(userId) {
    try {
      logger.log('🚪 Service clockOut pour utilisateur:', userId);
      
      const response = await api.post('/time-tracking/clock-out', {
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        logger.log('✅ ClockOut réussi:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors du pointage de sortie');
      
    } catch (error) {
      logger.error('❌ Erreur TimeTrackingService.clockOut:', error);
      throw error;
    }
  }

  /**
   * Commencer une pause
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Données de l'entrée de pause
   */
  static async startBreak(userId) {
    try {
      logger.log('☕ Service startBreak pour utilisateur:', userId);
      
      const response = await api.post('/time-tracking/break-start', {
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        logger.log('✅ StartBreak réussi:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors du début de pause');
      
    } catch (error) {
      logger.error('❌ Erreur TimeTrackingService.startBreak:', error);
      throw error;
    }
  }

  /**
   * Terminer une pause
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Données de l'entrée de fin de pause
   */
  static async endBreak(userId) {
    try {
      logger.log('🔄 Service endBreak pour utilisateur:', userId);
      
      const response = await api.post('/time-tracking/break-end', {
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        logger.log('✅ EndBreak réussi:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la fin de pause');
      
    } catch (error) {
      logger.error('❌ Erreur TimeTrackingService.endBreak:', error);
      throw error;
    }
  }

  /**
   * Récupérer les entrées d'une période
   * @param {number} userId - ID de l'utilisateur
   * @param {string} startDate - Date de début (ISO)
   * @param {string} endDate - Date de fin (ISO)
   * @returns {Promise<Array>} Liste des entrées
   */
  static async getEntries(userId, startDate, endDate) {
    try {
      logger.log('📊 Service getEntries pour utilisateur:', userId, 'période:', startDate, 'à', endDate);
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/time-tracking/user/${userId}?${params}`);
      
      if (response.data.success) {
        logger.log('✅ GetEntries réussi:', response.data.data?.length, 'entrées');
        return response.data.data || [];
      }
      
      throw new Error(response.data.message || 'Erreur lors de la récupération des données');
      
    } catch (error) {
      logger.error('❌ Erreur TimeTrackingService.getEntries:', error);
      throw error;
    }
  }
}