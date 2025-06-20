// ✅ CORRIGER : Le hook pour utiliser la bonne API

import { useState } from 'react';
import { useTimeStore } from '../stores/timeStore';
import { useAuthStore } from '../stores/authStore';

export const useTimeTracking = () => {
  const [loading, setLoading] = useState(false);
  const { fetchTodayEntries, error: storeError } = useTimeStore();
  const { user, isAuthenticated } = useAuthStore();

  const handleClockIn = async () => {
    if (!isAuthenticated || !user) {
      console.warn('⚠️ Utilisateur non connecté');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    setLoading(true);
    try {
      console.log('🕐 Tentative pointage entrée pour:', user.email);
      
      // ✅ UTILISER l'API quick directement
      const response = await fetch('/api/time-tracking/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Rafraîchir les données
        await fetchTodayEntries(user.id);
        console.log('✅ Pointage entrée réussi');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Erreur de pointage');
      }
    } catch (error) {
      console.error('❌ Erreur pointage entrée:', error);
      return { success: false, error: error.message || 'Erreur de pointage' };
    } finally {
      setLoading(false);
    }
  };

  const handleBreakStart = async () => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    setLoading(true);
    try {
      console.log('☕ Tentative début pause pour:', user.email);
      
      const response = await fetch('/api/time-tracking/break-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTodayEntries(user.id);
        console.log('✅ Début pause réussi');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Erreur de pause');
      }
    } catch (error) {
      console.error('❌ Erreur début pause:', error);
      return { success: false, error: error.message || 'Erreur de pause' };
    } finally {
      setLoading(false);
    }
  };

  const handleBreakEnd = async () => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    setLoading(true);
    try {
      console.log('🔄 Tentative fin pause pour:', user.email);
      
      const response = await fetch('/api/time-tracking/break-end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTodayEntries(user.id);
        console.log('✅ Fin pause réussie');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Erreur de pause');
      }
    } catch (error) {
      console.error('❌ Erreur fin pause:', error);
      return { success: false, error: error.message || 'Erreur de pause' };
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    setLoading(true);
    try {
      console.log('🚪 Tentative pointage sortie pour:', user.email);
      
      const response = await fetch('/api/time-tracking/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTodayEntries(user.id);
        console.log('✅ Pointage sortie réussi');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Erreur de pointage');
      }
    } catch (error) {
      console.error('❌ Erreur pointage sortie:', error);
      return { success: false, error: error.message || 'Erreur de pointage' };
    } finally {
      setLoading(false);
    }
  };

  return {
    handleClockIn,
    handleBreakStart,
    handleBreakEnd,
    handleClockOut,
    loading,
    error: storeError
  };
};