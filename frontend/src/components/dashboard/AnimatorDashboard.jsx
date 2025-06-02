import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Activity, // For average hours
  Watch, // For contractual hours
  TrendingDown, // For time remaining/overtime
  ListChecks, // For tasks
  FileText, // For report
  ChevronLeft, // For report period navigation
  ChevronRight // For report period navigation
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTimeStore } from '../../stores/timeStore';
import { useProjectStore } from '../../stores/projectStore';
// Import more specific functions if needed, or rely on store's processed data
import { calculateCurrentWorkingTime, getTodayStatus, formatHours, calculateTotalHours } from '../../utils/timeCalculations'; 
import TimeTracker from '../timetracking/TimeTracker';
import TimeTable from '../timetracking/TimeTable';
import Button from '../common/Button';
import Card, { StatsCard } from '../common/Card';
import Modal, { useModal } from '../common/Modal';
import CreateTaskForm from '../forms/CreateTaskForm';

const AnimatorDashboard = () => {
  const { user } = useAuthStore();
  // Access weeklyStats and monthlyStats from the store
  const { 
    todayEntries, // Already used for today's status
    fetchUserEntries, // This should fetch timeHistory for calculations
    weeklyStats, 
    monthlyStats,
    getTimeSpentPerTask, // New getter for task time
    // Report specific state from store
    reportEntries,
    reportStats,
    reportLoading,
    fetchEntriesForPeriod,
    loading: timeLoading // General loading for initial data
  } = useTimeStore();

  const { 
    tasks, // Will use this from projectStore
    fetchTasks, 
    // fetchProjects, // Keep for context if needed - removed for brevity if not directly used in report
    getUserTasks,
    getTasksByStatus,
    loading: projectLoading 
  } = useProjectStore();

  const [selectedPeriod, setSelectedPeriod] = useState('week'); 
  const taskModal = useModal();

  // State for custom report period
  const [reportView, setReportView] = useState(false); // To toggle report section
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentReportPeriodLabel, setCurrentReportPeriodLabel] = useState('');
  
  // For user's contractual hours (assuming these exist on user object from authStore)
  const contractualWeeklyHours = parseFloat(user?.weekly_hours) || 0;

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        // Fetch time entries (e.g., for the last 30 days to cover month calculations)
        // fetchUserEntries should ideally be fetchTimeHistory from the store
        // Assuming fetchUserEntries(user.id) is correctly fetching timeHistory for the store to calculate weekly/monthly stats
        // Pass 30 to fetch last 30 days of entries for monthly calculation base by the store
        await Promise.all([
          fetchUserEntries(user.id, 30), // Initial load for dashboard stats
          fetchTasks(), 
          // fetchProjects() // Only if projects are directly needed beyond task context
        ]);
      }
    };
    
    loadData();
  }, [user?.id, fetchUserEntries, fetchTasks, fetchProjects]);
  
  // Use todayEntries for today's specific data, and entries for historical calculations if needed directly
  // However, weeklyStats and monthlyStats from the store are preferred.
  const todayStatus = getTodayStatus(todayEntries); // Correctly uses todayEntries
  const currentWorkingTime = calculateCurrentWorkingTime(todayEntries); // Correctly uses todayEntries
  
  // Tâches de l'utilisateur
  const userTasks = getUserTasks(user?.id || 0);
  const todoTasks = getTasksByStatus('todo').filter(task => task.assigned_to === user?.id);
  const inProgressTasks = getTasksByStatus('in_progress').filter(task => task.assigned_to === user?.id);
  const completedTasks = getTasksByStatus('completed').filter(task => task.assigned_to === user?.id);

  // Today's worked hours from todayEntries for precision
  const todayWorkedHours = useMemo(() => {
    // todayEntries are already filtered for today in the store's fetchTodayEntries
    // We just need to process them if they are raw, or if store provides processed today's hours directly use that
    const todayProcessed = calculateTotalHours(todayEntries); // calculateTotalHours can handle empty or already processed
    return todayProcessed.find(entry => entry.date === new Date().toISOString().split('T')[0])?.workingHours || 0;
  }, [todayEntries]);

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

  const renderStatsCards = () => {
    const weeklyHoursTarget = parseFloat(user?.weekly_hours) || 0;
    const dailyHoursTarget = parseFloat(user?.daily_hours_target) || (weeklyHoursTarget / 5) || 7;
    
    let weeklyProgressPercentage = 0;
    if (weeklyHoursTarget > 0 && weeklyStats?.totalHours) {
      weeklyProgressPercentage = Math.min(100, (weeklyStats.totalHours / weeklyHoursTarget) * 100);
    } else if (weeklyHoursTarget === 0 && weeklyStats?.totalHours > 0) {
      weeklyProgressPercentage = 100; // Show as 100% if target is 0 but hours worked
    }

    const timeRemainingWeekly = weeklyHoursTarget - (weeklyStats?.totalHours || 0);
    const isOvertimeWeekly = timeRemainingWeekly < 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"> {/* Adjusted to 3 cols for this example */}
        <StatsCard
          title="Aujourd'hui"
          value={formatHours(todayWorkedHours)}
          change={todayStatus.isPresent ? `En cours: ${formatHours(currentWorkingTime)}` : getStatusDisplay().text}
          trend={todayWorkedHours > dailyHoursTarget ? 'positive' : 'neutral'}
          icon={<Clock className="w-6 h-6" />}
        />

        <StatsCard
          title="Cette Semaine"
          value={formatHours(weeklyStats?.totalHours || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
        >
          {weeklyHoursTarget > 0 && (
            <>
              <div className="text-sm text-gray-500 mt-1">
                Objectif: {formatHours(weeklyHoursTarget)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${weeklyProgressPercentage}%` }}
                ></div>
              </div>
              <div className={`text-sm mt-1 ${isOvertimeWeekly ? 'text-red-500' : 'text-green-500'}`}>
                {isOvertimeWeekly 
                  ? `Dépassement: ${formatHours(Math.abs(timeRemainingWeekly))}` 
                  : `Restant: ${formatHours(timeRemainingWeekly)}`}
              </div>
            </>
          )}
          {weeklyHoursTarget === 0 && <div className="text-sm text-gray-500 mt-1">Aucun objectif hebdo. défini</div>}
        </StatsCard>
        
        <StatsCard
          title="Ce Mois"
          value={formatHours(monthlyStats?.totalHours || 0)}
          change={`${monthlyStats?.workingDays || 0} jours travaillés`}
          icon={<Calendar className="w-6 h-6" />}
        />

        {/* Removed Tâches en cours & Tâches terminées from here to simplify focus on time stats */}
        {/* Kept "Aujourd'hui" and "Moy. / Jour (Semaine)" */}
         <StatsCard
          title="Moy. / Jour (Semaine)"
          value={formatHours(weeklyStats?.averageHoursPerDay || 0)}
          change={`${weeklyStats?.workingDays || 0} jours travaillés`}
          icon={<Activity className="w-6 h-6" />}
        />
      </div>
    );
  };

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

  const renderTasksList = () => {
    const tasksToDisplay = userTasks.slice(0, 5); // Limiting to 5 for brevity in dashboard

    return (
      <Card 
        title="Mes Tâches Actives"
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Mes Tâches ({userTasks.filter(t => t.status === 'in_progress' || t.status === 'todo').length})
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={taskModal.openModal}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        }
      >
        <div className="space-y-3 max-h-96 overflow-y-auto"> {/* Increased max-h */}
          {tasksToDisplay.length > 0 ? (
            tasksToDisplay.map((task) => {
              const timeSpent = getTimeSpentPerTask(task.id); // From timeStore
              const estimatedTime = parseFloat(task.estimated_time) || 0; // from projectStore (ensure it's a number)
              const progressTaskTime = estimatedTime > 0 ? Math.min(100, (timeSpent / estimatedTime) * 100) : 0;

              return (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{task.name || task.title}</p> {/* task.name from DB */}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTaskPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {task.description || 'Pas de description'}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {task.due_date && (
                      <span>Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')} | </span>
                    )}
                    <span>Statut: {task.status === 'todo' ? 'À faire' : task.status === 'in_progress' ? 'En cours' : 'Terminé'}</span>
                  </div>
                  
                  {/* Time tracking for task */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Temps passé: {formatHours(timeSpent)}</span>
                      {estimatedTime > 0 && (
                        <span>Estimé: {formatHours(estimatedTime)}</span>
                      )}
                    </div>
                    {estimatedTime > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${progressTaskTime}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune tâche assignée pour le moment.</p>
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

  const renderWeeklyOverview = () => {
    // weeklyStats.entries should contain processed day entries for the week
    const weekDisplayEntries = weeklyStats?.entries || [];

    return (
      <Card title="Vue hebdomadaire" className="h-80">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {weekDisplayEntries.length > 0 ? weekDisplayEntries.map((entry, index) => (
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
          )) : (
            <p className="text-center text-gray-500 py-4">Aucune donnée pour cette semaine.</p>
          )}
        </div>
      </Card>
    );
  };

  // --- Logic for Custom Period Report ---
  const handleGenerateReport = async () => {
    if (!customStartDate || !customEndDate) {
      alert("Veuillez sélectionner une date de début et de fin.");
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert("La date de début ne peut pas être après la date de fin.");
      return;
    }
    setCurrentReportPeriodLabel(`du ${customStartDate} au ${customEndDate}`);
    await fetchEntriesForPeriod(user.id, customStartDate, customEndDate);
    setReportView(true);
  };
  
  const setPresetPeriod = (period) => {
    const today = new Date();
    let start, end;
    end = today.toISOString().split('T')[0]; // today

    if (period === 'lastWeek') {
      const startDate = new Date(today.setDate(today.getDate() - 7 - today.getDay() + 1)); // Start of last week (Monday)
      const endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6)); // End of last week (Sunday)
      setCustomStartDate(startDate.toISOString().split('T')[0]);
      setCustomEndDate(endDate.toISOString().split('T')[0]);
      setCurrentReportPeriodLabel("Semaine dernière");
    } else if (period === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setCustomStartDate(lastMonth.toISOString().split('T')[0]);
      setCustomEndDate(endOfLastMonth.toISOString().split('T')[0]);
      setCurrentReportPeriodLabel("Mois dernier");
    }
  };

  const renderReportSection = () => {
    if (!reportView) return null;

    // Calculate expected hours for the custom period
    // This would ideally use user's specific daily targets if available, or a default (e.g. 7h/day for working days)
    let expectedPeriodHours = 0;
    if (customStartDate && customEndDate && reportEntries.length > 0) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        let current = start;
        while(current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                 expectedPeriodHours += (contractualWeeklyHours / 5) || 7; // Distribute weekly target or use 7
            }
            current.setDate(current.getDate() + 1);
        }
    }
    const timeDiffPeriod = reportStats.totalWorkingHours - expectedPeriodHours;

    return (
      <Card 
        title={`Rapport d'Activité ${currentReportPeriodLabel ? ` (${currentReportPeriodLabel})` : ''}`} 
        className="mt-6"
        headerActions={<Button variant="outline" size="sm" onClick={() => setReportView(false)}>Fermer</Button>}
      >
        {reportLoading && <p>Chargement du rapport...</p>}
        {!reportLoading && reportEntries.length === 0 && <p>Aucune donnée pour cette période.</p>}
        {!reportLoading && reportEntries.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <StatsCard title="Total Heures Travaillées" value={formatHours(reportStats.totalWorkingHours)} icon={<Clock />} />
              <StatsCard title="Total Pauses" value={formatHours(reportStats.totalBreakHours)} icon={<Coffee />} />
              <StatsCard title="Jours Travaillés" value={`${reportStats.workingDays} jours`} icon={<Calendar />} />
              {expectedPeriodHours > 0 && (
                <StatsCard 
                  title="Objectif Période" 
                  value={formatHours(expectedPeriodHours)}
                  change={timeDiffPeriod >= 0 ? `+ ${formatHours(timeDiffPeriod)}` : `- ${formatHours(Math.abs(timeDiffPeriod))}`}
                  trend={timeDiffPeriod >=0 ? "positive" : "negative"}
                  icon={<Target />} 
                />
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pause</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures Trav.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportEntries.map(entry => (
                    <tr key={entry.date}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{entry.formattedDate} ({entry.dayName.substring(0,3)})</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{entry.arrival || '--:--'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{entry.departure || '--:--'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{entry.formattedBreakHours}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">{entry.formattedWorkingHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    );
  };


  if (timeLoading && !reportView) { // Show general loading only if not already viewing report (report has its own loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord - Animateur
          </h1>
          <p className="text-gray-600 mt-1">
            Bonjour {user?.first_name}, gérez votre temps et vos tâches
          </p>
        </div>
        
        {/* Period selector for dashboard stats - kept simple for now */}
        {/* 
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod} // This state is not currently used to filter dashboard stats
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
        */}
      </div>

      {/* Actions rapides */}
      {renderQuickActions()}

      {/* Statut actuel */}
      {renderCurrentStatus()}
      
      {/* Statistiques du tableau de bord (aujourd'hui, semaine, mois) */}
      {renderStatsCards()}

      {/* Section pour le rapport personnalisé */}
      <Card title="Générer un Rapport d'Activité" icon={<FileText className="w-5 h-5 mr-2 text-indigo-600" />}>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input 
                type="date" 
                id="startDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input 
                type="date" 
                id="endDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <Button onClick={handleGenerateReport} disabled={reportLoading} loading={reportLoading} className="w-full md:w-auto">
              Générer
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPresetPeriod('lastWeek')}>Sem. dernière</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetPeriod('lastMonth')}>Mois dernier</Button>
          </div>
        </div>
        {renderReportSection()}
      </Card>


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