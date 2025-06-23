import React, { useState } from 'react';
import { Clock, Coffee, LogOut } from 'lucide-react';
import { useTimeStore } from '../../stores/timeStore';
import { useAuthStore } from '../../stores/authStore';

const QuickTimeTrackingIcons = () => {
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // ✅ UTILISER : Les mêmes stores que DirectorDashboard
  const { 
    todayEntries, 
    fetchTodayEntries,
    clockIn,
    clockOut,
    startBreak,
    endBreak
  } = useTimeStore();
  
  const { user } = useAuthStore();

  // ✅ COPIER : La même logique que DirectorDashboard
  const myTodayEntries = todayEntries.filter(entry => entry?.user_id === user?.id);
  
  const getTodayStatusLocal = () => {
    const status = {
      arrival: null,
      departure: null,
      breakStart: null,
      breakEnd: null,
    };

    myTodayEntries.forEach(entry => {
      switch (entry.tracking_type) {
        case 'arrival':
          status.arrival = entry;
          break;
        case 'departure':
          status.departure = entry;
          break;
        case 'break_start':
          status.breakStart = entry;
          break;
        case 'break_end':
          status.breakEnd = entry;
          break;
        default:
          break;
      }
    });

    return status;
  };

  const status = getTodayStatusLocal();

  // ✅ COPIER : Les mêmes fonctions utilitaires que DirectorDashboard
  const getPauses = (entries) => {
    const pauses = [];
    let currentBreakStart = null;

    entries
      .filter(e => e.tracking_type === 'break_start' || e.tracking_type === 'break_end')
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
      .forEach(entry => {
        if (entry.tracking_type === 'break_start') {
          currentBreakStart = entry;
        } else if (entry.tracking_type === 'break_end' && currentBreakStart) {
          pauses.push({ start: currentBreakStart, end: entry });
          currentBreakStart = null;
        }
      });

    if (currentBreakStart) {
      pauses.push({ start: currentBreakStart, end: null });
    }

    return pauses;
  };

  const isOnBreak = (entries) => {
    const pauses = getPauses(entries);
    return pauses.length > 0 && pauses[pauses.length - 1].end === null;
  };

  // ✅ COPIER : Les mêmes conditions que DirectorDashboard
  const canClockIn = !status.arrival && !status.departure;
  const canPauseOrResume = status.arrival && !status.departure;
  const canClockOut = status.arrival && !status.departure;

  // ✅ COPIER : La même fonction handleClockAction que DirectorDashboard
  const handleClockAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);
    
    try {
      let result;
      switch (action) {
        case 'arrival':
          result = await clockIn();
          break;
        case 'departure':
          result = await clockOut();
          break;
        case 'break_start':
          result = await startBreak();
          break;
        case 'break_end':
          result = await endBreak();
          break;
        default:
          throw new Error('Action non reconnue');
      }

      await fetchTodayEntries();
      if (user?.id) {
        // Optionnel : rafraîchir d'autres données si nécessaire
      }
      
      // Feedback selon l'action
      const messages = {
        arrival: '✅ Arrivée enregistrée',
        departure: '✅ Départ enregistré',
        break_start: '☕ Pause commencée',
        break_end: '🔄 Pause terminée'
      };
      
      showFeedback(messages[action], 'success');
      
    } catch (error) {
      console.error(`❌ Erreur lors du pointage ${action}:`, error);
      showFeedback('❌ Erreur lors du pointage', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2000);
  };

  // ✅ MÊME LOGIQUE : Que les boutons de DirectorDashboard
  const handleClockClick = () => {
    if (canClockIn) {
      handleClockAction('arrival');
    } else if (canClockOut) {
      handleClockAction('departure');
    }
  };

  const handleBreakClick = () => {
    if (canPauseOrResume) {
      const action = isOnBreak(myTodayEntries) ? 'break_end' : 'break_start';
      handleClockAction(action);
    }
  };

  const handleDirectClockOut = () => {
    if (canClockOut) {
      handleClockAction('departure');
    }
  };

  // ✅ NE PAS AFFICHER si pas directeur
  if (user?.role !== 'director') {
    return null;
  }

  const iconClass = `
    w-8 h-8 p-1.5 rounded-lg cursor-pointer transition-all duration-200 
    hover:scale-110 hover:shadow-lg active:scale-95
  `;

  return (
    <div className="flex items-center space-x-2 relative">
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
          !status.arrival ? 'Pointez d\'abord votre arrivée'
          : status.departure ? 'Journée terminée'
          : isOnBreak(myTodayEntries) ? 'Terminer la pause'
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
          !status.arrival ? 'Pointez d\'abord votre arrivée'
          : status.departure ? 'Départ déjà enregistré'
          : 'Pointage Départ'
        }
      >
        <LogOut className="w-full h-full" />
      </div>

      {/* Feedback */}
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