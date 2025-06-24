// ✅ MODIFIER : frontend/src/components/common/QuickTimeTrackingIcons.jsx
import React, { useState } from 'react';
import { Clock, Coffee, LogOut } from 'lucide-react';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { useAuthStore } from '../../stores/authStore';

const QuickTimeTrackingIcons = () => {
  const [feedback, setFeedback] = useState(null);
  const { user } = useAuthStore();
  
  // ✅ UTILISER : Le nouveau hook
  const {
    actionLoading,
    canClockIn,
    canPauseOrResume,
    canClockOut,
    handleIntelligentClockAction,
    handleIntelligentBreakAction,
    clockOut,
    getTodayStatus,
    isOnBreak
  } = useTimeTracking(user?.id);

  // Ne pas afficher si pas directeur
  if (user?.role !== 'director') {
    return null;
  }

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2000);
  };

  // ✅ SIMPLIFIER : Gestionnaires avec le hook
  const handleClockClick = async () => {
    try {
      const result = await handleIntelligentClockAction();
      if (result.success) {
        const status = getTodayStatus();
        const message = !status.arrival ? '✅ Arrivée enregistrée' : '✅ Départ enregistré';
        showFeedback(message, 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur lors du pointage', 'error');
    }
  };

  const handleBreakClick = async () => {
    try {
      const result = await handleIntelligentBreakAction();
      if (result.success) {
        const message = isOnBreak() ? '🔄 Pause terminée' : '☕ Pause commencée';
        showFeedback(message, 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur gestion pause', 'error');
    }
  };

  const handleDirectClockOut = async () => {
    try {
      const result = await clockOut();
      if (result.success) {
        showFeedback('✅ Départ enregistré', 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur pointage sortie', 'error');
    }
  };

  const iconClass = `
    w-8 h-8 p-1.5 rounded-lg cursor-pointer transition-all duration-200 
    hover:scale-110 hover:shadow-lg active:scale-95
  `;

  return (
    <div className="flex items-center space-x-2 relative">
      {/* Debug en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mr-2">
          {canClockIn ? '🟢' : canClockOut ? '🔴' : '⚪'} 
          {isOnBreak() ? '☕' : ''} 
        </div>
      )}
      
      {/* Icône Clock - Arrivée/Départ intelligent */}
      <div
        onClick={!actionLoading && (canClockIn || canClockOut) ? handleClockClick : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canClockIn 
            ? 'bg-green-100 hover:bg-green-200 text-green-600 cursor-pointer'
            : canClockOut
            ? 'bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          canClockIn ? 'Pointage Arrivée' : 
          canClockOut ? 'Pointage Départ' : 
          'Non disponible'
        }
      >
        <Clock className="w-full h-full" />
      </div>

      {/* Icône Coffee - Pause/Reprise intelligent */}
      <div
        onClick={!actionLoading && canPauseOrResume ? handleBreakClick : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canPauseOrResume
            ? 'bg-orange-100 hover:bg-orange-200 text-orange-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          !getTodayStatus().arrival ? 'Pointez d\'abord votre arrivée'
          : getTodayStatus().departure ? 'Journée terminée'
          : isOnBreak() ? 'Terminer la pause'
          : 'Commencer une pause'
        }
      >
        <Coffee className="w-full h-full" />
      </div>

      {/* Icône LogOut - Départ direct */}
      <div
        onClick={!actionLoading && canClockOut ? handleDirectClockOut : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canClockOut
            ? 'bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          !getTodayStatus().arrival ? 'Pointez d\'abord votre arrivée'
          : getTodayStatus().departure ? 'Départ déjà enregistré'
          : 'Pointage Départ'
        }
      >
        <LogOut className="w-full h-full" />
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`
          absolute top-12 right-0 z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
          ${feedback.type === 'success' ? 'bg-green-600 text-white border border-green-700' : ''}
          ${feedback.type === 'error' ? 'bg-red-600 text-white border border-red-700' : ''}
          animate-in slide-in-from-top-2 duration-300
        `}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default QuickTimeTrackingIcons;