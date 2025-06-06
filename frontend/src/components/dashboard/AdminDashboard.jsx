import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Building2, 
  UserPlus, 
  TrendingUp, 
  Activity, 
  Calendar,
  Search,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Settings,
  FileText
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { useAuthStore } from '../../stores/authStore';
import StatsCard from '../common/StatsCard';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import CreateUserForm from '../forms/CreateUserForm';
import CreateStructureForm from '../forms/CreateStructureForm';

// ===== CONSTANTES POUR PÉRIODES FIXES =====
const PERIOD_OPTIONS = [
  { value: 'current_week', label: 'Semaine en cours', description: 'Du lundi au dimanche' },
  { value: 'current_month', label: 'Mois en cours', description: 'Du 1er au dernier jour' },
  { value: 'current_year', label: 'Année en cours', description: 'De janvier à décembre' },
  { value: 'previous_week', label: 'Semaine précédente', description: 'La semaine passée' },
  { value: 'previous_month', label: 'Mois précédent', description: 'Le mois passé' },
  { value: 'last_7_days', label: '7 derniers jours', description: 'Période glissante' },
  { value: 'last_30_days', label: '30 derniers jours', description: 'Période glissante' }
];

const AdminDashboard = () => {
  // ===== STORES =====
  const { user } = useAuthStore();
  const {
    users,
    structures,
    stats,
    recentActivity,
    loading,
    error,
    fetchUsers,
    fetchStructures,
    fetchStats,
    fetchDashboardStats,
    fetchRecentActivity,
    updateUser,
    toggleUserStatus
  } = useAdminStore();

  // ===== ÉTATS LOCAUX =====
  
  // Période sélectionnée
  const [dateRange, setDateRange] = useState('current_week');
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(true);
  
  // Modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateStructureModal, setShowCreateStructureModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Affichage
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllStructures, setShowAllStructures] = useState(false);

  // ===== DONNÉES CALCULÉES =====
  
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.active).length;
  const totalStructures = structures.length;

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !userRoleFilter || user.role === userRoleFilter;
    
    const matchesStructure = !structureFilter || 
      user.structure_id?.toString() === structureFilter;
    
    const matchesActive = showInactiveUsers || user.active;
    
    return matchesSearch && matchesRole && matchesStructure && matchesActive;
  });

  // ===== FONCTIONS UTILITAIRES =====
  
  // Formatage du temps
  const formatTime = (dateTime) => {
    if (!dateTime) return '--:--';
    try {
      return new Date(dateTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  // Icône d'activité
  const getActivityIcon = (type) => {
    switch (type) {
      case 'arrival': return '🟢';
      case 'departure': return '🔴';
      case 'break_start': return '⏸️';
      case 'break_end': return '▶️';
      default: return '📝';
    }
  };

  // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
  
  // Changement de période avec support des périodes fixes
  const handleDateRangeChange = useCallback(
    async (period) => {
      console.log('📅 Changement de période vers:', period);
      setDateRange(period);
      
      try {
        // Calculer les dates selon la période sélectionnée
        let startDate = null;
        let endDate = null;
        let days = null;
        
        const today = new Date();
        
        switch (period) {
          case 'current_week':
            // Semaine en cours (Lundi à Dimanche)
            const currentDay = today.getDay();
            const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
            
            const monday = new Date(today);
            monday.setDate(today.getDate() - daysFromMonday);
            startDate = monday.toISOString().split('T')[0];
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            endDate = sunday.toISOString().split('T')[0];
            break;
            
          case 'current_month':
            // Mois en cours (1er au dernier jour)
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = firstDay.toISOString().split('T')[0];
            
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate = lastDay.toISOString().split('T')[0];
            break;
            
          case 'current_year':
            // Année en cours (Janvier à Décembre)
            const firstDayYear = new Date(today.getFullYear(), 0, 1);
            startDate = firstDayYear.toISOString().split('T')[0];
            
            const lastDayYear = new Date(today.getFullYear(), 11, 31);
            endDate = lastDayYear.toISOString().split('T')[0];
            break;
            
          case 'previous_week':
            // Semaine précédente
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            
            const lastWeekDay = lastWeek.getDay();
            const daysFromMondayLastWeek = lastWeekDay === 0 ? 6 : lastWeekDay - 1;
            
            const mondayLastWeek = new Date(lastWeek);
            mondayLastWeek.setDate(lastWeek.getDate() - daysFromMondayLastWeek);
            startDate = mondayLastWeek.toISOString().split('T')[0];
            
            const sundayLastWeek = new Date(mondayLastWeek);
            sundayLastWeek.setDate(mondayLastWeek.getDate() + 6);
            endDate = sundayLastWeek.toISOString().split('T')[0];
            break;
            
          case 'previous_month':
            // Mois précédent
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const firstDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
            startDate = firstDayLastMonth.toISOString().split('T')[0];
            
            const lastDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
            endDate = lastDayLastMonth.toISOString().split('T')[0];
            break;
            
          case 'last_7_days':
            // 7 derniers jours (période glissante)
            days = 7;
            break;
            
          case 'last_30_days':
            // 30 derniers jours (période glissante)
            days = 30;
            break;
            
          default:
            // Par défaut: semaine en cours
            days = 7;
            break;
        }
        
        console.log('🗓️ Période calculée:', { period, startDate, endDate, days });
        
        // Appeler les fonctions avec les nouvelles périodes
        await Promise.all([
          fetchStats(days, startDate, endDate),
          fetchDashboardStats(days, startDate, endDate),
          fetchRecentActivity(10, days || 1, startDate, endDate)
        ]);
        
        console.log('✅ Statistiques mises à jour pour la période:', period);
        
      } catch (error) {
        console.error('❌ Erreur lors du changement de période:', error);
      }
    },
    [fetchStats, fetchDashboardStats, fetchRecentActivity]
  );

  // Gestion des utilisateurs
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUserUpdated = async () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    await fetchUsers();
  };

  const handleUserCreated = async () => {
    setShowCreateUserModal(false);
    await fetchUsers();
  };

  const handleStructureCreated = async () => {
    setShowCreateStructureModal(false);
    await fetchStructures();
  };

  // ===== EFFETS =====
  
  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchStructures(),
          fetchStats(),
          fetchDashboardStats(),
          fetchRecentActivity(10, 1)
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
      }
    };

    loadData();
  }, [fetchUsers, fetchStructures, fetchStats, fetchDashboardStats, fetchRecentActivity]);

  // ===== COMPOSANTS DE RENDU =====
  
  // En-tête avec sélecteur de période
  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de Bord Admin
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble et gestion globale du système
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Cartes de statistiques avec nouvelles périodes
  const renderStatsCards = () => {
    // Obtenir le libellé de la période sélectionnée
    const selectedPeriod = PERIOD_OPTIONS.find(p => p.value === dateRange);
    const periodLabel = selectedPeriod?.label || 'cette période';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Utilisateurs Totaux"
          value={totalUsers}
          change={`${activeUsers} actifs`}
          trend="positive"
          icon={<Users className="w-6 h-6" />}
        />

        <StatsCard
          title="Structures"
          value={totalStructures}
          change="centres actifs"
          trend="neutral"
          icon={<Building2 className="w-6 h-6" />}
        />

        <StatsCard
          title={`Nouveaux Utilisateurs`}
          value={stats.newUsersThisWeek || stats.new_users_period || 0}
          change={periodLabel}
          trend="positive"
          icon={<UserPlus className="w-6 h-6" />}
        />

        <StatsCard
          title={`Nouvelles Structures`}
          value={stats.newStructuresThisWeek || stats.new_structures_period || 0}
          change={periodLabel}
          trend="positive"
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>
    );
  };

  // Fil d'activité
  const renderActivityFeed = () => (
    <Card title="Activité Récente" className="h-96">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-lg mr-3">
                {getActivityIcon(activity.tracking_type)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user?.first_name} {activity.user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.tracking_type === "arrival" && "Arrivée"}
                  {activity.tracking_type === "departure" && "Départ"}
                  {activity.tracking_type === "break_start" && "Début de pause"}
                  {activity.tracking_type === "break_end" && "Fin de pause"}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {formatTime(activity.date_time)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </Card>
  );

  // Gestion des utilisateurs
  const renderUsersManagement = () => (
    <Card
      title="Gestion des Utilisateurs"
      header={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Utilisateurs ({filteredUsers.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="shrink-0"
            >
              {showAllUsers ? "Réduire" : "Voir tout"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              onClick={() => setShowCreateUserModal(true)}
              size="sm"
              className="shrink-0"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>

            <div className="flex-1 min-w-0">
              <Input
                placeholder="Rechercher utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto sm:min-w-[140px]">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="director">Directeur</option>
                <option value="animator">Animateur</option>
              </select>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[160px]">
              <select
                value={structureFilter}
                onChange={(e) => setStructureFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les structures</option>
                {structures.map((structure) => (
                  <option key={structure.id} value={structure.id.toString()}>
                    {structure.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowInactiveUsers(!showInactiveUsers)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showInactiveUsers
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              title={showInactiveUsers ? "Masquer les inactifs" : "Afficher tous"}
            >
              {showInactiveUsers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredUsers
          .slice(0, showAllUsers ? filteredUsers.length : 8)
          .map((user) => (
            <div
              key={user.id}
              className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 ${
                !user.active ? "opacity-60 bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${
                    user.active ? "bg-gray-200" : "bg-gray-300"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 ${
                      user.active ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium truncate ${
                      user.active ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {user.first_name} {user.last_name}
                    {!user.active && (
                      <span className="ml-2 text-xs text-red-500">
                        (Inactif)
                      </span>
                    )}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      user.active ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {user.email}
                  </p>
                  {user.structure && (
                    <p className="text-xs text-gray-400 truncate">
                      📍 {user.structure.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                  title="Modifier l'utilisateur"
                >
                  ✏️ Modifier
                </button>

                <span
                  className={`
                    px-2 py-1 text-xs rounded-full font-medium
                    ${user.role === "admin" ? "bg-red-100 text-red-800" : ""}
                    ${user.role === "director" ? "bg-blue-100 text-blue-800" : ""}
                    ${user.role === "animator" ? "bg-green-100 text-green-800" : ""}
                    ${!user.active ? "opacity-50" : ""}
                  `}
                >
                  {user.role === "admin" && "Admin"}
                  {user.role === "director" && "Directeur"}
                  {user.role === "animator" && "Animateur"}
                </span>

                <button
                  onClick={async () => {
                    try {
                      const result = await toggleUserStatus(user.id, !user.active);
                      if (result.success) {
                        await fetchUsers();
                      }
                    } catch (error) {
                      console.error('Erreur toggle user:', error);
                    }
                  }}
                  className={`
                    px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-lg transform hover:scale-105
                    ${user.active 
                      ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 focus:ring-green-500' 
                      : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 focus:ring-red-500'
                    }
                  `}
                  title={
                    user.active
                      ? "Désactiver l'utilisateur"
                      : "Activer l'utilisateur"
                  }
                >
                  {user.active ? '🟢 Actif' : '🔴 Inactif'}
                </button>

                <div
                  className={`w-2 h-2 rounded-full ${
                    user.active ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              </div>
            </div>
          ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}
    </Card>
  );

  // Gestion des structures
  const renderStructuresManagement = () => (
    <Card
      title="Gestion des Structures"
      header={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Structures ({totalStructures})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllStructures(!showAllStructures)}
              className="shrink-0"
            >
              {showAllStructures ? "Réduire" : "Voir tout"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              onClick={() => setShowCreateStructureModal(true)}
              size="sm"
              className="shrink-0"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Nouvelle structure
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {structures
          .slice(0, showAllStructures ? structures.length : 6)
          .map((structure) => (
            <div
              key={structure.id}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {structure.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {structure.city}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {structure.users?.length || 0} utilisateur(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                <button
                  disabled
                  className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
                  title="Édition bientôt disponible"
                >
                  ✏️ Modifier
                </button>

                <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                  Zone {structure.school_vacation_zone}
                </span>

                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>
          ))}
      </div>

      {structures.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune structure trouvée</p>
        </div>
      )}
    </Card>
  );

  // Rendu principal complet
  const renderContent = () => {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderStatsCards()}
        
        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderUsersManagement()}
          {renderStructuresManagement()}
        </div>
        
        {/* Activité récente en pleine largeur */}
        <div className="grid grid-cols-1 gap-6">
          {renderActivityFeed()}
        </div>

        {/* Modals */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateUserForm
                onSuccess={handleUserCreated}
                onCancel={() => setShowCreateUserModal(false)}
              />
            </div>
          </div>
        )}

        {showCreateStructureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateStructureForm
                onSuccess={handleStructureCreated}
                onCancel={() => setShowCreateStructureModal(false)}
              />
            </div>
          </div>
        )}

        {/* Modal d'édition utilisateur */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateUserForm
                initialData={selectedUser}
                onSuccess={handleUserUpdated}
                onCancel={() => setShowEditUserModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Affichage avec gestion du loading et des erreurs
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Activity className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return renderContent();
};

export default AdminDashboard;