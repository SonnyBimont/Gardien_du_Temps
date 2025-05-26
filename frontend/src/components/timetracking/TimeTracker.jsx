import React, { useEffect, useState } from 'react';
import { Clock, Play, Pause, Square, Coffee, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTimeStore } from '../../stores/timeStore';
import { getTodayStatus, formatTime, calculateCurrentWorkingTime } from '../../utils/timeCalculations';
import Button from '../common/Button';
import Card from '../common/Card';

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const { 
    todayEntries, 
    fetchTodayEntries, 
    recordTimeEntry, 
    loading, 
    error 
  } = useTimeStore();

  // Mise à jour temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement données du jour
  useEffect(() => {
    fetchTodayEntries();
  }, [fetchTodayEntries]);

  const todayStatus = getTodayStatus(todayEntries);
  const currentWorkingTime = calculateCurrentWorkingTime(todayEntries);
  
  // Logique des boutons disponibles
  const canRecord = {
    arrival: !todayStatus.arrival,
    break_start: todayStatus.arrival && !todayStatus.breakStart && !todayStatus.departure,
    break_end: todayStatus.breakStart && !todayStatus.breakEnd && !todayStatus.departure,
    departure: todayStatus.arrival && !todayStatus.departure && 
               (!todayStatus.breakStart || todayStatus.breakEnd)
  };

  // Gestion des pointages avec notifications
  const handleTimeAction = async (type) => {
    const result = await recordTimeEntry(type);
    if (result.success) {
      const messages = {
        arrival: '✅ Arrivée enregistrée',
        break_start: '⏸️ Pause commencée',
        break_end: '▶️ Reprise du travail',
        departure: '🏁 Départ enregistré'
      };
      showNotification(messages[type], 'success');
    }
  };

  // Système de notifications temporaires
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Détermination du statut actuel
  const getCurrentStatus = () => {
    if (todayStatus.departure) return { text: 'Journée terminée', icon: '✅', color: 'text-gray-600' };
    if (todayStatus.breakStart && !todayStatus.breakEnd) return { text: 'En pause', icon: '⏸️', color: 'text-yellow-600' };
    if (todayStatus.arrival) return { text: 'Au travail', icon: '💼', color: 'text-green-600' };
    return { text: 'Non pointé', icon: '⚪', color: 'text-gray-400' };
  };

  const status = getCurrentStatus();

  return (
    <Card title="Pointage du temps" className="relative">
      {/* Notification flottante */}
      {notification && (
        <div className={`absolute top-4 right-4 px-3 py-2 rounded-md text-sm font-medium z-10 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Erreur globale */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {/* Heure et statut actuels */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-6 h-6 mr-2 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          {currentTime.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        
        {/* Statut actuel */}
        <div className="flex items-center justify-center">
          <span className="text-lg mr-2">{status.icon}</span>
          <span className={`font-medium ${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Temps travaillé en cours */}
      {todayStatus.arrival && !todayStatus.departure && (
        <div className="mb-6 text-center p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Temps travaillé</h4>
          <p className="text-xl font-bold text-blue-600">
            {formatTime(currentWorkingTime, 'duration')}
          </p>
        </div>
      )}

      {/* Résumé des pointages du jour */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`text-center p-3 rounded-lg ${
          todayStatus.arrival ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <Play className={`w-4 h-4 mr-1 ${todayStatus.arrival ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-600">Arrivée</p>
          </div>
          <p className={`font-bold ${todayStatus.arrival ? 'text-green-700' : 'text-gray-400'}`}>
            {todayStatus.arrival ? formatTime(todayStatus.arrival.date_time) : '--:--'}
          </p>
        </div>

        <div className={`text-center p-3 rounded-lg ${
          todayStatus.departure ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <Square className={`w-4 h-4 mr-1 ${todayStatus.departure ? 'text-red-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-600">Départ</p>
          </div>
          <p className={`font-bold ${todayStatus.departure ? 'text-red-700' : 'text-gray-400'}`}>
            {todayStatus.departure ? formatTime(todayStatus.departure.date_time) : '--:--'}
          </p>
        </div>

        <div className={`text-center p-3 rounded-lg ${
          todayStatus.breakStart ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <Coffee className={`w-4 h-4 mr-1 ${todayStatus.breakStart ? 'text-yellow-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-600">Début pause</p>
          </div>
          <p className={`font-bold ${todayStatus.breakStart ? 'text-yellow-700' : 'text-gray-400'}`}>
            {todayStatus.breakStart ? formatTime(todayStatus.breakStart.date_time) : '--:--'}
          </p>
        </div>

        <div className={`text-center p-3 rounded-lg ${
          todayStatus.breakEnd ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className={`w-4 h-4 mr-1 ${todayStatus.breakEnd ? 'text-blue-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-600">Fin pause</p>
          </div>
          <p className={`font-bold ${todayStatus.breakEnd ? 'text-blue-700' : 'text-gray-400'}`}>
            {todayStatus.breakEnd ? formatTime(todayStatus.breakEnd.date_time) : '--:--'}
          </p>
        </div>
      </div>

      {/* Boutons d'action avec états visuels */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleTimeAction('arrival')}
          disabled={!canRecord.arrival || loading}
          variant={canRecord.arrival ? "success" : "outline"}
          size="lg"
          className="flex items-center justify-center h-12"
          loading={loading}
        >
          <Play className="w-5 h-5 mr-2" />
          Arrivée
        </Button>
        
        <Button
          onClick={() => handleTimeAction('break_start')}
          disabled={!canRecord.break_start || loading}
          variant={canRecord.break_start ? "warning" : "outline"}
          size="lg"
          className="flex items-center justify-center h-12"
          loading={loading}
        >
          <Coffee className="w-5 h-5 mr-2" />
          Pause
        </Button>
        
        <Button
          onClick={() => handleTimeAction('break_end')}
          disabled={!canRecord.break_end || loading}
          variant={canRecord.break_end ? "primary" : "outline"}
          size="lg"
          className="flex items-center justify-center h-12"
          loading={loading}
        >
          <Play className="w-5 h-5 mr-2" />
          Reprendre
        </Button>
        
        <Button
          onClick={() => handleTimeAction('departure')}
          disabled={!canRecord.departure || loading}
          variant={canRecord.departure ? "danger" : "outline"}
          size="lg"
          className="flex items-center justify-center h-12"
          loading={loading}
        >
          <Square className="w-5 h-5 mr-2" />
          Départ
        </Button>
      </div>

      {/* Aide contextuelle */}
      {!todayStatus.arrival && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Commencez votre journée en cliquant sur "Arrivée"
          </p>
        </div>
      )}
    </Card>
  );
};

export default TimeTracker;