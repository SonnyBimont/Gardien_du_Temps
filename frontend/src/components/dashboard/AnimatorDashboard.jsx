/**
 * ===== ANIMATOR DASHBOARD - TABLEAU DE BORD ANIMATEUR =====
 * 
 * Interface simplifiée pour les animateurs avec focus sur le pointage personnel
 * et la visualisation de leurs propres données de temps de travail.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Pointage personnel (arrivée/départ/pause) avec interface intuitive
 * - Affichage de l'heure actuelle en temps réel
 * - Résumé des temps travaillés (jour/semaine/mois)
 * - Historique personnel des 30 derniers jours
 * - Statut en temps réel des pointages du jour
 * - Interface responsive et user-friendly
 * 
 * DESIGN ET UX :
 * - Boutons de pointage visuels avec codes couleur
 * - Mise à jour automatique de l'heure chaque minute
 * - Feedback visuel pour les actions en cours
 * - Design cohérent avec les autres dashboards
 * - Affichage personnalisé avec prénom utilisateur
 * 
 * PROBLÈMES IDENTIFIÉS :
 * - Code LARGEMENT DUPLIQUÉ avec DirectorDashboard (logique pointage identique)
 * - Console.log de debug en production à supprimer
 * - Loading spinner dupliqué (même markup que autres composants)
 * - Fonctions de calcul temps répétées (getWorkedTime, etc.)
 * - Logique de pointage identique aux autres dashboards
 * - Gestion d'état similaire avec useState multiples
 * 
 * AMÉLIORATIONS CRITIQUES :
 * - FACTORISER la logique de pointage en hook custom (useTimeTracking)
 * - Créer un composant TimeTrackingInterface réutilisable
 * - Centraliser les calculs de temps dans timeCalculations.js
 * - Supprimer les console.log de debug
 * - Utiliser le composant LoadingSpinner commun
 * - Optimiser les re-renders avec useMemo/useCallback
 * 
 * CODE À REFACTORISER EN PRIORITÉ :
 * - handleClockAction (identique DirectorDashboard)
 * - getTodayStatus (identique DirectorDashboard)  
 * - getWorkedTime (identique DirectorDashboard)
 * - Interface de pointage (design identique)
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Activity,
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin
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

  // État pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );

  // Mise à jour de l'heure chaque minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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

  // Actions de pointage pour l'animateur - MÊME LOGIQUE QUE DIRECTEUR
  const handleClockAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);
    
    try {
      console.log(`🔄 Action de pointage: ${action}`);
      
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

      console.log(`✅ Résultat action ${action}:`, result);

      // Recharger les données après l'action
      await fetchTodayEntries();
      if (user?.id) {
        await fetchTimeHistory(30, user.id);
        await fetchMonthlyReport(null, null, user.id);
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors du pointage ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  // Conditions pour les boutons de pointage - MÊME LOGIQUE QUE DIRECTEUR
  const canClockIn = !status.arrival && !status.departure;
  const canStartBreak = status.arrival && !status.breakStart && !status.departure;
  const canEndBreak = status.breakStart && !status.breakEnd && !status.departure;
  const canClockOut = status.arrival && !status.departure;

  // Rendu du header personnalisé pour l'animateur
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">👋</span>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour {user?.first_name}
          </h1>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            Structure : {user?.structure?.name || 'Non renseignée'}
          </span>
        </div>
      </div>
    </div>
  );

  // Interface de pointage pour l'animateur - MÊME DESIGN QUE DIRECTEUR
  const renderAnimatorTimeTracking = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Panel de pointage central et plus large */}
      <Card title="Pointage du jour" className="lg:col-span-2">
        <div className="space-y-6 p-6">
          {/* Affichage de l'heure actuelle */}
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {currentTime}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Boutons de pointage - MÊME DESIGN QUE DIRECTEUR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleClockAction('arrival')}
              disabled={!canClockIn || actionLoading === 'arrival'}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                canClockIn && actionLoading !== 'arrival'
                  ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center">
                <PlayCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  {actionLoading === 'arrival' ? 'En cours...' : 'Arrivée'}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleClockAction(canStartBreak ? 'break_start' : 'break_end')}
              disabled={(!canStartBreak && !canEndBreak) || (actionLoading === 'break_start' || actionLoading === 'break_end')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                (canStartBreak || canEndBreak) && !actionLoading
                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center">
                <PauseCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  {actionLoading === 'break_start' || actionLoading === 'break_end' 
                    ? 'En cours...' 
                    : canStartBreak 
                      ? 'Pause' 
                      : canEndBreak 
                        ? 'Reprise'
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
                  ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center">
                <StopCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  {actionLoading === 'departure' ? 'En cours...' : 'Départ'}
                </span>
              </div>
            </button>
          </div>

          {/* Résumé du jour - MÊME DESIGN QUE DIRECTEUR */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pointages du jour</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <PlayCircle className="w-4 h-4 mr-2 text-green-600" />
                <div>
                  <span className="text-sm text-gray-500">Arrivée</span>
                  <p className="font-medium">
                    {status.arrival 
                      ? new Date(status.arrival.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <StopCircle className="w-4 h-4 mr-2 text-red-600" />
                <div>
                  <span className="text-sm text-gray-500">Départ</span>
                  <p className="font-medium">
                    {status.departure 
                      ? new Date(status.departure.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <PauseCircle className="w-4 h-4 mr-2 text-orange-500" />
                <div>
                  <span className="text-sm text-gray-500">Pause début</span>
                  <p className="font-medium">
                    {status.breakStart 
                      ? new Date(status.breakStart.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <PauseCircle className="w-4 h-4 mr-2 text-blue-500" />
                <div>
                  <span className="text-sm text-gray-500">Pause fin</span>
                  <p className="font-medium">
                    {status.breakEnd 
                      ? new Date(status.breakEnd.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Temps travaillé :</span>
                <span className="text-lg font-bold text-gray-900">{getWorkedTime()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistiques personnelles */}
      <div className="space-y-4">
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
    </div>
  );

  // Rendu du tableau d'historique  
  const renderHistoryTable = () => (
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
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderAnimatorTimeTracking()}
      {renderHistoryTable()}
    </div>
  );
};

export default AnimatorDashboard;