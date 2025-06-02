import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Activity,
  Building,
  FileText,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useTimeStore } from '../../stores/timeStore';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';

const DirectorDashboard = () => {
  const { user } = useAuthStore();
  const { 
    users = [], 
    structures = [], 
    loading: adminLoading,
    fetchUsers,
    fetchStructures 
  } = useAdminStore();
  
  const { 
    todayEntries = [], 
    loading: timeLoading,
    fetchTodayEntries 
  } = useTimeStore();

  const [dateRange, setDateRange] = useState('7');

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        if (fetchUsers) await fetchUsers();
        if (fetchStructures) await fetchStructures();
        if (fetchTodayEntries) await fetchTodayEntries();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, fetchUsers, fetchStructures, fetchTodayEntries]);

  // Guard clause - Attendre que les données soient chargées
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

  // Calculs sécurisés (après le guard)
  const myStructureAnimators = users.filter(u => 
    u && 
    u.role === 'animator' && 
    u.structure_id === user.structure_id
  );

  const myStructure = structures.find(s => 
    s && s.id === user.structure_id
  );

  const totalAnimators = myStructureAnimators.length;
  const activeAnimators = myStructureAnimators.filter(a => a?.active).length;
  
  const recentActivity = todayEntries
    .filter(entry => {
      const entryUser = myStructureAnimators.find(u => u?.id === entry?.user_id);
      return entryUser !== undefined;
    })
    .slice(0, 10);

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord - Directeur
        </h1>
        <p className="text-gray-600 mt-1">
          Structure : {myStructure?.name || 'Non définie'}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="1">Aujourd'hui</option>
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
        </select>
      </div>
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
        title="Ma Structure"
        value={myStructure?.name || 'Non définie'}
        change="Structure assignée"
        trend="neutral"
        icon={<Building className="w-6 h-6" />}
      />

      <StatsCard
        title="Activité Aujourd'hui"
        value={recentActivity.length}
        change="pointages"
        trend="positive"
        icon={<Activity className="w-6 h-6" />}
      />

      <StatsCard
        title="Mes Horaires"
        value="--"
        change="À développer"
        trend="neutral"
        icon={<Clock className="w-6 h-6" />}
      />
    </div>
  );

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card clickable hoverable className="p-4">
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

      <Card clickable hoverable className="p-4">
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

  const renderAnimatorsList = () => (
    <Card title="Mon Équipe d'Animateurs" className="mb-6">
      <div className="space-y-3">
        {myStructureAnimators.length > 0 ? (
          myStructureAnimators.map((animator) => (
            <div key={animator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {animator.first_name?.charAt(0)}{animator.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {animator.first_name} {animator.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {animator.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  animator.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {animator.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun animateur dans votre structure</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card title="Activité Récente de l'Équipe" className="mb-6">
      <div className="space-y-3">
        {recentActivity.length > 0 ? (
          recentActivity.map((entry, index) => {
            const animator = myStructureAnimators.find(u => u.id === entry.user_id);
            const getActionText = (type) => {
              const actions = {
                arrival: 'Arrivée',
                departure: 'Départ',
                break_start: 'Début de pause',
                break_end: 'Fin de pause'
              };
              return actions[type] || type;
            };

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {animator?.first_name?.charAt(0)}{animator?.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {animator?.first_name} {animator?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getActionText(entry.tracking_type)}
                    </p>
                  </div>
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
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderQuickActions()}
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {renderAnimatorsList()}
        </div>
        <div>
          {renderRecentActivity()}
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;