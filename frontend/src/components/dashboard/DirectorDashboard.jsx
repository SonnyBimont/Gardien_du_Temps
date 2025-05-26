import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Target,
  FileText,
  Settings,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTimeStore } from '../../stores/timeStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAdminStore } from '../../stores/adminStore';
import { calculateTotalHours, calculateWeeklyStats, calculateMonthlyStats, getTodayStatus, formatHours } from '../../utils/timeCalculations';
import TimeTracker from '../timetracking/TimeTracker';
import TimeTable from '../timetracking/TimeTable';
import Button from '../common/Button';
import Card, { StatsCard } from '../common/Card';
import Modal, { useModal } from '../common/Modal';
import CreateProjectForm from '../forms/CreateProjectForm';

const DirectorDashboard = () => {
  const { user } = useAuthStore();
  const { entries, fetchUserEntries, fetchAllEntries, loading: timeLoading } = useTimeStore();
  const { 
    projects, 
    tasks, 
    fetchProjects, 
    fetchTasks,
    getProjectsByStatus,
    loading: projectLoading 
  } = useProjectStore();
  const { users, structures, fetchUsers, fetchStructures } = useAdminStore();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedView, setSelectedView] = useState('overview');
  const projectModal = useModal();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserEntries(user?.id),
        fetchAllEntries({ days: 30 }),
        fetchProjects(),
        fetchTasks(),
        fetchUsers(),
        fetchStructures()
      ]);
    };
    
    loadData();
  }, [user?.id, fetchUserEntries, fetchAllEntries, fetchProjects, fetchTasks, fetchUsers, fetchStructures]);

  // Calculs des statistiques personnelles
  const userEntries = entries.filter(entry => entry.user_id === user?.id);
  const processedEntries = calculateTotalHours(userEntries);
  const weeklyStats = calculateWeeklyStats(userEntries);
  const monthlyStats = calculateMonthlyStats(userEntries);
  const todayStatus = getTodayStatus(userEntries);

  // Statistiques de l'équipe
  const teamMembers = users.filter(u => u.structure_id === user?.structure_id && u.id !== user?.id);
  const activeProjects = getProjectsByStatus('in_progress');
  const completedProjects = getProjectsByStatus('completed');
  const pendingTasks = tasks.filter(task => task.status === 'todo');
  
  // Activité de l'équipe aujourd'hui
  const todayEntries = entries.filter(entry => 
    entry.date_time.startsWith(new Date().toISOString().split('T')[0])
  );
  const activeTeamMembers = todayEntries
    .map(entry => entry.user_id)
    .filter((id, index, arr) => arr.indexOf(id) === index)
    .length;

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card clickable onClick={projectModal.openModal} hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FolderPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Créer</p>
            <p className="text-lg font-semibold text-gray-900">Projet</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Gérer</p>
            <p className="text-lg font-semibold text-gray-900">Équipe</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Voir</p>
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
            <p className="text-sm font-medium text-gray-600">Structure</p>
            <p className="text-lg font-semibold text-gray-900">Paramètres</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Mon temps aujourd'hui"
        value={todayStatus.isPresent ? formatHours(processedEntries[0]?.workingHours || 0) : '0h00'}
        change={todayStatus.isPresent ? 'En cours' : 'Non pointé'}
        trend={todayStatus.isPresent ? 'positive' : 'neutral'}
        icon={<Clock className="w-6 h-6" />}
      />

      <StatsCard
        title="Équipe active"
        value={activeTeamMembers}
        change={`/${teamMembers.length} membres`}
        trend={activeTeamMembers > teamMembers.length / 2 ? 'positive' : 'neutral'}
        icon={<Users className="w-6 h-6" />}
      />

      <StatsCard
        title="Projets actifs"
        value={activeProjects.length}
        change={`${completedProjects.length} terminés`}
        trend="positive"
        icon={<Target className="w-6 h-6" />}
      />

      <StatsCard
        title="Tâches en attente"
        value={pendingTasks.length}
        change="À assigner"
        trend={pendingTasks.length > 10 ? 'negative' : 'neutral'}
        icon={<AlertTriangle className="w-6 h-6" />}
      />
    </div>
  );

  const renderPersonalStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Cette semaine</h3>
            <p className="text-2xl font-bold">{weeklyStats.formattedTotalHours}</p>
            <p className="text-blue-100">{weeklyStats.workingDays} jours travaillés</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-200" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ce mois</h3>
            <p className="text-2xl font-bold">{monthlyStats.formattedTotalHours}</p>
            <p className="text-green-100">{monthlyStats.workingDays} jours travaillés</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Moyenne/jour</h3>
            <p className="text-2xl font-bold">{weeklyStats.formattedAverageHours}</p>
            <p className="text-purple-100">Temps moyen</p>
          </div>
          <BarChart3 className="w-8 h-8 text-purple-200" />
        </div>
      </div>
    </div>
  );

  const renderTeamActivity = () => (
    <Card title="Activité de l'équipe" className="h-96">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {todayEntries.length > 0 ? (
          todayEntries
            .slice(0, 8)
            .map((entry, index) => {
              const entryUser = users.find(u => u.id === entry.user_id);
              const getActionText = (type) => {
                const actions = {
                  arrival: 'est arrivé(e)',
                  departure: 'est parti(e)',
                  break_start: 'a pris une pause',
                  break_end: 'a repris le travail'
                };
                return actions[type] || type;
              };

              return (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {entryUser?.first_name} {entryUser?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getActionText(entry.tracking_type)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(entry.date_time).toLocaleTimeString('fr-FR', {
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
            <p>Aucune activité aujourd'hui</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderProjectsOverview = () => (
    <Card 
      title="Projets en cours"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Projets ({projects.length})
          </h3>
          <Button variant="outline" size="sm" onClick={projectModal.openModal}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activeProjects.length > 0 ? (
          activeProjects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{project.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {project.description || 'Pas de description'}
                </p>
                {project.end_date && (
                  <p className="text-xs text-gray-400 mt-1">
                    Échéance: {new Date(project.end_date).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  project.priority === 'high' ? 'bg-red-100 text-red-800' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {project.priority}
                </span>
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun projet en cours</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={projectModal.openModal}
            >
              Créer le premier projet
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  if (timeLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord - Directeur
          </h1>
          <p className="text-gray-600 mt-1">
            Bonjour {user?.first_name}, pilotez votre structure et vos projets
          </p>
        </div>
        
        {/* Navigation des vues */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm mr-2"
          >
            <option value="overview">Vue d'ensemble</option>
            <option value="team">Équipe</option>
            <option value="projects">Projets</option>
            <option value="reports">Rapports</option>
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
          </select>
        </div>
      </div>

      {/* Actions rapides */}
      {renderQuickActions()}
      
      {/* Statistiques principales */}
      {renderStatsCards()}

      {/* Statistiques personnelles */}
      {renderPersonalStats()}

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pointage personnel */}
        <TimeTracker />
        
        {/* Activité de l'équipe */}
        {renderTeamActivity()}
      </div>

      {/* Contenu secondaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets */}
        {renderProjectsOverview()}
        
        {/* Tableau des pointages */}
        <div className="lg:col-span-1">
          <TimeTable />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={projectModal.isOpen}
        onClose={projectModal.closeModal}
        title="Créer un projet"
        size="lg"
      >
        <CreateProjectForm onSuccess={projectModal.closeModal} />
      </Modal>
    </div>
  );
};

export default DirectorDashboard;