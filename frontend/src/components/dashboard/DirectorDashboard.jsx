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
  Filter,
  CheckCircle,
  AlertCircle,
  Target,
  Timer,
  BarChart3
} from 'lucide-react';
import { calculateTotalHours, formatTime, calculatePeriodDates, getPerformanceStatus, getMostProductiveDay, getConsistencyRating, calculateVariance, getWorkDayStatus } from '../../utils/timeCalculations';
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


// ===== CONSTANTES =====
const PERIOD_OPTIONS = [
  { value: 'current_week', label: 'Semaine en cours', description: 'Du lundi au dimanche' },
  { value: 'current_month', label: 'Mois en cours', description: 'Du 1er au dernier jour' },
  { value: 'current_quarter', label: 'Trimestre en cours', description: 'Trimestre actuel' },
  { value: 'current_year', label: 'Année en cours', description: 'De janvier à décembre' },
  { value: 'previous_week', label: 'Semaine précédente', description: 'La semaine passée' },
  { value: 'previous_month', label: 'Mois précédent', description: 'Le mois passé' },
  { value: 'previous_quarter', label: 'Trimestre précédent', description: 'Le trimestre passé' },
  { value: 'previous_year', label: 'Année précédente', description: 'L\'année passée' },
  { value: 'last_30_days', label: '30 derniers jours', description: 'Période glissante' },
  { value: 'last_90_days', label: '90 derniers jours', description: 'Période glissante' },
  { value: 'custom', label: 'Période personnalisée', description: 'Choisir les dates' }
];

const DirectorDashboard = () => {
  // ===== HOOKS ET STORES =====
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
  const [recentActivityLimit, setRecentActivityLimit] = useState(30);
  
  // États pour la gestion d'équipe
  const [selectedAnimator, setSelectedAnimator] = useState('all');
  const [teamDateRange, setTeamDateRange] = useState('current_month');
  const [actionLoading, setActionLoading] = useState(null);
  const [teamData, setTeamData] = useState([]);
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

  // ===== EFFETS =====
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

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  // Charger les données d'équipe au changement de période
  useEffect(() => {
    if (activeView === 'team') {
      loadTeamData();
    }
  }, [teamDateRange, activeView, user?.structure_id]);

  // ===== FONCTIONS UTILITAIRES =====
  const calculatePeriodDates = (period, customStart = null, customEnd = null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    switch (period) {
      case 'current_week':
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return {
          start: monday.toISOString().split('T')[0],
          end: sunday.toISOString().split('T')[0],
          label: 'Semaine en cours'
        };

      case 'current_month':
        return {
          start: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0],
          label: 'Mois en cours'
        };

      case 'current_quarter':
        const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
        const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        return {
          start: quarterStart.toISOString().split('T')[0],
          end: quarterEnd.toISOString().split('T')[0],
          label: 'Trimestre en cours'
        };

      case 'current_year':
        return {
          start: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          end: new Date(currentYear, 11, 31).toISOString().split('T')[0],
          label: 'Année en cours'
        };

      case 'previous_week':
        const prevWeekMonday = new Date(now);
        prevWeekMonday.setDate(now.getDate() - now.getDay() - 6);
        const prevWeekSunday = new Date(prevWeekMonday);
        prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
        return {
          start: prevWeekMonday.toISOString().split('T')[0],
          end: prevWeekSunday.toISOString().split('T')[0],
          label: 'Semaine précédente'
        };

      case 'previous_month':
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return {
          start: new Date(prevYear, prevMonth, 1).toISOString().split('T')[0],
          end: new Date(prevYear, prevMonth + 1, 0).toISOString().split('T')[0],
          label: 'Mois précédent'
        };

      case 'last_30_days':
        const thirty = new Date(now);
        thirty.setDate(now.getDate() - 30);
        return {
          start: thirty.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0],
          label: '30 derniers jours'
        };

      case 'custom':
        return {
          start: customStart,
          end: customEnd,
          label: 'Période personnalisée'
        };

      default:
        return calculatePeriodDates('current_month');
    }
  };

