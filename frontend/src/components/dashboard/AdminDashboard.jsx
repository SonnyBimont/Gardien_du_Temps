import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Building, 
  Activity, 
  Clock, 
  BarChart3,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { useTimeStore } from '../../stores/timeStore';
import Button from '../common/Button';
import Card, { StatsCard } from '../common/Card';
import CreateUserForm from '../forms/CreateUserForm';
import CreateStructureForm from '../forms/CreateStructureForm';
import Modal, { useModal } from '../common/Modal';
import Input from '../common/Input';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7'); // 7 derniers jours
  const [selectedMetric, setSelectedMetric] = useState('users');
  
  const userModal = useModal();
  const structureModal = useModal();
  
  const { 
    users = [], 
    fetchUsers, 
    structures= [], 
    fetchStructures, 
    stats = {},
    fetchStats,
    fetchDashboardStats,
    fetchRecentActivity,
    loading 
  } = useAdminStore();
  
  const { entries = [], fetchAllEntries } = useTimeStore();

// Mémoiser la fonction de chargement
  const loadData = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchUsers().catch(err => console.error('Erreur users:', err)),
        fetchStructures().catch(err => console.error('Erreur structures:', err)),
        fetchStats?.(dateRange).catch(err => console.error('Erreur stats:', err)),
        fetchDashboardStats?.().catch(err => console.error('Erreur dashboard stats:', err)),
        fetchRecentActivity?.(10).catch(err => console.error('Erreur activity:', err)),
      ]);
    } catch (error) {
      console.error('Erreur générale:', error);
    }
  }, [dateRange, fetchUsers, fetchStructures, fetchStats, fetchDashboardStats, fetchRecentActivity]);

  // useEffect simplifié
  useEffect(() => {
    loadData();
  }, [loadData]);


  // Fonction pour rafraîchir après création
  const handleUserCreated = useCallback(() => {
    userModal.closeModal();
    loadData(); // Recharger les données
  }, [userModal, loadData]);

  const handleStructureCreated = useCallback(() => {
    structureModal.closeModal();
    loadData(); // Recharger les données
  }, [structureModal, loadData]);


  // Calculs des statistiques
  const totalUsers = (users || []).length;
  const activeUsers = (users || []).filter(u => u.active).length;
  const totalStructures = (structures || []).length;
  const directors = (users || []).filter(u => u.role === 'director').length;
  const animators = (users || []).filter(u => u.role === 'animator').length;
  
  // Statistiques d'activité récente
  const recentActivity = (entries || [])
    .slice(0, 10)
    .map(entry => ({
      ...entry,
      user: (users || []).find(u => u.id === entry.user_id)
    }))
    .filter(entry => entry.user);

  // Utilisateurs filtés pour la recherche
  const filteredUsers = (users || []).filter(user =>
    (user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const getActivityIcon = (type) => {
    const icons = {
      arrival: '🟢',
      departure: '🔴',
      break_start: '⏸️',
      break_end: '▶️'
    };
    return icons[type] || '⚪';
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card clickable onClick={userModal.openModal} hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Créer</p>
            <p className="text-lg font-semibold text-gray-900">Utilisateur</p>
          </div>
        </div>
      </Card>

      <Card clickable onClick={structureModal.openModal} hoverable className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Créer</p>
            <p className="text-lg font-semibold text-gray-900">Structure</p>
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
            <p className="text-sm font-medium text-gray-600">Système</p>
            <p className="text-lg font-semibold text-gray-900">Paramètres</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Total Utilisateurs"
        value={totalUsers}
        change={`${activeUsers} actifs`}
        trend="positive"
        icon={<Users className="w-6 h-6" />}
      />

      <StatsCard
        title="Structures"
        value={totalStructures}
        change="+2 ce mois"
        trend="positive"
        icon={<Building className="w-6 h-6" />}
      />

      <StatsCard
        title="Directeurs"
        value={directors}
        change={`${animators} animateurs`}
        trend="neutral"
        icon={<Activity className="w-6 h-6" />}
      />

      <StatsCard
        title="Activité Aujourd'hui"
        value={(entries || []).filter(e => {
          try {
            return new Date(e.date_time).toDateString() === new Date().toDateString()
          } catch {
            return false;
          }
        }).length}
        change="pointages"
        trend="positive"
        icon={<Clock className="w-6 h-6" />}
      />
    </div>
  );

  const renderActivityFeed = () => (
    <Card title="Activité Récente" className="h-96">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-lg mr-3">
                {getActivityIcon(activity.tracking_type)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user?.first_name} {activity.user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.tracking_type === 'arrival' && 'Arrivée'}
                  {activity.tracking_type === 'departure' && 'Départ'}
                  {activity.tracking_type === 'break_start' && 'Début de pause'}
                  {activity.tracking_type === 'break_end' && 'Fin de pause'}
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

  const renderUsersManagement = () => (
    <Card 
      title="Gestion des Utilisateurs"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Utilisateurs ({filteredUsers.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-64"
            />
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredUsers.slice(0, 8).map((user) => (
          <div key={user.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`
                px-2 py-1 text-xs rounded-full font-medium
                ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
                ${user.role === 'director' ? 'bg-blue-100 text-blue-800' : ''}
                ${user.role === 'animator' ? 'bg-green-100 text-green-800' : ''}
              `}>
                {user.role === 'admin' && 'Admin'}
                {user.role === 'director' && 'Directeur'}
                {user.role === 'animator' && 'Animateur'}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                user.active ? 'bg-green-400' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>
      
      {filteredUsers.length > 8 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            Voir tous les utilisateurs
          </Button>
        </div>
      )}
    </Card>
  );

  const renderStructuresOverview = () => (
    <Card title="Structures" className="h-96">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {structures.length > 0 ? (
          structures.map((structure) => (
            <div key={structure.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{structure.name}</p>
                  <p className="text-sm text-gray-500">{structure.address}</p>
                  <p className="text-sm text-gray-500">{structure.city}</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {structure.type}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Users className="w-3 h-3 mr-1" />
                {users.filter(u => u.structure_id === structure.id).length} utilisateurs
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune structure créée</p>
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
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
            Tableau de bord - Administrateur
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble du système et gestion globale
          </p>
        </div>
        
        {/* Contrôles de période */}
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1">Aujourd'hui</option>
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Actions rapides */}
      {renderQuickActions()}
      
      {/* Statistiques */}
      {renderStatsCards()}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <div className="lg:col-span-1">
          {renderActivityFeed()}
        </div>
        
        {/* Gestion des utilisateurs */}
        <div className="lg:col-span-1">
          {renderUsersManagement()}
        </div>
        
        {/* Structures */}
        <div className="lg:col-span-1">
          {renderStructuresOverview()}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        title="Créer un utilisateur"
        size="lg"
      >
        <CreateUserForm onSuccess={handleUserCreated} />
      </Modal>

      <Modal
        isOpen={structureModal.isOpen}
        onClose={structureModal.closeModal}
        title="Créer une structure"
        size="lg"
      >
        <CreateStructureForm onSuccess={handleStructureCreated} />
      </Modal>
    </div>
  );
};

export default AdminDashboard;