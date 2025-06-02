// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTimeStore } from '../stores/timeStore';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import DirectorDashboard from '../components/dashboard/DirectorDashboard';
import AnimatorDashboard from '../components/dashboard/AnimatorDashboard';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuthStore();
  const { fetchTodayEntries } = useTimeStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Gestion de l'état de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mise à jour automatique des données
  useEffect(() => {
    if (user?.id && isOnline) {
      const refreshData = async () => {
        await fetchTodayEntries();
        setLastUpdate(new Date());
      };

      refreshData();
      
      // Rafraîchissement toutes les 5 minutes
      const interval = setInterval(refreshData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?.id, isOnline, fetchTodayEntries]);

  const renderDashboard = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre espace...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Veuillez vous reconnecter pour accéder à votre espace
          </p>
        </div>
      );
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'director':
        return <DirectorDashboard />;
      case 'animator':
        return <AnimatorDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Rôle non reconnu
            </h2>
            <p className="text-gray-600 mb-4">
              Votre rôle "{user.role}" n'est pas pris en charge
            </p>
            <p className="text-sm text-gray-500">
              Contactez votre administrateur pour résoudre ce problème
            </p>
          </div>
        );
    }
  };

  const renderStatusBar = () => {
    if (!user) return null;

    return (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Statut de connexion */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            {/* Dernière mise à jour */}
            {isOnline && (
              <div className="text-sm text-gray-500">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          {/* Informations utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role === 'admin' && 'Administrateur'}
                {user.role === 'director' && 'Directeur'}
                {user.role === 'animator' && 'Animateur'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOfflineBanner = () => {
    if (isOnline) return null;

    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
        <div className="flex items-center">
          <WifiOff className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Mode hors ligne
            </p>
            <p className="text-xs text-yellow-700">
              Certaines fonctionnalités peuvent être limitées. Les données seront synchronisées lors de la reconnexion.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de statut */}
      {renderStatusBar()}
      
      {/* Bannière hors ligne */}
      {renderOfflineBanner()}
      
      {/* Contenu principal */}
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
  {renderDashboard()}
</div>
    </div>
  );
};

export default DashboardPage;