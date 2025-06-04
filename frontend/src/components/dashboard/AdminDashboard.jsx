import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building,
  Activity,
  Clock,
  BarChart3,
  Settings,
  Search,
  Filter,
} from "lucide-react";
import { useAdminStore } from "../../stores/adminStore";
import { useTimeStore } from "../../stores/timeStore";
import Button from "../common/Button";
import Card, { StatsCard } from "../common/Card";
import CreateUserForm from "../forms/CreateUserForm";
import CreateStructureForm from "../forms/CreateStructureForm";
import Modal, { useModal } from "../common/Modal";
import Input from "../common/Input";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [structureSearchTerm, setStructureSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7");
  const [selectedMetric, setSelectedMetric] = useState("users");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [structureFilter, setStructureFilter] = useState("");
  const [structureFilterType, setStructureFilterType] = useState("zone"); // 'zone' ou 'city'
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllStructures, setShowAllStructures] = useState(false);

  const userModal = useModal();
  const structureModal = useModal();

  const {
    users = [],
    fetchUsers,
    structures = [],
    fetchStructures,
    stats = {},
    fetchStats,
    fetchDashboardStats,
    fetchRecentActivity,
    toggleUserStatus,
    loading,
  } = useAdminStore();

  const { entries = [], fetchAllEntries } = useTimeStore();

  // Mémoiser la fonction de chargement
  // Remplace loadData par :
  const loadData = useCallback(
    async (includeStats = true) => {
      console.log("🔄 Chargement des données, includeStats:", includeStats);

      try {
        const promises = [
          fetchUsers().catch((err) => console.error("Erreur users:", err)),
          fetchStructures().catch((err) =>
            console.error("Erreur structures:", err)
          ),
        ];

        // Charger les stats SEULEMENT au premier chargement ou si demandé explicitement
        if (includeStats) {
          promises.push(
            fetchStats?.(dateRange).catch((err) =>
              console.error("Erreur stats:", err)
            ),
            fetchDashboardStats?.().catch((err) =>
              console.error("Erreur dashboard stats:", err)
            ),
            fetchRecentActivity?.(10).catch((err) =>
              console.error("Erreur activity:", err)
            )
          );
        }

        await Promise.allSettled(promises);
        console.log("✅ Données chargées");
      } catch (error) {
        console.error("❌ Erreur générale:", error);
      }
    },
    [
      fetchUsers,
      fetchStructures,
      fetchStats,
      fetchDashboardStats,
      fetchRecentActivity,
      dateRange,
    ]
  );

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
  const activeUsers = (users || []).filter((u) => u.active).length;
  const totalStructures = (structures || []).length;
  const directors = (users || []).filter((u) => u.role === "director").length;
  const animators = (users || []).filter((u) => u.role === "animator").length;

  // Statistiques d'activité récente
  const recentActivity = (entries || [])
    .slice(0, 10)
    .map((entry) => ({
      ...entry,
      user: (users || []).find((u) => u.id === entry.user_id),
    }))
    .filter((entry) => entry.user);

  // Utilisateurs filtrés pour la recherche ET le filtre par rôle
  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      (user.first_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !userRoleFilter || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Structures filtrées pour la recherche ET le filtre
  const filteredStructures = (structures || []).filter((structure) => {
    const matchesSearch =
      (structure.name || "")
        .toLowerCase()
        .includes(structureSearchTerm.toLowerCase()) ||
      (structure.city || "")
        .toLowerCase()
        .includes(structureSearchTerm.toLowerCase()) ||
      (structure.address || "")
        .toLowerCase()
        .includes(structureSearchTerm.toLowerCase());

    let matchesFilter = true;
    if (structureFilter) {
      if (structureFilterType === "zone") {
        matchesFilter = structure.school_vacation_zone === structureFilter;
      } else if (structureFilterType === "city") {
        matchesFilter = (structure.city || "")
          .toLowerCase()
          .includes(structureFilter.toLowerCase());
      }
    }

    return matchesSearch && matchesFilter;
  });

  // Gestion du changement de période
  const handleDateRangeChange = useCallback(
    async (range) => {
      console.log("🔄 Changement de période vers:", range);
      setDateRange(range);

      try {
        // Appeler les DEUX fonctions avec le bon paramètre
        await Promise.all([fetchStats?.(range), fetchDashboardStats?.(range)]);
        console.log("✅ Stats rechargées pour la période:", range);
      } catch (error) {
        console.error("❌ Erreur lors du rechargement des stats:", error);
      }
    },
    [fetchStats, fetchDashboardStats]
  );
  // Fonction pour obtenir l'icône d'activité
  const getActivityIcon = (type) => {
    const icons = {
      arrival: "🟢",
      departure: "🔴",
      break_start: "⏸️",
      break_end: "▶️",
    };
    return icons[type] || "⚪";
  };

  // Fonction pour formater l'heure
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Rendu des actions rapides
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

      <Card
        clickable
        onClick={structureModal.openModal}
        hoverable
        className="p-4"
      >
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
          <div className="p-3 bg-orange-100 rounded-lg">
            <Settings className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Système</p>
            <p className="text-lg font-semibold text-gray-900">Paramètres</p>
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
    </div>
  );
  // Rendu des cartes de statistiques
  const renderStatsCards = () => {
    console.log("🎨 Rendu des stats:", {
      dateRange,
      stats,
      newUsersThisWeek: stats.newUsersThisWeek,
      newStructuresThisWeek: stats.newStructuresThisWeek,
      connectionsToday: stats.connectionsToday,
    });

    return (
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
          change={`+${stats.newStructuresThisWeek || 0} ${
            dateRange === "1"
              ? "aujourd'hui"
              : dateRange === "7"
              ? "cette semaine"
              : dateRange === "30"
              ? "ce mois"
              : "cette période"
          }`}
          trend={stats.newStructuresThisWeek > 0 ? "positive" : "neutral"}
          icon={<Building className="w-6 h-6" />}
        />

        <StatsCard
          title="Nouveaux Utilisateurs"
          value={stats.newUsersThisWeek || 0}
          change={`${
            dateRange === "1"
              ? "aujourd'hui"
              : dateRange === "7"
              ? "cette semaine"
              : dateRange === "30"
              ? "ce mois"
              : "cette période"
          }`}
          trend={stats.newUsersThisWeek > 0 ? "positive" : "neutral"}
          icon={<Activity className="w-6 h-6" />}
        />

        <StatsCard
          title="Connexions"
          value={stats.connectionsToday || 0}
          change={stats.connectionsChange || "Aucune donnée"}
          trend="positive"
          icon={<Clock className="w-6 h-6" />}
        />
      </div>
    );
  };
  // Rendu du fil d'activité
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
  // Rendu de la gestion des utilisateurs
  const renderUsersManagement = () => (
    <Card
      title="Gestion des Utilisateurs"
      header={
        <div className="space-y-4">
          {/* Titre */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Utilisateurs ({filteredUsers.length})
            </h3>
            {/* Bouton voir tout - visible sur toutes les tailles */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="shrink-0"
            >
              {showAllUsers ? "Réduire" : "Voir tout"}
            </Button>
          </div>

          {/* Contrôles - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Barre de recherche - Largeur complète sur mobile */}
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Rechercher utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full"
              />
            </div>

            {/* Filtre par rôle - Largeur adaptée */}
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
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                {/* Badge de rôle */}
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

                {/* Bouton toggle statut */}
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={async () => {
                    try {
                      // Utiliser la fonction du store au lieu d'api directement
                      const result = await toggleUserStatus(
                        user.id,
                        !user.active
                      );

                      if (result.success) {
                        console.log(
                          `✅ Utilisateur ${user.first_name} ${
                            !user.active ? "activé" : "désactivé"
                          }`
                        );
                        // Pas besoin de recharger manuellement, le store se met à jour automatiquement
                      } else {
                        console.error("Erreur toggle:", result.error);
                      }
                    } catch (error) {
                      console.error("Erreur toggle:", error);
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

                {/* Indicateur visuel statut */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.active ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}
    </Card>
  );

  // Rendu de la vue d'ensemble des structures
  const renderStructuresOverview = () => (
    <Card
      title="Gestion des Structures"
      header={
        <div className="space-y-4">
          {/* Titre */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Structures ({filteredStructures.length})
            </h3>
            {/* Bouton voir tout - visible sur toutes les tailles */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllStructures(!showAllStructures)}
              className="shrink-0"
            >
              {showAllStructures ? "Réduire" : "Voir tout"}
            </Button>
          </div>

          {/* Contrôles - Responsive */}
          <div className="space-y-3">
            {/* Barre de recherche - Largeur complète */}
            <div className="w-full">
              <Input
                placeholder="Rechercher structure..."
                value={structureSearchTerm}
                onChange={(e) => setStructureSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full"
              />
            </div>

            {/* Filtres - En ligne sur tablet+, empilés sur mobile */}
            <div className="flex flex-col xs:flex-row gap-2">
              {/* Type de filtre */}
              <div className="w-full xs:w-1/2">
                <select
                  value={structureFilterType}
                  onChange={(e) => {
                    setStructureFilterType(e.target.value);
                    setStructureFilter("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="zone">Par Zone</option>
                  <option value="city">Par Ville</option>
                </select>
              </div>

              {/* Valeur du filtre */}
              <div className="w-full xs:w-1/2">
                <select
                  value={structureFilter}
                  onChange={(e) => setStructureFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {structureFilterType === "zone" ? (
                    <>
                      <option value="">Toutes les zones</option>
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                    </>
                  ) : (
                    <>
                      <option value="">Toutes les villes</option>
                      {[...new Set((structures || []).map((s) => s.city))].map(
                        (city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        )
                      )}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredStructures
          .slice(0, showAllStructures ? filteredStructures.length : 8)
          .map((structure) => (
            <div
              key={structure.id}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start min-w-0 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 shrink-0 mt-0.5">
                  <Building className="w-5 h-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {structure.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {structure.address}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {structure.city}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 shrink-0 ml-2">
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  Zone {structure.school_vacation_zone}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">
                      {
                        users.filter((u) => u.structure_id === structure.id)
                          .length
                      }
                    </span>
                    <span className="xs:hidden">
                      {
                        users.filter((u) => u.structure_id === structure.id)
                          .length
                      }
                    </span>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      structure.active ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredStructures.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune structure trouvée</p>
        </div>
      )}
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
        <div className="lg:col-span-1">{renderActivityFeed()}</div>

        {/* Gestion des utilisateurs */}
        <div className="lg:col-span-1">{renderUsersManagement()}</div>

        {/* Structures */}
        <div className="lg:col-span-1">{renderStructuresOverview()}</div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        size="lg"
        showCloseButton={false}
      >
        <CreateUserForm
          onSuccess={handleUserCreated}
          onCancel={userModal.closeModal}
        />
      </Modal>

      <Modal
        isOpen={structureModal.isOpen}
        onClose={structureModal.closeModal}
        size="lg"
        showCloseButton={false}
      >
        <CreateStructureForm
          onSuccess={handleStructureCreated}
          onCancel={structureModal.closeModal}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
