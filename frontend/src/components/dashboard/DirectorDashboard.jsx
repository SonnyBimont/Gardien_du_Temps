import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Activity,
  Search,
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  Target,
  Timer,
} from 'lucide-react';
import { PERIOD_OPTIONS, TRACKING_TYPES } from '../../constants/timeTracking';
import { USER_ROLES } from '../../constants/user';
import { logger } from '../../utils/logger';
import { calculatePeriodDates } from '../../utils/dateUtils';
import { 
  calculateTotalHours, 
  calculateWeeklyStats,
  calculateMonthlyStats,
  getTodayStatus
} from "../../utils/time/calculations";
import { 
  formatTime, 
  formatHours 
} from "../../utils/time/formatters";
import {calculateComprehensiveStats, createEmptyStats} from '../../services/teamManagement';
import { calculatePeriodObjective } from '../../services/timeCalculations';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { useTeamManagement } from '../../hooks/useTeamManagement';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useTimeStore } from '../../stores/timeStore';
import { renderDirectorTimeTracking, renderDirectorHistory } from '../director/DirectorTimeTracking';
import { renderTeamData } from '../director/TeamDataTable';
import { renderTeamFilters } from '../director/TeamFilters';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import YearlyPlanningRoadmap from '../common/YearlyPlanningRoadmap';
import RealizedHoursRoadmap from '../common/RealizedHoursRoadmap'; 
import YearTypeSelector from '../common/YearTypeSelector'; 
import CreateUserForm from '../forms/CreateUserForm';
import EditUserForm from '../forms/EditUserForm';
import CreateProjectForm from '../forms/CreateProjectForm';
import VacationTester from '../common/VacationTester';
import QuickTimeTrackingIcons from '../common/QuickTimeTrackingIcons';

const DirectorDashboard = () => {
    
  // ===== STORES =====
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

  // ===== ÉTATS LOCAUX =====
  const [activeView, setActiveView] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAnimators, setShowAllAnimators] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [recentActivityLimit, setRecentActivityLimit] = useState(30);
  
  // États pour la gestion d'équipe
  const [selectedAnimator, setSelectedAnimator] = useState('all');
  const [teamDateRange, setTeamDateRange] = useState('current_month');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateAnimatorModal, setShowCreateAnimatorModal] = useState(false);

  // États pour les statistiques avancées
  const [selectedAnimatorStats, setSelectedAnimatorStats] = useState(null);
  const [animatorStatsLoading, setAnimatorStatsLoading] = useState(false);
  const [selectedPeriodForStats, setSelectedPeriodForStats] = useState('current_month');
  const [showAnimatorStatsModal, setShowAnimatorStatsModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // État pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );

    const myStructureAnimators = users.filter(u => 
    u && u.role === USER_ROLES.ANIMATOR && u.structure_id === user.structure_id
  );
  const myStructure = structures.find(s => s && s.id === user.structure_id);

  // ===== HOOKS & LOAD =====
    // logique de pointage par le hook useTimeTracking
  const {
    myTodayEntries,
    actionLoading,
    getTodayStatus,
    getPauses,
    isOnBreak,
    canClockIn,
    canPauseOrResume,
    canClockOut,
    handleClockAction,
    handleIntelligentClockAction,        
    handleIntelligentBreakAction,  
    error: timeTrackingError
  } = useTimeTracking(user?.id);

const handleTimeTrackingAction = async (action) => {
  try {
    let result;
    
    switch (action) {
      case 'arrival':
      case 'departure':
        result = await handleIntelligentClockAction(); // ✅ FONCTION EXISTANTE
        break;
        
      case 'break_start':
      case 'break_end':
        result = await handleIntelligentBreakAction(); // ✅ FONCTION EXISTANTE
        break;
        
      default:
        throw new Error('Action non reconnue');
    }
    
    return result;
  } catch (error) {
    console.error('Erreur action pointage:', error);
    return { success: false, error: error.message };
  }
};

  // données du hook au lieu des calculs locaux
  const status = getTodayStatus();

  // logique de gestion d'équipe par le hook useTeamManagement
  const {
    loading: teamLoading,
    error: teamError,
    selectedPeriod,
    changePeriod,
    refreshTeamData,
    formatMinutes,
  } = useTeamManagement(user?.structure_id);

  const handleTeamDataLoad = useCallback(async () => {
  // Utiliser directement le hook pour charger les données
  const result = await refreshTeamData();
  
  // Si le hook ne retourne pas les bonnes données, utiliser la logique existante
  if (!result || result.length === 0) {
    // Fallback vers la logique complète existante si nécessaire
    return [];
  }
  
  return result;
}, [refreshTeamData]);

const useTeamDataFallback = (teamDateRange, myStructureAnimators) => {
  const { user } = useAuthStore();
  const { fetchTeamSummary } = useTimeStore();

  // Services pour la gestion des équipes
  const loadTeamDataFallback = useCallback(async () => {
    // ... logique existante avec accès aux hooks
  }, [user?.structure_id, teamDateRange, myStructureAnimators, fetchTeamSummary]);

  return { loadTeamDataFallback };
};

// ===== CHARGEMENT DES DONNÉES =====
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
    logger.error('Erreur lors du chargement des données:', error);
  }
}, [fetchUsers, fetchStructures, fetchTodayEntries, fetchTimeHistory, fetchMonthlyReport, user?.id]);

