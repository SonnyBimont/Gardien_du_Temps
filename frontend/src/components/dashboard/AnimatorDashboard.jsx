import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Activity,
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTimeStore } from '../../stores/timeStore';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';

const AnimatorDashboard = () => {
  const { user } = useAuthStore();
  const { 
    todayEntries = [], 
    timeHistory = [],
    processedHistory = [], 
    loading,
    fetchTodayEntries,
    fetchTimeHistory,
    fetchMonthlyReport,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    weeklyStats,
    monthlyStats
  } = useTimeStore();

  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (fetchTodayEntries) await fetchTodayEntries();
        if (fetchTimeHistory && user?.id) await fetchTimeHistory(30, user.id);
        if (fetchMonthlyReport && user?.id) await fetchMonthlyReport(null, null, user.id);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    if (user?.id) loadData();
  }, [user?.id, fetchTodayEntries, fetchTimeHistory, fetchMonthlyReport]);

  // Calculs sécurisés
  const myTodayEntries = todayEntries.filter(entry => entry?.user_id === user?.id);

  // Déterminer le statut actuel et les actions possibles
  const getTodayStatus = () => {
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

  const status = getTodayStatus();
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Calcul du temps travaillé (hors pause)
  const getWorkedTime = () => {
    if (status.arrival && status.departure) {
      const start = new Date(status.arrival.date_time);
      const end = new Date(status.departure.date_time);
      let totalMinutes = (end - start) / (1000 * 60);
      if (status.breakStart && status.breakEnd) {
        const breakStart = new Date(status.breakStart.date_time);
        const breakEnd = new Date(status.breakEnd.date_time);
        totalMinutes -= (breakEnd - breakStart) / (1000 * 60);
      }
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return '--h--';
  };

  // Formatage des heures et minutes
const formatHoursMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

// Calcul du temps travaillé pour la semaine
const getWeeklyWorkedTime = () => {
  if (weeklyStats && weeklyStats.formattedTotalHours) {
    return weeklyStats.formattedTotalHours;
  }
  return '--h--';
};

// Calcul du temps travaillé pour le mois
const getMonthlyWorkedTime = () => {
  if (monthlyStats && monthlyStats.formattedTotalHours) {
    return monthlyStats.formattedTotalHours;
  }
  return '--h--';
};
  // Actions de pointage
  const handleClockAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);
    try {
      switch (action) {
        case 'arrival':
          await clockIn();
          break;
        case 'departure':
          await clockOut();
          break;
        case 'break_start':
          await startBreak();
          break;
        case 'break_end':
          await endBreak();
          break;
        default:
          break;
      }
      await fetchTodayEntries();
      await fetchTimeHistory(30, user?.id);
      await fetchMonthlyReport(null, null, user?.id);
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const renderHeader = () => (
    <div className="bg-white rounded-lg shadow mx-4 sm:mx-0 p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col items-center flex-nowrap">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">👋</span>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Bonjour {user?.first_name}
          </h1>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            Structure : {user?.structure?.name || 'Non renseignée'}
          </span>
        </div>
        <div className="text-lg font-semibold text-gray-900">
          Heure actuelle: {currentTime}
        </div>
      </div>
      <div className="border-t mt-4 pt-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Pointages du jour:
        </h3>
<div className="space-y-2">
  {/* Arrivée */}
  <div className="flex items-center">
    <PlayCircle className="w-4 h-4 mr-2 text-green-600" />
    <span className="text-sm text-gray-900">
      Arrivée : {status.arrival 
        ? new Date(status.arrival.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '--:--'
      }
    </span>
  </div>
  {/* Pause début */}
  <div className="flex items-center">
    <PauseCircle className="w-4 h-4 mr-2 text-orange-500" />
    <span className="text-sm text-gray-900">
      Pause début : {status.breakStart 
        ? new Date(status.breakStart.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '--:--'
      }
    </span>
  </div>
  {/* Pause fin */}
  <div className="flex items-center">
    <PauseCircle className="w-4 h-4 mr-2 text-blue-500" />
    <span className="text-sm text-gray-900">
      Pause fin : {status.breakEnd 
        ? new Date(status.breakEnd.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '--:--'
      }
    </span>
  </div>
  {/* Départ */}
  <div className="flex items-center">
    <StopCircle className="w-4 h-4 mr-2 text-red-500" />
    <span className="text-sm text-gray-900">
      Départ : {status.departure 
        ? new Date(status.departure.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '--:--'
      }
    </span>
  </div>
</div>
      </div>
    </div>
  );
// Render les boutons d'action de pointage
  const renderActionButtons = () => {
    const canClockIn = !status.arrival && !status.departure;
    const canStartBreak = status.arrival && !status.breakStart && !status.departure;
    const canEndBreak = status.breakStart && !status.breakEnd && !status.departure;
    const canClockOut = status.arrival && !status.departure;

    return (
      <div className="bg-white rounded-lg shadow mx-4 sm:mx-0 p-4 mb-4">
        <div className="grid grid-cols-1 gap-3">
          {/* Bouton Arrivée */}
          <button
            onClick={() => handleClockAction('arrival')}
            disabled={!canClockIn || actionLoading === 'arrival'}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              canClockIn && actionLoading !== 'arrival'
                ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <PlayCircle className="w-6 h-6" />
              <span className="font-medium text-base">
                {actionLoading === 'arrival' ? 'En cours...' : 'Pointer l\'arrivée'}
              </span>
            </div>
          </button>
          {/* Bouton Pause */}
          <button
            onClick={() => handleClockAction(canStartBreak ? 'break_start' : 'break_end')}
            disabled={(!canStartBreak && !canEndBreak) || (actionLoading === 'break_start' || actionLoading === 'break_end')}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              (canStartBreak || canEndBreak) && !actionLoading
                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <PauseCircle className="w-6 h-6" />
              <span className="font-medium text-base">
                {actionLoading === 'break_start' || actionLoading === 'break_end' 
                  ? 'En cours...' 
                  : canStartBreak 
                    ? 'Début pause' 
                    : canEndBreak 
                      ? 'Fin de pause'
                      : 'Pause'
                }
              </span>
            </div>
          </button>
          {/* Bouton Départ */}
          <button
            onClick={() => handleClockAction('departure')}
            disabled={!canClockOut || actionLoading === 'departure'}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              canClockOut && actionLoading !== 'departure'
                ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <StopCircle className="w-6 h-6" />
              <span className="font-medium text-base">
                {actionLoading === 'departure' ? 'En cours...' : 'Pointer départ'}
              </span>
            </div>
          </button>
        </div>
        {/* Version desktop en grille */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:mt-6">
          <button
            onClick={() => handleClockAction('arrival')}
            disabled={!canClockIn || actionLoading === 'arrival'}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              canClockIn && actionLoading !== 'arrival'
                ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-center">
              <PlayCircle className="w-8 h-8 mb-2" />
              <span className="font-medium text-base">
                {actionLoading === 'arrival' ? 'En cours...' : 'Pointer l\'arrivée'}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleClockAction(canStartBreak ? 'break_start' : 'break_end')}
            disabled={(!canStartBreak && !canEndBreak) || (actionLoading === 'break_start' || actionLoading === 'break_end')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              (canStartBreak || canEndBreak) && !actionLoading
                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-center">
              <PauseCircle className="w-8 h-8 mb-2" />
              <span className="font-medium text-base">
                {actionLoading === 'break_start' || actionLoading === 'break_end' 
                  ? 'En cours...' 
                  : canStartBreak 
                    ? 'Début pause' 
                    : canEndBreak 
                      ? 'Fin de pause'
                      : 'Pause'
                }
              </span>
            </div>
          </button>
          <button
            onClick={() => handleClockAction('departure')}
            disabled={!canClockOut || actionLoading === 'departure'}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              canClockOut && actionLoading !== 'departure'
                ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-center">
              <StopCircle className="w-8 h-8 mb-2" />
              <span className="font-medium text-base">
                {actionLoading === 'departure' ? 'En cours...' : 'Pointer départ'}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  };

// Rendu des cartes de statistiques
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mx-4 sm:mx-0 mb-4">
      <StatsCard
        title="Aujourd'hui"
        value={getWorkedTime() === '--h--' ? '0h00' : getWorkedTime()}
        trend="neutral"
        icon={<Clock className="w-5 h-5" />}
      />
      <StatsCard
        title="Cette semaine"
        value={getWeeklyWorkedTime()}
        trend="neutral"
        icon={<Calendar className="w-5 h-5" />}
      />
      <StatsCard
        title="Ce mois-ci"
        value={getMonthlyWorkedTime()}
        trend="neutral"
        icon={<Activity className="w-5 h-5" />}
      />
    </div>
  );

// Rendu du tableau d'historique  
  const renderHistoryTable = () => (
    <div className="mx-4 sm:mx-0">
      <Card title="Historique (30 derniers jours)" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Date</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Arrivée</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Pause</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Reprise</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Départ</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Total</th>
              </tr>
            </thead>
<tbody className="bg-white divide-y divide-gray-200">
  {processedHistory.length > 0 ? (
    processedHistory.map((day) => (
      <tr key={day.date}>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-32">{day.formattedDate}</td>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">{day.arrival || '--:--'}</td>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">{day.breakStart || '--:--'}</td>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">{day.breakEnd || '--:--'}</td>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">{day.departure || '--:--'}</td>
        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-16">{day.formattedWorkingHours}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
        Aucun pointage sur les 30 derniers jours
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="max-w-7xl mx-auto">
        {renderHeader()}
        {renderActionButtons()}
        {renderStatsCards()}
        {renderHistoryTable()}
      </div>
    </div>
  );
};

export default AnimatorDashboard;