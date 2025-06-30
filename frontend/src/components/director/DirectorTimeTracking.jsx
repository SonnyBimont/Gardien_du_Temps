import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';
import { PlayCircle, StopCircle, PauseCircle, Clock, Calendar, Activity } from 'lucide-react';
                                       

// Pointage du directeur
  export const renderDirectorTimeTracking = (  
  currentTime,
  handleClockAction,
  canClockIn,
  canClockOut,
  canPauseOrResume,
  actionLoading,
  myTodayEntries,
  isOnBreak,
  getPauses,
  status,
  getWorkedTimeWithMultipleBreaks,
  getWeeklyWorkedTime,
  getMonthlyWorkedTime) => (
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

        {/* Boutons de pointage - MÊME LOGIQUE QUE ANIMATEUR */}
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

 {/* Bonton Pause/Reprise          */}
<button
  onClick={() => handleClockAction(isOnBreak ? 'break_end' : 'break_start')}
  disabled={!canPauseOrResume || (actionLoading === 'break_start' || actionLoading === 'break_end')}
  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
    canPauseOrResume && !actionLoading
      ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer'
      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
  }`}
>
  <div className="flex flex-col items-center">
    <PauseCircle className="w-8 h-8 mb-2" />
    <span className="text-sm font-medium">
      {actionLoading === 'break_start' || actionLoading === 'break_end'
        ? 'En cours...'
        : isOnBreak
          ? 'Reprise'
          : 'Pause'
      }
    </span>
  </div>
</button>

{/* Bouton Départ */}
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

        {/* Résumé du jour - MÊME DESIGN QUE ANIMATEUR */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pointages du jour</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <PlayCircle className="w-4 h-4 mr-2 text-green-600" />
              <div>
                <span className="text-sm text-gray-500">Arrivée</span>
                <p className="font-medium">
                  {status?.arrival 
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
                  {status?.departure 
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
                  {status?.breakStart 
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
                  {status?.breakEnd 
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
    <span className="text-lg font-bold text-gray-900">{getWorkedTimeWithMultipleBreaks()}</span>
            </div>
          </div>

        {/* Détail de toutes les pauses */}
<div className="border-t pt-3 mt-3">
  <h4 className="text-sm font-semibold text-gray-700 mb-2">Détail des pauses :</h4>
  {getPauses(myTodayEntries).length === 0 ? (
    <div className="text-xs text-gray-400 italic">Aucune pause effectuée</div>
  ) : (
    <ul className="text-xs text-gray-700 space-y-1">
      {getPauses(myTodayEntries).map((pause, idx) => (
        <li key={idx} className="flex justify-between items-center">
          <span className="font-medium">Pause {idx + 1} :</span>
          <span>
            {pause.start ? new Date(pause.start.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            {" → "}
            {pause.end ? (
              new Date(pause.end.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            ) : (
              <span className="text-orange-500 font-medium">en cours</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>  
        </div>

        {/* Aide contextuelle */}
        {!status?.arrival && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Commencez votre journée en cliquant sur "Arrivée"
            </p>
          </div>
        )}
      </div>
    </Card>

    {/* Panel statistiques quotidiennes */}
    <div className="space-y-4">
<StatsCard
  title="Aujourd'hui"
  value={getWorkedTimeWithMultipleBreaks() === '--h--' ? '0h00' : getWorkedTimeWithMultipleBreaks()} 
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

  // Historique des pointages du directeur
  export const renderDirectorHistory = (processedHistory) => (
    <Card title="Historique récent">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {processedHistory.slice(0, 10).map((day, index) => (
          <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
            day.workingHours > 0 ? 'bg-green-50' : 'bg-gray-50'
          }`}>
            <div>
              <p className="font-medium text-gray-900">{day.dayName}</p>
              <p className="text-sm text-gray-500">{day.formattedDate}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                day.workingHours >= 7 ? 'text-green-600' : 
                day.workingHours > 0 ? 'text-orange-600' : 'text-gray-400'
              }`}>
                {day.formattedWorkingHours}
              </p>
              <p className="text-xs text-gray-400">
                {day.arrival ? `${day.arrival} - ${day.departure || 'En cours'}` : 'Absent'}
              </p>
            </div>
          </div>
        ))}
        
        {processedHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun historique disponible</p>
          </div>
        )}
      </div>
    </Card>
  );