const calculatePeriodObjective = (period, weeklyHours, annualHours) => {
  switch (period) {
    case 'current_week':
    case 'previous_week':
      return weeklyHours || 35;
    case 'current_month':
    case 'previous_month':
      return (weeklyHours || 35) * 4.33;
    case 'current_quarter':
    case 'previous_quarter':
      return (weeklyHours || 35) * 13;
    case 'current_year':
    case 'previous_year':
      return annualHours || ((weeklyHours || 35) * 52);
    case 'last_30_days':
      return (weeklyHours || 35) * 4.33;
    case 'last_90_days':
      return (weeklyHours || 35) * 13;
    default:
      return (weeklyHours || 35) * 4.33;
  }
};

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDecimalToTime = (decimal) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateVariance = (numbers) => {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  };

  const getPerformanceStatus = (completionRate) => {
    if (completionRate >= 100) return { label: 'Objectif atteint', color: 'green', icon: CheckCircle };
    if (completionRate >= 90) return { label: 'Très bien', color: 'blue', icon: CheckCircle };
    if (completionRate >= 75) return { label: 'Satisfaisant', color: 'yellow', icon: AlertCircle };
    if (completionRate >= 60) return { label: 'À améliorer', color: 'orange', icon: AlertCircle };
    return { label: 'Insuffisant', color: 'red', icon: AlertCircle };
  };

  const getMostProductiveDay = (workingDays) => {
    const completeDays = workingDays.filter(day => day.isComplete);
    if (completeDays.length === 0) return 'Aucun';
    
    const maxDay = completeDays.reduce((max, day) => 
      day.hoursWorked > max.hoursWorked ? day : max
    );
    
    return `${maxDay.dayName} (${maxDay.hoursWorked}h)`;
  };

  const getConsistencyRating = (score) => {
    if (score >= 90) return { label: 'Très régulier', color: 'green' };
    if (score >= 75) return { label: 'Régulier', color: 'blue' };
    if (score >= 60) return { label: 'Moyennement régulier', color: 'yellow' };
    return { label: 'Irrégulier', color: 'red' };
  };

  const getWorkDayStatus = (arrival, departure, breakStart, breakEnd) => {
    if (!arrival) return 'absent';
    if (arrival && !departure) return 'en_cours';
    if (arrival && departure) return 'complet';
    return 'incomplet';
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

  const handleAnimatorCreated = useCallback(async () => {
    setShowCreateAnimatorModal(false);
    await loadData();
    if (activeView === 'team') {
      await loadTeamData();
    }
  }, [loadData, activeView]);

 
const loadTeamData = async () => {
  if (!user?.structure_id) return;
  
  try {
    console.log('🔄 Chargement données équipe pour structure:', user.structure_id);
    
    const result = await fetchTeamSummary(teamDateRange, user.structure_id);
    console.log('📊 Réponse API team-summary:', result);
    
    if (result.success && result.data) {
      const apiData = result.data;
      console.log('📋 Données API reçues:', apiData);
      
      // ✅ CORRECTION: Récupérer les données utilisateurs depuis la bonne structure
      const usersFromAPI = apiData.users || [];
      console.log('👥 Utilisateurs depuis API:', usersFromAPI);
      
      // Créer un map des données de travail par user ID
      const workDataMap = new Map();
      usersFromAPI.forEach(userData => {
        workDataMap.set(userData.user.id, userData);
      });
      
      console.log('🗺️ Map des données de travail:', workDataMap);
      
      // ✅ FUSIONNER avec tous les animateurs de la structure
      const allAnimatorsData = myStructureAnimators.map(animator => {
        const workData = workDataMap.get(animator.id);
        
        if (workData) {
          // ✅ Animateur avec données de pointage - utiliser la structure API correcte
          console.log(`✅ Données trouvées pour ${animator.first_name}:`, workData);
          
          return {
            // Données utilisateur (depuis myStructureAnimators pour avoir tous les champs)
            id: animator.id,
            first_name: animator.first_name,
            last_name: animator.last_name,
            email: animator.email,
            weekly_hours: animator.weekly_hours || 35,
            annual_hours: animator.annual_hours,
            active: animator.active,
            
            // Données de travail (depuis l'API)
            totalHours: Math.round((workData.totalHours || 0) * 100) / 100,
            periodObjective: Math.round((workData.periodObjective || 0) * 100) / 100,
            hoursDifference: Math.round((workData.hoursDifference || 0) * 100) / 100,
            daysWorked: workData.daysWorked || 0,
            
            // Calcul du pourcentage de performance
            performance: workData.periodObjective > 0 
              ? Math.round((workData.totalHours / workData.periodObjective) * 100) 
              : 0
          };
        } else {
          // ✅ Animateur sans données de pointage - calculer l'objectif par défaut
          console.log(`⚠️ Pas de données pour ${animator.first_name}, calcul par défaut`);
          
          const weeklyHours = animator.weekly_hours || 35;
          const annualHours = animator.annual_hours;
          
          // Calculer l'objectif basé sur la période sélectionnée
          const periodObjective = calculatePeriodObjective(teamDateRange, weeklyHours, annualHours);
          
          return {
            id: animator.id,
            first_name: animator.first_name,
            last_name: animator.last_name,
            email: animator.email,
            weekly_hours: weeklyHours,
            annual_hours: annualHours,
            active: animator.active,
            
            totalHours: 0,
            periodObjective: periodObjective,
            hoursDifference: -periodObjective, // Tout l'objectif reste à faire
            daysWorked: 0,
            performance: 0
          };
        }
      });
      
      console.log('📋 Tableau final avec tous les animateurs:', allAnimatorsData);
      setTeamData(allAnimatorsData);
      
    } else {
      console.warn('⚠️ API team-summary: pas de données ou échec');
      throw new Error('Pas de données reçues de l\'API');
    }
  } catch (error) {
    console.error('❌ Erreur chargement équipe:', error);
    
    // ✅ FALLBACK: Afficher tous les animateurs avec des valeurs par défaut
    const fallbackData = myStructureAnimators.map(animator => {
      const weeklyHours = animator.weekly_hours || 35;
      const annualHours = animator.annual_hours;

      const periodObjective = calculatePeriodObjective(teamDateRange, weeklyHours, annualHours); // Par défaut mensuel
      
      return {
        id: animator.id,
        first_name: animator.first_name,
        last_name: animator.last_name,
        email: animator.email,
        weekly_hours: weeklyHours,
        annual_hours: annualHours,
        active: animator.active,
        
        totalHours: 0,
        periodObjective: periodObjective,
        hoursDifference: -periodObjective,
        daysWorked: 0,
        performance: 0
      };
    });
    
    console.log('🔄 Fallback avec données par défaut:', fallbackData);
    setTeamData(fallbackData);
  }
};

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
        await fetchTimeHistory(30, user.id);
        await fetchMonthlyReport(null, null, user.id);
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors du pointage ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
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
        console.log('Export des données d\'équipe...');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
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

  const myStructureAnimators = users.filter(u => 
    u && u.role === 'animator' && u.structure_id === user.structure_id
  );
  const myStructure = structures.find(s => s && s.id === user.structure_id);
  
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

  // Formatage du temps
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

  // Je continue dans le prochain message pour éviter la troncature...  // ===== FONCTIONS DE RENDU SUITE =====
  
  // Liste des animateurs
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
    onClick={async (e) => {
      e.stopPropagation();
      try {
        await toggleUserStatus(animator.id, !animator.active);
        console.log(`✅ Statut animateur ${animator.id} modifié`);
        // Recharger les données
        await loadData();
      } catch (error) {
        console.error('❌ Erreur toggle status:', error);
      }
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

  // Filtres d'équipe
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
            {PERIOD_OPTIONS.filter(p => p.value !== 'custom').map((option) => (
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animateur
          </label>
          <select
            value={selectedAnimator}
            onChange={(e) => handleAnimatorSelection(e.target.value)}
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

  // Données d'équipe
  const renderTeamData = () => (
  <Card title="Données d'équipe">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heures travaillées</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objectif</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Différence</th>
            {/* ✅ SUPPRIMÉ: Colonne Statut */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teamData.length > 0 ? (
            teamData.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${member.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.totalHours || '0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {/* ✅ CORRIGÉ: Afficher l'objectif cohérent avec la période */}
                  {member.periodObjective || '0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* ✅ NOUVEAU: Afficher la différence en heures au lieu du pourcentage */}
                  <span className={`${
                    (member.hoursDifference || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {(member.hoursDifference || 0) >= 0 ? '+' : ''}{member.hoursDifference || '0'}h
                  </span>
                </td>
                {/* ✅ SUPPRIMÉ: Colonne Statut */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnimatorSelection(member.id)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(member)}
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await toggleUserStatus(member.id, !member.active);
                          console.log(`✅ Statut animateur ${member.id} modifié`);
                          await loadTeamData();
                        } catch (error) {
                          console.error('❌ Erreur toggle status:', error);
                        }
                      }}
                      variant={member.active ? "success" : "danger"}
                      size="sm"
                      className="min-w-[80px]"
                    >
                      {member.active ? 'Actif' : 'Inactif'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                Aucune donnée d'équipe disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Card>
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
      {renderDirectorTimeTracking()}

      {/* Historique */}
      {renderDirectorHistory()}
    </div>
  );

  // Pointage du directeur
const renderDirectorTimeTracking = () => (
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

        {/* Résumé du jour - MÊME DESIGN QUE ANIMATEUR */}
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

        {/* Aide contextuelle */}
        {!status.arrival && (
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

  // Sélection d'animateur avec statistiques
const handleAnimatorSelection = async (animatorId) => {
  if (animatorId !== 'all') {
    // Toujours charger les stats et ouvrir la modal, même si c'est le même animateur
    setSelectedAnimator(animatorId);
    await loadAnimatorDetailedStats(animatorId, selectedPeriodForStats);
    setShowAnimatorStatsModal(true);
  } else {
    setSelectedAnimator('all');
    setSelectedAnimatorStats(null);
    setShowAnimatorStatsModal(false);
    document.body.style.overflow = 'unset';
    document.body.classList.remove('modal-open');
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
      console.error('Erreur chargement stats animateur:', error);
    } finally {
      setAnimatorStatsLoading(false);
    }
  };

const calculateComprehensiveStats = (entries, animator, period, dateRange) => {
  console.log('🔄 Calcul des stats complètes...');
  console.log('📊 Entrées reçues:', entries.length);
  console.log('📋 Première entrée:', entries[0]);
  
  if (!entries || entries.length === 0) {
    console.log('⚠️ Aucune entrée, retour stats vides');
    return createEmptyStats(animator, period, dateRange);
  }

  // ✅ UTILISER calculateTotalHours qui existe déjà
  const processedDays = calculateTotalHours(entries);
  console.log('📈 Jours traités:', processedDays.length);
  console.log('📊 Premier jour traité:', processedDays[0]);
  
  if (processedDays.length === 0) {
    console.log('⚠️ Aucun jour traité');
    return createEmptyStats(animator, period, dateRange);
  }

  // Calculs basiques
  const weeklyObjective = animator.weekly_hours || 35;
  const annualObjective = animator.annual_hours;
  
  let periodObjective;
  switch (period) {
    case 'current_week':
    case 'previous_week':
      periodObjective = weeklyObjective;
      break;
    case 'current_month':
    case 'previous_month':
    case 'last_30_days':
      periodObjective = weeklyObjective * 4.33;
      break;
    case 'current_year':
    case 'previous_year':
      periodObjective = annualObjective || (weeklyObjective * 52);
      break;
    default:
      periodObjective = weeklyObjective * 4.33;
  }
  
  const totalHours = processedDays.reduce((sum, day) => sum + (day.workingHours || 0), 0);
  const completeDays = processedDays.filter(day => day.isComplete).length;
  const averagePerDay = completeDays > 0 ? totalHours / completeDays : 0;
  const completionRate = periodObjective > 0 ? (totalHours / periodObjective) * 100 : 0;
  
  // ✅ SIMPLE : Utiliser directement processedDays
  const workingDays = processedDays;
  
  console.log('✅ Working days créés:', workingDays.length);
  console.log('📊 Premier working day:', workingDays[0]);
  
  // Calculs de patterns (version simple)
  const arrivalTimes = workingDays
    .filter(day => day.arrival)
    .map(day => {
      const [hours, minutes] = day.arrival.split(':').map(Number);
      return hours + minutes / 60;
    });
  
  const averageArrival = arrivalTimes.length > 0 
    ? arrivalTimes.reduce((sum, time) => sum + time, 0) / arrivalTimes.length 
    : 0;

  const formatDecimalToTime = (decimal) => {
    if (!decimal || decimal === 0) return '--:--';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const result = {
    animator,
    period: {
      type: period,
      label: dateRange.label,
      start: dateRange.start,
      end: dateRange.end,
      totalDays: workingDays.length
    },
    hours: {
      total: Math.round(totalHours * 100) / 100,
      objective: periodObjective,
      remaining: Math.max(0, periodObjective - totalHours),
      variance: Math.round((totalHours - periodObjective) * 100) / 100,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      totalBreakTime: processedDays.reduce((sum, day) => sum + (day.breakHours || 0), 0)
    },
    performance: {
      completionRate: Math.round(completionRate),
      completeDays,
      status: { label: completionRate >= 90 ? 'Bon' : 'À améliorer', color: completionRate >= 90 ? 'green' : 'orange', icon: AlertCircle },
      isOnTrack: completionRate >= 90,
      needsAttention: completionRate < 75
    },
    patterns: {
      averageArrival: formatDecimalToTime(averageArrival),
      punctualityScore: Math.round(Math.max(0, 100 - (arrivalTimes.length > 1 ? 10 : 0))),
      mostProductiveDay: workingDays.length > 0 ? (workingDays.reduce((best, day) => day.workingHours > best.workingHours ? day : best, workingDays[0]).dayName || 'Inconnu') : 'Aucun',
      consistency: { label: 'Régulier', color: 'blue' }
    },
    workingDays: workingDays, // ✅ IMPORTANT: Les données pour le tableau
    lastUpdate: new Date().toISOString()
  };
  
  console.log('✅ Stats complètes calculées:', result);
  console.log('📊 Working days dans result:', result.workingDays.length);
  return result;
};

const createEmptyStats = (animator, period, dateRange) => {
  const weeklyObjective = animator?.weekly_hours || 35;
  const annualObjective = animator?.annual_hours;
  const periodObjective = calculatePeriodObjective(period, weeklyObjective, annualObjective);
  
  return {
    animator: animator || { first_name: 'Inconnu', last_name: '', weekly_hours: 35 },
    period: {
      type: period,
      label: dateRange.label,
      start: dateRange.start,
      end: dateRange.end,
      totalDays: 0
    },
    hours: {
      total: 0,
      objective: periodObjective,
      remaining: periodObjective,
      variance: -periodObjective,
      averagePerDay: 0,
      totalBreakTime: 0
    },
    performance: {
      completionRate: 0,
      completeDays: 0,
      status: { label: 'Aucune donnée', color: 'gray', icon: AlertCircle },
      isOnTrack: false,
      needsAttention: true
    },
    patterns: {
      averageArrival: '--:--',
      punctualityScore: 0,
      mostProductiveDay: 'Aucun',
      consistency: { label: 'Aucune donnée', color: 'gray' }
    },
    workingDays: [],
    lastUpdate: new Date().toISOString()
  };
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
      case 'team':
        return renderTeamManagement();
      case 'schedule':
        return renderScheduleManagement();
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

      {/* Modal des statistiques détaillées */}
      {renderAnimatorStatsModal()}
    </div>
  );
};

export default DirectorDashboard;