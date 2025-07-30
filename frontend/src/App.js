/**
 * APPLICATION PRINCIPALE REACT - GARDIEN DU TEMPS FRONTEND
 * 
 * Point d'entrée de l'application React avec gestion complète :
 * - Routage protégé (authentification)
 * - Pages publiques/privées
 * - Error Boundary global
 * - Loading states et splash screen
 * - Page 404 personnalisée
 * 
 * Architecture :
 * - ProtectedRoute : Routes nécessitant une authentification
 * - PublicRoute : Routes accessibles sans auth (redirection si connecté)
 * - ErrorBoundary : Gestion des erreurs React
 * - Initialisation et vérification auth au démarrage
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TermsOfService from './pages/legal/CGU';
import PrivacyPolicy from './pages/legal/PolitiqueConfidentialite';
import LegalNotices from './pages/legal/MentionsLegales';
import CookiePolicy from './pages/legal/PolitiqueCookies';
import Layout from './components/common/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  // Affichage du loader pendant la vérification auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />; //replace évite l'historique de navigation
};

const PublicRoute = ({ children }) => {
    // Empêche l'accès aux pages publiques si déjà connecté
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Composant pour gérer les erreurs de routes
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Navigation error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Une erreur est survenue
          </h1>
          <p className="text-gray-600 mb-4">
            Veuillez rafraîchir la page ou contacter le support
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Page 404 personnalisée
const NotFoundPage = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page non trouvée
        </h1>
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée
        </p>
        <Navigate 
          to={user ? "/dashboard" : "/login"} 
          replace 
        />
      </div>
    </div>
  );
};

function App() {
  const { checkAuth, isAuthenticated, loading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation de l'app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth(); // Vérification du token au démarrage
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [checkAuth]);

  // Affichage du splash screen pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Gardien du Temps</h1>
          <p className="text-blue-100">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* Route publique - Login */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />      

  {/* Routes Légales */}
  <Route path="/legal/terms-of-service" element={<TermsOfService />} />
  <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/legal/legal-notices" element={<LegalNotices />} />
  <Route path="/legal/cookie-policy" element={<CookiePolicy />} />

            {/* Routes protégées */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Redirection par défaut */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;