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
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useTimeStore } from '../../stores/timeStore';
import Card from '../common/Card';
import StatsCard from '../common/StatsCard';
import Button from '../common/Button';
import Input from '../common/Input';

const DirectorDashboard = () => {
  const { user } = useAuthStore();
  const { 
    users = [], 
    structures = [], 
    loading: adminLoading,
    fetchUsers,
    fetchStructures,
    toggleUserStatus 
  } = useAdminStore();
  
  const { 
    todayEntries = [], 
    loading: timeLoading,
    fetchTodayEntries 
  } = useTimeStore();

  const [dateRange, setDateRange] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAnimators, setShowAllAnimators] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [recentActivityLimit, setRecentActivityLimit] = useState(30);

  // Chargement des données
const loadData = useCallback(async () => {
    try {
      if (fetchUsers) await fetchUsers();
      if (fetchStructures) await fetchStructures();
      if (fetchTodayEntries) await fetchTodayEntries();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [fetchUsers, fetchStructures, fetchTodayEntries]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

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

    // Filtrage des animateurs avec recherche
  const filteredAnimators = myStructureAnimators.filter(animator => {
    const matchesSearch = 
      (animator.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalAnimators = myStructureAnimators.length;
  const activeAnimators = myStructureAnimators.filter(a => a?.active).length;
  
  // Activité récente étendue (30 dernières activités)
  const recentActivity = todayEntries
    .filter(entry => {
      const entryUser = myStructureAnimators.find(u => u?.id === entry?.user_id);
      return entryUser !== undefined;
    })
    .slice(0, recentActivityLimit)
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));


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
 // liste des animateurs avec recherche et toggle
const renderAnimatorsList = () => (
    <Card
      title="Gestion de Mon Équipe d'Animateurs"
      header={
        <div className="space-y-4">
          {/* Titre avec compteur */}
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

          {/* Barre de recherche */}
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
  {/* Badge de rôle */}
  <span className={`px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 ${
    !animator.active ? "opacity-50" : ""
  }`}>
    Animateur
  </span>

                  {/* Bouton toggle statut */}
<button
  onClick={async () => {
    try {
      const result = await toggleUserStatus(animator.id, !animator.active);
      
      if (result.success) {
        console.log(`✅ Animateur ${animator.first_name} ${!animator.active ? 'activé' : 'désactivé'}`);
        // Pas besoin de recharger manuellement, le store se met à jour automatiquement
      } else {
        console.error('Erreur toggle:', result.error);
      }
    } catch (error) {
      console.error('Erreur toggle:', error);
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
  // activité récente avec "voir tout"
  const renderRecentActivity = () => (
    <Card 
      title="Activité Récente de l'Équipe"
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Activité Récente ({recentActivity.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllActivity(!showAllActivity)}
              className="shrink-0"
            >
              {showAllActivity ? "Réduire" : "Voir tout"}
            </Button>
          </div>
        </div>
      }
      className="mb-6"
    >
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivity
          .slice(0, showAllActivity ? recentActivity.length : 5)
          .length > 0 ? (
          recentActivity
            .slice(0, showAllActivity ? recentActivity.length : 5)
            .map((entry, index) => {
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

              const getActionIcon = (type) => {
                const icons = {
                  arrival: '🟢',
                  departure: '🔴',
                  break_start: '⏸️',
                  break_end: '▶️'
                };
                return icons[type] || '⚪';
              };

              return (
                <div key={`${entry.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">
                      {getActionIcon(entry.tracking_type)}
                    </span>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-medium">
                        {animator?.first_name?.charAt(0)}{animator?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {animator?.first_name} {animator?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getActionText(entry.tracking_type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-400">
                      {new Date(entry.date_time).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(entry.date_time).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
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