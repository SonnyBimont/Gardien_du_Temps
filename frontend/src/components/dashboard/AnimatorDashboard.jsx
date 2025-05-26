import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Play,
  Pause,
  Coffee,
  LogOut as Leave,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTimeStore } from '../../stores/timeStore';
import { useProjectStore } from '../../stores/projectStore';
import { calculateTotalHours, calculateCurrentWorkingTime, getTodayStatus, formatHours } from '../../utils/timeCalculations';
import TimeTracker from '../timetracking/TimeTracker';
import TimeTable from '../timetracking/TimeTable';
import Button from '../common/Button';
import Card, { StatsCard } from '../common/Card';
import Modal, { useModal } from '../common/Modal';
import CreateTaskForm from '../forms/CreateTaskForm';

const AnimatorDashboard = () => {
  const { user } = useAuthStore();
  const { entries, fetchUserEntries, loading: timeLoading } = useTimeStore();
  const { 
    tasks, 
    projects, 
    fetchTasks, 
    fetchProjects,
    getUserTasks,
    getTasksByStatus,
    loading: projectLoading 
  } = useProjectStore();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const taskModal = useModal();

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        await Promise.all([
          fetchUserEntries(user.id),
          fetchTasks(),
          fetchProjects()
        ]);
      }
    };
    
    loadData();
  }, [user?.id, fetchUserEntries, fetchTasks, fetchProjects]);

  // Calculs des statistiques
  const processedEntries = calculateTotalHours(entries);
  const todayStatus = getTodayStatus(entries);
  const currentWorkingTime = calculateCurrentWorkingTime(entries);
  
  // Tâches de l'utilisateur
  const userTasks = getUserTasks(user?.id || 0);
  const todoTasks = getTasksByStatus('todo').filter(task => task.assigned_to === user?.id);
  const inProgressTasks = getTasksByStatus('in_progress').filter(task => task.assigned_to === user?.id);
  const completedTasks = getTasksByStatus('completed').filter(task => task.assigned_to === user?.id);

  // Statistiques temporelles
  const todayEntry = processedEntries.find(entry => 
    entry.date === new Date().toISOString().split('T')[0]
  );
  
  const weekEntries = processedEntries.slice(0, 7);
  const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.workingHours, 0);
  
  const monthEntries = processedEntries.slice(0, 30);
  const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.workingHours, 0);

  const getStatusDisplay = () => {
    if (todayStatus.hasLeft) return { text: 'Journée terminée', color: 'text-gray-600', icon: '✅' };
    if (todayStatus.isOnBreak) return { text: 'En pause', color: 'text-yellow-600', icon: '⏸️' };
    if (todayStatus.isPresent) return { text: 'Au travail', color: 'text-green-600', icon: '🟢' };
    return { text: 'Non pointé', color: 'text-gray-400', icon: '⚪' };
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card clickable onClick={taskModal.openModal} hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FolderPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Créer</p>
            <p className="text-lg font-semibold text-gray-900">Tâche</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Voir</p>
            <p className="text-lg font-semibold text-gray-900">Rapports</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Planning</p>
            <p className="text-lg font-semibold text-gray-900">Semaine</p>
          </div>
        </div>
      </Card>

      <Card clickable hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Mes</p>
            <p className="text-lg font-semibold text-gray-900">Objectifs</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Aujourd'hui"
        value={todayEntry ? formatHours(todayEntry.workingHours) : '0h00'}
        change={todayStatus.isPresent ? `En cours: ${formatHours(currentWorkingTime)}` : getStatusDisplay().text}
        trend={todayEntry?.workingHours > 7 ? 'positive' : 'neutral'}
        icon={<Clock className="w-6 h-6" />}
      />

      <StatsCard
        title="Cette semaine"
        value={formatHours(weekTotal)}
        change={`${weekEntries.filter(e => e.isComplete).length} jours travaillés`}
        trend={weekTotal > 35 ? 'positive' : 'neutral'}
        icon={<TrendingUp className="w-6 h-6" />}
      />

      <StatsCard
        title="Tâches en cours"
        value={inProgressTasks.length}
        change={`${todoTasks.length} à faire`}
        trend="neutral"
        icon={<Target className="w-6 h-6" />}
      />

      <StatsCard
        title="Tâches terminées"
        value={completedTasks.length}
        change={`${userTasks.length} total`}
        trend="positive"
        icon={<CheckCircle className="w-6 h-6" />}
      />
    </div>
  );

  const renderCurrentStatus = () => {
    const status = getStatusDisplay();
    
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{status.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Statut actuel
              </h3>
              <p className={`text-sm ${status.color}`}>{status.text}</p>
            </div>
          </div>
          
          {todayStatus.isPresent && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatHours(currentWorkingTime)}
              </p>
              <p className="text-sm text-gray-500">Temps travaillé</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTasksList = () => (
    <Card 
      title="Mes tâches"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Mes tâches ({userTasks.length})
          </h3>
          <Button variant="outline" size="sm" onClick={taskModal.openModal}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {userTasks.length > 0 ? (
          userTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {task.description || 'Pas de description'}
                </p>
                {task.due_date && (
                  <p className="text-xs text-gray-400 mt-1">
                    Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTaskPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune tâche assignée</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={taskModal.openModal}
            >
              Créer ma première tâche
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  const renderWeeklyOverview = () => (
    <Card title="Vue hebdomadaire" className="h-80">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {weekEntries.map((entry, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium text-gray-900">{entry.dayName}</p>
              <p className="text-sm text-gray-500">{entry.formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {entry.formattedWorkingHours}
              </p>
              <p className="text-xs text-gray-500">
                {entry.arrival && entry.departure 
                  ? `${entry.arrival} - ${entry.departure}`
                  : entry.arrival 
                  ? `${entry.arrival} - En cours`
                  : 'Non pointé'
                }
              </p>
            </div>
          </div>
        ))}
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
            Tableau de bord - Animateur
          </h1>
          <p className="text-gray-600 mt-1">
            Bonjour {user?.first_name}, gérez votre temps et vos tâches
          </p>
        </div>
        
        {/* Contrôles de période */}
        <div className="flex items-center space-x-2">
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

      {/* Statut actuel */}
      {renderCurrentStatus()}
      
      {/* Statistiques */}
      {renderStatsCards()}

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pointage */}
        <TimeTracker />
        
        {/* Vue hebdomadaire */}
        {renderWeeklyOverview()}
      </div>

      {/* Contenu secondaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes tâches */}
        {renderTasksList()}
        
        {/* Tableau des pointages */}
        <div className="lg:col-span-1">
          <TimeTable />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={taskModal.isOpen}
        onClose={taskModal.closeModal}
        title="Créer une tâche"
        size="lg"
      >
        <CreateTaskForm onSuccess={taskModal.closeModal} />
      </Modal>
    </div>
  );
};

export default AnimatorDashboard;