const handleAnimatorCreated = useCallback(async () => {
    setShowCreateAnimatorModal(false);
    await loadData();
    if (activeView === 'team') {
      await handleTeamDataLoad();
    }
  }, [loadData, activeView, handleTeamDataLoad]);

  const teamData = window.currentTeamData || [];
 
  // ===== EFFETS =====
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  // Charger les données d'équipe au changement de période
  useEffect(() => {
  if (activeView === 'team') {
    handleTeamDataLoad(); 
  }
}, [teamDateRange, activeView, user?.structure_id, handleTeamDataLoad]);

  // ===== FONCTIONS UTILITAIRES =====
  
// ===== FONCTIONS UTILITAIRES POUR PAUSES MULTIPLES =====

// Calcule le temps travaillé hors pauses (toutes les pauses)
const getWorkedTimeWithMultipleBreaks = () => {
  if (status.arrival && status.departure) {
    const start = new Date(status.arrival.date_time);
    const end = new Date(status.departure.date_time);
    let totalMinutes = (end - start) / (1000 * 60);

    // Soustraire toutes les pauses terminées
    getPauses(myTodayEntries).forEach(pause => {
      if (pause.start && pause.end) {
        const breakStart = new Date(pause.start.date_time);
        const breakEnd = new Date(pause.end.date_time);
        totalMinutes -= (breakEnd - breakStart) / (1000 * 60);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }
  return '--h--';
};

  // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUserUpdated = () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    loadData();
  };

  const exportTeamData = async () => {
    try {
      if (useTimeStore.getState().exportTeamData) {
        await useTimeStore.getState().exportTeamData('csv', {
          days: teamDateRange,
          structureId: user.structure_id,
          userId: selectedAnimator !== 'all' ? selectedAnimator : null
        });
      } else {
        logger.log('Export des données d\'équipe...');
      }
    } catch (error) {
      logger.error('Erreur lors de l\'export:', error);
    }
  };

  // ===== CALCULS ET DONNÉES =====
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

  const filteredAnimators = myStructureAnimators.filter(animator => {
    const matchesSearch = 
      (animator.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalAnimators = myStructureAnimators.length;
  const activeAnimators = myStructureAnimators.filter(a => a?.active).length;

  const recentActivity = todayEntries
    .filter(entry => {
      const entryUser = myStructureAnimators.find(u => u?.id === entry?.user_id);
      return entryUser !== undefined;
    })
    .slice(0, recentActivityLimit)
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

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

  // ===== COMPOSANTS DE RENDU =====
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Projets (à venir)</h2>
          <Button
            variant="primary"
            onClick={() => setShowCreateProjectModal(true)}
            className="mb-0"
          >
            + Créer un projet
          </Button>
        </div>
      </Card>



<Card 
  clickable 
  hoverable 
  className="p-4"
  onClick={() => setActiveView('planning')}
>
  <div className="flex items-center">
    <div className="p-3 bg-indigo-100 rounded-lg">
      <Calendar className="w-6 h-6 text-indigo-600" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Planifier</p>
      <p className="text-lg font-semibold text-gray-900">Mes Heures</p>
    </div>
  </div>
</Card>

      <Card 
        clickable 
        hoverable 
        className="p-4"
        onClick={() => setActiveView('realized')}
      >
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Consulter</p>
            <p className="text-lg font-semibold text-gray-900">Heures Réalisées</p>
          </div>
        </div>
      </Card>

    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">


      <StatsCard
        title="Mes Heures"
        value={getWeeklyWorkedTime()}
        change="cette semaine"
        trend="neutral"
        icon={<Clock className="w-6 h-6" />}
      />

      <StatsCard
        title="Mes Animateurs"
        value={totalAnimators}
        change={`${activeAnimators} actifs`}
        trend="positive"
        icon={<Users className="w-6 h-6" />}
      />


    </div>
  );

  const renderAnimatorsList = () => (
    <Card title="Mes Animateurs" className="h-full">
      <div className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un animateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des animateurs */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredAnimators.length > 0 ? (
            filteredAnimators.slice(0, showAllAnimators ? filteredAnimators.length : 5).map((animator) => (
              <div 
                key={animator.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleAnimatorSelection(animator.id)}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${animator.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {animator.first_name} {animator.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{animator.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUser(animator);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAnimatorStatus(animator.id, !animator.active);
                    }}
                    variant={animator.active ? "success" : "danger"}
                    size="sm"
                    className="min-w-[70px]"
                  >
                    {animator.active ? 'Actif' : 'Inactif'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun animateur trouvé</p>
            </div>
          )}
        </div>

        {/* Bouton voir plus */}
        {filteredAnimators.length > 5 && (
          <Button
            variant="outline"
            onClick={() => setShowAllAnimators(!showAllAnimators)}
            className="w-full"
          >
            {showAllAnimators ? 'Voir moins' : `Voir tous (${filteredAnimators.length})`}
          </Button>
        )}
      </div>
    </Card>
  );

  const handleToggleAnimatorStatus = async (animatorId, newStatus) => {
    try {
      await toggleUserStatus(animatorId, newStatus);
      logger.log(`✅ Statut animateur ${animatorId} modifié`);
      await loadData();
    } catch (error) {
      logger.error('❌ Erreur toggle status:', error);
    }
  };

  // Vue principale du dashboard
  const renderDashboard = () => (
    <>
      {renderHeader()}
      {renderQuickActions()}
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAnimatorsList()}
        {renderRecentActivity()}
      </div>
    </>
  );



  // Activité récente
  const renderRecentActivity = () => (
    <Card title="Activité Récente" className="h-full">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivity.length > 0 ? (
          recentActivity.slice(0, showAllActivity ? recentActivity.length : 10).map((entry, index) => {
            const entryUser = myStructureAnimators.find(u => u?.id === entry?.user_id);
            const actionIcon = {
              'arrival': <PlayCircle className="w-4 h-4 text-green-600" />,
              'departure': <StopCircle className="w-4 h-4 text-red-600" />,
              'break_start': <PauseCircle className="w-4 h-4 text-orange-500" />,
              'break_end': <PauseCircle className="w-4 h-4 text-blue-500" />
            };

            const actionLabel = {
              'arrival': 'Arrivée',
              'departure': 'Départ',
              'break_start': 'Début pause',
              'break_end': 'Fin pause'
            };

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {actionIcon[entry.tracking_type]}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {entryUser ? `${entryUser.first_name} ${entryUser.last_name}` : 'Utilisateur inconnu'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {actionLabel[entry.tracking_type]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(entry.date_time).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.date_time).toLocaleDateString('fr-FR')}
                  </p>
                </div>
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

      {recentActivity.length > 10 && (
        <Button
          variant="outline"
          onClick={() => setShowAllActivity(!showAllActivity)}
          className="w-full mt-4"
        >
          {showAllActivity ? 'Voir moins' : `Voir toutes (${recentActivity.length})`}
        </Button>
      )}
    </Card>
  );
  
    <>
      {renderHeader()}
      <VacationTester />
      {renderQuickActions()}
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>{renderAnimatorsList()}</div>
        <div>{renderRecentActivity()}</div>
      </div>
    </>

  // Gestion d'équipe
  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion d'Équipe</h2>
          <p className="text-gray-600 mt-1">Suivi des horaires de vos animateurs</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportTeamData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>

      {/* Filtres d'équipe */}
      {renderTeamFilters()}

      {/* Données d'équipe */}
      {renderTeamData()}
    </div>
  );

  // Gestion des horaires personnels du directeur
const renderScheduleManagement = () => (
  
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes Horaires</h2>
        <p className="text-gray-600 mt-1">Gestion de votre temps de travail</p>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => setActiveView('dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>

    {/* Panel de pointage */}
    {renderDirectorTimeTracking(
      currentTime,                    // Heure actuelle
      handleClockAction,              // Fonction de pointage
      canClockIn,                     // Peut pointer arrivée
      canClockOut,                    // Peut pointer sortie
      canPauseOrResume,               // Peut pause/reprendre
      actionLoading,                  // État de chargement
      myTodayEntries,                 // Pointages du jour
      isOnBreak,                      // En pause ou non
      getPauses,                      // Fonction pauses
      status,                         // Status du jour (getTodayStatus())
      getWorkedTimeWithMultipleBreaks, // Fonction temps travaillé
      getWeeklyWorkedTime,            // Fonction heures semaine
      getMonthlyWorkedTime,            // Fonction heures mois
      handleTimeTrackingAction        // Fonction de gestion pointage
    )}

    {/* Historique */}
    {renderDirectorHistory(      
      timeHistory || [],      // Données d'historique avec fallback
      processedHistory || [], // Données processées avec fallback
      user?.id,              // ID utilisateur
      weeklyStats,           // Stats hebdomadaires
      monthlyStats)}
  </div>
);

  // Sélection d'animateur avec statistiques
  const handleAnimatorSelection = async (animatorId) => {
  if (animatorId !== 'all') {
    setSelectedAnimator(animatorId);
    await loadAnimatorDetailedStats(animatorId, selectedPeriodForStats);
    setShowAnimatorStatsModal(true);
  } else {
    setSelectedAnimator('all');
    setSelectedAnimatorStats(null);
    setShowAnimatorStatsModal(false);
  }
};

  // Charger les statistiques détaillées d'un animateur
  const loadAnimatorDetailedStats = async (animatorId, period = 'current_month') => {
    if (!animatorId) return;
    
    setAnimatorStatsLoading(true);
    try {
      const animator = myStructureAnimators.find(a => a.id === parseInt(animatorId));
      if (!animator) return;

      const dateRange = calculatePeriodDates(period);
      
      const result = await fetchTimeHistory(null, animatorId, dateRange.start, dateRange.end);
      if (result.success) {
        const entries = result.data || [];
        const stats = calculateComprehensiveStats(entries, animator, period, dateRange);
        setSelectedAnimatorStats(stats);
      }
    } catch (error) {
      logger.error('Erreur chargement stats animateur:', error);
    } finally {
      setAnimatorStatsLoading(false);
    }
  };

  // Modal des statistiques détaillées d'un animateur
  const renderAnimatorStatsModal = () => {
    if (!showAnimatorStatsModal || !selectedAnimatorStats) return null;

    const { animator, period, hours, performance, patterns, workingDays } = selectedAnimatorStats;

    return (
    <Modal
      isOpen={showAnimatorStatsModal}
      onClose={() => {
        setShowAnimatorStatsModal(false);
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
      }}
      size="6xl"
      title={`Statistiques détaillées - ${animator.first_name} ${animator.last_name}`}
      showCloseButton={true}
      closeOnOverlay={true}
      closeOnEscape={true}
    >
      <div 
        className="space-y-6" 
        style={{ 
          maxHeight: '75vh', 
          overflowY: 'auto',
          paddingRight: '4px' 
        }}
      >
          {/* En-tête avec contrôles de période */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{period.label}</h3>
              <p className="text-sm text-gray-600">
                Du {new Date(period.start).toLocaleDateString('fr-FR')} au {new Date(period.end).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriodForStats}
                onChange={(e) => {
                  setSelectedPeriodForStats(e.target.value);
                  loadAnimatorDetailedStats(animator.id, e.target.value);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {PERIOD_OPTIONS.filter(p => p.value !== 'custom').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cartes de métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Heures travaillées"
              value={`${hours.total}h`}
              change={`Objectif: ${hours.objective}h`}
              trend={performance.isOnTrack ? 'positive' : performance.needsAttention ? 'negative' : 'neutral'}
              icon={<Clock className="w-5 h-5" />}
              className={performance.isOnTrack ? 'border-l-4 border-green-500' : 
                        performance.needsAttention ? 'border-l-4 border-red-500' : 'border-l-4 border-yellow-500'}
            />

            <StatsCard
              title="Progression"
              value={`${performance.completionRate}%`}
              change={`${hours.remaining > 0 ? `${hours.remaining}h restantes` : 'Objectif atteint'}`}
              trend={performance.completionRate >= 90 ? 'positive' : 
                     performance.completionRate >= 75 ? 'neutral' : 'negative'}
              icon={<Target className="w-5 h-5" />}
            />

            <StatsCard
              title="Moyenne quotidienne"
              value={`${hours.averagePerDay}h`}
              change={`${performance.completeDays} jours complets`}
              trend="neutral"
              icon={<Timer className="w-5 h-5" />}
            />

            <StatsCard
              title="Ponctualité"
              value={patterns.consistency.label}
              change={`Arrivée moyenne: ${patterns.averageArrival}`}
              trend={patterns.punctualityScore >= 75 ? 'positive' : 'neutral'}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Graphique de progression */}
          <Card title="Progression vers l'objectif">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Avancement</span>
                <span className="text-sm text-gray-500">{performance.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    performance.completionRate >= 100 ? 'bg-green-500' : 
                    performance.completionRate >= 75 ? 'bg-blue-500' : 
                    performance.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(performance.completionRate, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{hours.total}h travaillées</span>
                <span>{hours.objective}h objectif</span>
              </div>
              
              {/* Analyse de performance */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  {React.createElement(performance.status.icon, { 
                    className: `w-5 h-5 mr-2 text-${performance.status.color}-600` 
                  })}
                  <span className={`font-medium text-${performance.status.color}-700`}>
                    {performance.status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {hours.variance >= 0 
                    ? `Dépassement de ${Math.abs(hours.variance)}h par rapport à l'objectif`
                    : `Retard de ${Math.abs(hours.variance)}h par rapport à l'objectif`
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Historique détaillé */}
<Card title="Historique (période sélectionnée)" className="overflow-hidden">
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
        {workingDays && workingDays.length > 0 ? (
          workingDays.slice(0, 15).map((day, index) => (
            <tr key={`${day.date}-${index}`}>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-32">
                {day.formattedDate}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">
                {day.arrival || '--:--'}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">
                {day.breakStart || '--:--'}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">
                {day.breakEnd || '--:--'}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-20">
                {day.departure || '--:--'}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-900 w-16">
                {day.formattedWorkingHours}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
              {animatorStatsLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Chargement des données...
                </div>
              ) : (
                <div>
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Aucun pointage trouvé pour cette période</p>
                  <p className="text-xs text-gray-400 mt-1">
                    L'animateur n'a pas encore effectué de pointages ou les données ne sont pas disponibles
                  </p>
                </div>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</Card>

          {/* Analyses et recommandations */}
          <Card title="Analyses et Recommandations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Analyse des patterns</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jour le plus productif :</span>
                    <span className="text-sm font-medium text-gray-900">{patterns.mostProductiveDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Régularité des horaires :</span>
                    <span className={`text-sm font-medium text-${patterns.consistency.color}-600`}>
                      {patterns.consistency.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score de ponctualité :</span>
                    <span className="text-sm font-medium text-gray-900">{patterns.punctualityScore}/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Recommandations</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {performance.needsAttention && (
                    <div className="flex items-start text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Performance insuffisante - Entretien recommandé</span>
                    </div>
                  )}
                  {hours.variance < -10 && (
                    <div className="flex items-start text-orange-600">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Retard significatif sur les objectifs</span>
                    </div>
                  )}
                  {patterns.punctualityScore < 70 && (
                    <div className="flex items-start text-yellow-600">
                      <Timer className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Améliorer la régularité des horaires</span>
                    </div>
                  )}
                  {performance.isOnTrack && (
                    <div className="flex items-start text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Performance excellente - Continuer ainsi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Modal>
    );
  };

  // Rendu du contenu principal selon la vue active
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'team':
        return renderTeamManagement();
      case 'schedule':
        return renderScheduleManagement();
      case 'planning':
        return <YearlyPlanningRoadmap onBack={() => setActiveView('dashboard')} />;
      case 'realized': // ✅ NOUVEAU CAS
        return <RealizedHoursRoadmap onBack={() => setActiveView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  
  // ===== RENDU PRINCIPAL =====
  return (
    <div className="space-y-6">
      {renderContent()}
      
      {/* Modals */}
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

{showEditUserModal && selectedUser && (
  <Modal
    isOpen={showEditUserModal}
    onClose={() => {
      setShowEditUserModal(false);
      setSelectedUser(null);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }}
    size="4xl" // ✅ Même taille que les stats
    title={`Modifier ${selectedUser.first_name} ${selectedUser.last_name}`}
    showCloseButton={true}
    closeOnOverlay={true}
    closeOnEscape={true}
  >
    <div 
      className="space-y-6" 
      style={{ 
        maxHeight: '75vh', 
        overflowY: 'auto',
        paddingRight: '4px' 
      }}
    >
      <EditUserForm
        user={selectedUser}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
          document.body.style.overflow = 'unset';
          document.body.classList.remove('modal-open');
        }}
        onUserUpdated={handleUserUpdated}
        isDirectorContext={true}
        fixedRole="animator"
        fixedStructureId={user?.structure_id}
      />
    </div>
  </Modal>
)}

{showCreateProjectModal && (
  <Modal
    isOpen={showCreateProjectModal}
    onClose={() => setShowCreateProjectModal(false)}
    title="Créer un projet"
    size="md"
  >
    <CreateProjectForm
      onSuccess={() => {
        setShowCreateProjectModal(false);
        // Optionnel: rafraîchir la liste des projets ici
      }}
      onCancel={() => setShowCreateProjectModal(false)}
    />
  </Modal>
)}
      {/* Modal des statistiques détaillées */}
      {renderAnimatorStatsModal()}
    </div>
  );
};

export default DirectorDashboard;