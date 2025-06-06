import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Activity,
  Building,
  FileText,
  Settings,
  Search,
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin,
  Download,
  Plus,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useTimeStore } from '../../stores/timeStore';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import CreateUserForm from '../forms/CreateUserForm';
import EditUserForm from '../forms/EditUserForm';

const DirectorDashboard = () => {
  const { user } = useAuthStore();
  const { 
    users = [], 
    structures = [], 
    loading: adminLoading,
    fetchUsers,
    fetchStructures,
    toggleUserStatus,
    createUser
  } = useAdminStore();
  
  const { 
    todayEntries = [], 
    timeHistory = [],
    processedHistory = [],
    loading: timeLoading,
    fetchTodayEntries,
    fetchTimeHistory,
    fetchMonthlyReport,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    weeklyStats,
    monthlyStats,
    fetchTeamSummary
  } = useTimeStore();

  // États pour les vues
  const [activeView, setActiveView] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAnimators, setShowAllAnimators] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [recentActivityLimit, setRecentActivityLimit] = useState(30);
  
  // États pour la gestion d'équipe
  const [selectedAnimator, setSelectedAnimator] = useState('all');
  const [teamDateRange, setTeamDateRange] = useState('30');
  const [actionLoading, setActionLoading] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Modal pour création d'animateur
  const [showCreateAnimatorModal, setShowCreateAnimatorModal] = useState(false);

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

  // Chargement des données
  const loadData = useCallback(async () => {
    try {
      if (fetchUsers) await fetchUsers();
      if (fetchStructures) await fetchStructures();
      if (fetchTodayEntries) await fetchTodayEntries();
      if (user?.id) {
        await fetchTimeHistory(30, user.id);
        await fetchMonthlyReport(null, null, user.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [fetchUsers, fetchStructures, fetchTodayEntries, fetchTimeHistory, fetchMonthlyReport, user?.id]);

const handleEditUser = (user) => {
  setSelectedUser(user);
  setShowEditUserModal(true);
};

// Fonction après modification réussie
const handleUserUpdated = () => {
  setShowEditUserModal(false);
  setSelectedUser(null);
  loadData();
};

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  
  // AJOUTER fonction pour charger les données d'équipe
  const loadTeamData = async () => {
    if (!user?.structure_id) return;
    
    try {
      const result = await fetchTeamSummary(teamDateRange, user.structure_id);
      if (result.success) {
        setTeamData(result.data.users || []);
      }
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
      setTeamData([]);
    }
  };

  // Charger les données d'équipe au changement de période
  useEffect(() => {
    if (activeView === 'team') {
      loadTeamData();
    }
  }, [teamDateRange, activeView, user?.structure_id]);

  // Fonction pour rafraîchir après création d'animateur
  const handleAnimatorCreated = useCallback(async () => {
    setShowCreateAnimatorModal(false);
    await loadData();
    if (activeView === 'team') {
      await loadTeamData();
    }
  }, [loadData, activeView]);

  // Guard clause
  if (adminLoading || timeLoading || !user?.structure_id) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace directeur...</p>
        </div>
      </div>
    );
  }

  
  // Calculs
  const myStructureAnimators = users.filter(u => 
    u && u.role === 'animator' && u.structure_id === user.structure_id
  );
  const myStructure = structures.find(s => s && s.id === user.structure_id);
  
  // Calcul du statut aujourd'hui pour le directeur - LOGIQUE CORRIGÉE
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

  // Filtrage des animateurs
  const filteredAnimators = myStructureAnimators.filter(animator => {
    const matchesSearch = 
      (animator.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalAnimators = myStructureAnimators.length;
  const activeAnimators = myStructureAnimators.filter(a => a?.active).length;

  // Activité récente
  const recentActivity = todayEntries
    .filter(entry => {
      const entryUser = myStructureAnimators.find(u => u?.id === entry?.user_id);
      return entryUser !== undefined;
    })
    .slice(0, recentActivityLimit)
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

  // Actions de pointage pour le directeur - LOGIQUE CORRIGÉE
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

  // Formatage du temps
  const formatHoursMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

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

  const getWeeklyWorkedTime = () => {
    if (weeklyStats && weeklyStats.formattedTotalHours) {
      return weeklyStats.formattedTotalHours;
    }
    return '--h--';
  };

  const getMonthlyWorkedTime = () => {
    if (monthlyStats && monthlyStats.formattedTotalHours) {
      return monthlyStats.formattedTotalHours;
    }
    return '--h--';
  };

  const canClockIn = !status.arrival && !status.departure;
  const canStartBreak = status.arrival && !status.breakStart && !status.departure;
  const canEndBreak = status.breakStart && !status.breakEnd && !status.departure;
  const canClockOut = status.arrival && !status.departure;

  // Export des données d'équipe
  const exportTeamData = async () => {
    try {
      // Utiliser la fonction du store si disponible
      if (useTimeStore.getState().exportTeamData) {
        await useTimeStore.getState().exportTeamData('csv', {
          days: teamDateRange,
          structureId: user.structure_id,
          userId: selectedAnimator !== 'all' ? selectedAnimator : null
        });
      } else {
        // Fallback simple
        console.log('Export des données d\'équipe...');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Rendu en fonction de la vue active
  const renderContent = () => {
    switch (activeView) {
      case 'schedule':
        return renderScheduleManagement();
      case 'team':
        return renderTeamManagement();
      default:
        return renderDashboard();
    }
  };

  // Header du directeur
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
            Structure : {myStructure?.name || 'Non renseignée'}
          </span>
        </div>
      </div>
    </div>
  );

  // Actions rapides
  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card 
        clickable 
        hoverable 
        className="p-4"
        onClick={() => setActiveView('schedule')}
      >
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Gérer</p>
            <p className="text-lg font-semibold text-gray-900">Mes Horaires</p>
          </div>
        </div>
      </Card>

      <Card 
        clickable 
        hoverable 
        className="p-4"
        onClick={() => setActiveView('team')}
      >
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Équipe</p>
            <p className="text-lg font-semibold text-gray-900">Animateurs</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Exporter</p>
            <p className="text-lg font-semibold text-gray-900">Rapports</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Settings className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Gérer</p>
            <p className="text-lg font-semibold text-gray-900">Prévisionnel</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // Rendu des statistiques
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Mes Animateurs"
        value={totalAnimators}
        change={`${activeAnimators} actifs`}
        trend="positive"
        icon={<Users className="w-6 h-6" />}
      />

      <StatsCard
        title="Mes Heures"
        value={getWeeklyWorkedTime()}
        change="cette semaine"
        trend="neutral"
        icon={<Clock className="w-6 h-6" />}
      />
    </div>
  );

  // Vue principale du dashboard
  const renderDashboard = () => (
    <>
      {renderHeader()}
      {renderQuickActions()}
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>{renderAnimatorsList()}</div>
        <div>{renderRecentActivity()}</div>
      </div>
    </>
  );

  // Gestion des horaires du directeur
  const renderScheduleManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Horaires</h2>
          <p className="text-gray-600 mt-1">Gestion de mes pointages et planning</p>
        </div>
        <Button variant="outline" onClick={() => setActiveView('dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>

      {/* Interface de pointage pour le directeur */}
      {renderDirectorTimeTracking()}
      
      {/* Historique des pointages */}
      {renderDirectorHistory()}
    </div>
  );

  // Interface de pointage pour le directeur - CORRIGÉE
  const renderDirectorTimeTracking = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Boutons de pointage CORRIGÉS */}
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

          {/* Résumé du jour */}
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

  // Historique des pointages du directeur
  const renderDirectorHistory = () => (
    <Card title="Mon Historique (30 derniers jours)" className="mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrivée</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pause</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Départ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedHistory.length > 0 ? (
              processedHistory.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.formattedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.arrival || '--:--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.breakStart || '--:--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.breakEnd || '--:--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.departure || '--:--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.formattedWorkingHours}</td>
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

  // Gestion d'équipe
  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion d'Équipe</h2>
          <p className="text-gray-600 mt-1">Suivi des horaires de vos animateurs</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => exportTeamData()}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            Retour
          </Button>
        </div>
      </div>

      {renderTeamFilters()}
      {renderTeamTable()}
    </div>
  );

  // Filtres pour la gestion d'équipe
  const renderTeamFilters = () => (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            value={teamDateRange}
            onChange={(e) => setTeamDateRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animateur
          </label>
          <select
            value={selectedAnimator}
            onChange={(e) => setSelectedAnimator(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les animateurs</option>
            {myStructureAnimators.map(animator => (
              <option key={animator.id} value={animator.id}>
                {animator.first_name} {animator.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button 
            onClick={() => setShowCreateAnimatorModal(true)} 
            className="w-full"
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer Animateur
          </Button>
        </div>
      </div>
    </Card>
  );

  // Tableau de l'équipe
  const renderTeamTable = () => {
    const filteredTeamData = selectedAnimator === 'all' 
      ? teamData 
      : teamData.filter(item => item.user.id === parseInt(selectedAnimator));

    return (
      <Card title="Résumé des heures d'équipe">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heures travaillées</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objectif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Différence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeamData.length > 0 ? (
                filteredTeamData.map(item => {
                  const { user, totalHours, periodObjective, hoursDifference } = item;
                  
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-medium">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHoursMinutes(totalHours * 60)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHoursMinutes(periodObjective * 60)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          hoursDifference >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {hoursDifference >= 0 ? '+' : ''}{formatHoursMinutes(Math.abs(hoursDifference) * 60)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                    {selectedAnimator === 'all' 
                      ? 'Aucune donnée disponible pour cette période'
                      : 'Aucune donnée pour cet animateur'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Liste des animateurs (version simplifiée pour le dashboard)
  const renderAnimatorsList = () => (
    <Card
      title="Gestion de Mon Équipe d'Animateurs"
      header={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Animateurs ({filteredAnimators.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllAnimators(!showAllAnimators)}
              className="shrink-0"
            >
              {showAllAnimators ? "Réduire" : "Voir tout"}
            </Button>
          </div>

          <div className="w-full">
            <Input
              placeholder="Rechercher un animateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full"
            />
          </div>
        </div>
      }
      className="mb-6"
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredAnimators
          .slice(0, showAllAnimators ? filteredAnimators.length : 8)
          .length > 0 ? (
          filteredAnimators
            .slice(0, showAllAnimators ? filteredAnimators.length : 8)
            .map((animator) => (
              <div 
                key={animator.id} 
                className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 ${
                  !animator.active ? "opacity-60 bg-gray-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${
                    animator.active ? "bg-blue-600" : "bg-gray-400"
                  }`}>
                    <span className="text-white text-sm font-medium">
                      {animator.first_name?.charAt(0)}{animator.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium truncate ${
                      animator.active ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {animator.first_name} {animator.last_name}
                      {!animator.active && (
                        <span className="ml-2 text-xs text-red-500">(Inactif)</span>
                      )}
                    </p>
                    <p className={`text-sm truncate ${
                      animator.active ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {animator.email}
                    </p>
                  </div>
                </div>
                
<div className="flex items-center space-x-2 shrink-0 ml-2">
  {/* AJOUTER le bouton Modifier */}
  <button
    onClick={() => handleEditUser(animator)}
    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
    title="Modifier l'animateur"
  >
    ✏️ Modifier
  </button>

  <span className={`px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 ${
    !animator.active ? "opacity-50" : ""
  }`}>
    Animateur
  </span>

  <button
    type="button"
    onClick={async () => {
      try {
        await toggleUserStatus(animator.id, !animator.active);
        await loadData();
      } catch (error) {
        console.error('Erreur toggle status:', error);
      }
    }}
    className={`
      px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-lg transform hover:scale-105
      ${animator.active 
        ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 focus:ring-green-500' 
        : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 focus:ring-red-500'
      }
    `}
    title={animator.active ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
  >
    {animator.active ? '🟢 Actif' : '🔴 Inactif'}
  </button>

  <div
    className={`w-2 h-2 rounded-full ${
      animator.active ? "bg-green-400" : "bg-gray-300"
    }`}
  />
</div>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {searchTerm ? 'Aucun animateur trouvé' : 'Aucun animateur dans votre structure'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  // Activité récente
  const renderRecentActivity = () => (
    <Card
      title="Activité Récente de l'Équipe"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Activité Récente ({recentActivity.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllActivity(!showAllActivity)}
            className="shrink-0"
          >
            {showAllActivity ? "Réduire" : "Voir tout"}
          </Button>
        </div>
      }
      className="mb-6"
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {recentActivity
          .slice(0, showAllActivity ? recentActivity.length : 10)
          .length > 0 ? (
          recentActivity
            .slice(0, showAllActivity ? recentActivity.length : 10)
            .map((activity, index) => {
              const user = myStructureAnimators.find(u => u.id === activity.user_id);
              if (!user) return null;

              const getActivityColor = (type) => {
                switch (type) {
                  case 'arrival': return 'text-green-600 bg-green-100';
                  case 'departure': return 'text-red-600 bg-red-100';
                  case 'break_start': return 'text-orange-600 bg-orange-100';
                  case 'break_end': return 'text-blue-600 bg-blue-100';
                  default: return 'text-gray-600 bg-gray-100';
                }
              };

              const getActivityText = (type) => {
                switch (type) {
                  case 'arrival': return 'Arrivée';
                  case 'departure': return 'Départ';
                  case 'break_start': return 'Début pause';
                  case 'break_end': return 'Fin pause';
                  default: return 'Action';
                }
              };

              const getActivityIcon = (type) => {
                switch (type) {
                  case 'arrival': return <PlayCircle className="w-4 h-4" />;
                  case 'departure': return <StopCircle className="w-4 h-4" />;
                  case 'break_start': return <PauseCircle className="w-4 h-4" />;
                  case 'break_end': return <PlayCircle className="w-4 h-4" />;
                  default: return <Activity className="w-4 h-4" />;
                }
              };

              return (
                <div key={`${activity.id}-${index}`} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full mr-3 ${getActivityColor(activity.tracking_type)}`}>
                    {getActivityIcon(activity.tracking_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getActivityText(activity.tracking_type)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(activity.date_time).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
  <div className="space-y-6">
    {renderContent()}
    
    {/* Modal pour création d'animateur */}
    <Modal
      isOpen={showCreateAnimatorModal}
      onClose={() => setShowCreateAnimatorModal(false)}
      size="xl"
      showCloseButton={false}
    >
      <CreateUserForm
        onSuccess={handleAnimatorCreated}
        onCancel={() => setShowCreateAnimatorModal(false)}
        defaultRole="animator"
        structureId={user?.structure_id}
        isDirectorContext={true}
      />
    </Modal>

    {/* Modal de modification d'animateur - DOIT ÊTRE EN DEHORS DU MODAL DE CRÉATION */}
    {showEditUserModal && selectedUser && (
      <EditUserForm
        user={selectedUser}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        isDirectorContext={true}
        fixedRole="animator"
        fixedStructureId={user?.structure_id}
      />
    )}
  </div>
  );
};

export default DirectorDashboard;