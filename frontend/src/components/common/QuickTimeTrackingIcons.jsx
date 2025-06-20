import React, { useState, useEffect } from 'react';
import { Clock, Coffee, LogOut } from 'lucide-react';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { useTimeStore } from '../../stores/timeStore'; 
import { useAuthStore } from '../../stores/authStore';

const QuickTimeTrackingIcons = () => {
  const [feedback, setFeedback] = useState(null);
  const { handleClockIn, handleBreakStart, handleBreakEnd, handleClockOut, loading, error } = useTimeTracking();
  const { getTodayStatus, canPerformAction,fetchTodayEntries } = useTimeStore(); // 
  const { user,isAuthenticated } = useAuthStore();

  // Rafraîchir les données au montage et changement d'utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 Rafraîchissement données pointage pour:', user.email);
      fetchTodayEntries(user.id);
    }
  }, [isAuthenticated, user?.id, fetchTodayEntries]);

   // Afficher les erreurs du store
  useEffect(() => {
    if (error) {
      showFeedback(`❌ ${error}`, 'error');
    }
  }, [error]); 

  //  Ne pas afficher les icônes si pas connecté
  if (!isAuthenticated || !user) {
    return null;
  }

  // Fonction pour afficher un feedback temporaire
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2000);
  };

  // Gestionnaire pour l'icône Clock (Entrée/Sortie intelligent)
  const handleClockAction = async () => {
    try {
      const todayStatus = getTodayStatus();
      console.log('📊 État du jour:', todayStatus);
      
      if (!todayStatus.arrival) {
        console.log('🔄 Pas d\'arrivée -> Clock In');
        const result = await handleClockIn();
        if (result.success) {
          showFeedback('✅ Arrivée enregistrée', 'success');
        } else {
          showFeedback(`❌ ${result.error}`, 'error');
        }
      } else if (!todayStatus.departure) {
        console.log('🔄 Pas de départ -> Clock Out');
        const result = await handleClockOut();
        if (result.success) {
          showFeedback('✅ Départ enregistré', 'success');
        } else {
          showFeedback(`❌ ${result.error}`, 'error');
        }
      } else {
        showFeedback('ℹ️ Journée terminée', 'warning');
      }
    } catch (error) {
      console.error('❌ Erreur handleClockAction:', error);
      showFeedback('❌ Erreur pointage', 'error');
    }
  };


  // Gestionnaire pour l'icône Coffee (Pause intelligente)
  const handleBreakAction = async () => {
    try {
      const todayStatus = getTodayStatus();
      console.log('📊 État pause:', todayStatus);
      
      if (!todayStatus.arrival) {
        showFeedback('⚠️ Pointez d\'abord votre arrivée', 'warning');
        return;
      }
      
      if (todayStatus.departure) {
        showFeedback('⚠️ Journée terminée', 'warning');
        return;
      }
      
      // Logique de pause simplifiée
      const hasActiveBreak = todayStatus.breakStart && !todayStatus.breakEnd;
      
      if (hasActiveBreak) {
        console.log('🔄 Fin de pause');
        const result = await handleBreakEnd();
        if (result.success) {
          showFeedback('🔄 Pause terminée', 'success');
        } else {
          showFeedback(`❌ ${result.error}`, 'error');
        }
      } else {
        console.log('🔄 Début de pause');
        const result = await handleBreakStart();
        if (result.success) {
          showFeedback('☕ Pause commencée', 'success');
        } else {
          showFeedback(`❌ ${result.error}`, 'error');
        }
      }
    } catch (error) {
      console.error('❌ Erreur handleBreakAction:', error);
      showFeedback('❌ Erreur pause', 'error');
    }
  };


  // Gestionnaire pour l'icône LogOut (Sortie directe)
  const handleDirectClockOut = async () => {
    try {
      const result = await handleClockOut();
      if (result.success) {
        showFeedback('✅ Départ enregistré', 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur handleDirectClockOut:', error);
      showFeedback('❌ Erreur départ', 'error');
    }
  };

  // ✅ Reste du code identique...
  const iconClass = `
    w-8 h-8 p-1.5 rounded-lg cursor-pointer transition-all duration-200 
    hover:scale-110 hover:shadow-lg active:scale-95
    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="flex items-center space-x-2 relative">
         {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mr-2">
          {getTodayStatus().arrival ? '✅' : '❌'} 
          {getTodayStatus().breakStart && !getTodayStatus().breakEnd ? '☕' : ''} 
          {getTodayStatus().departure ? '🏠' : ''}
        </div>
            )}
      {/* Icône Pointage Entrée/Sortie */}
      <div
        onClick={!loading ? handleClockAction : undefined}
        className={`${iconClass} bg-green-100 hover:bg-green-200 text-green-600`}
        title="Pointage Entrée/Sortie"
      >
        <Clock className="w-full h-full" />
      </div>

      {/* Icône Pause */}
      <div
        onClick={!loading ? handleBreakAction : undefined}
        className={`${iconClass} bg-orange-100 hover:bg-orange-200 text-orange-600`}
        title="Gestion Pause"
      >
        <Coffee className="w-full h-full" />
      </div>

      {/* Icône Sortie directe */}
      <div
        onClick={!loading ? handleDirectClockOut : undefined}
        className={`${iconClass} bg-red-100 hover:bg-red-200 text-red-600`}
        title="Pointage Sortie"
      >
        <LogOut className="w-full h-full" />
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`
          absolute top-12 right-0 z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
          ${feedback.type === 'success' ? 'bg-green-500 text-red' : ''}
          ${feedback.type === 'error' ? 'bg-red-500 text-red' : ''}
          ${feedback.type === 'warning' ? 'bg-orange-500 text-red' : ''}
          animate-in slide-in-from-top-2 duration-300
        `}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default QuickTimeTrackingIcons;