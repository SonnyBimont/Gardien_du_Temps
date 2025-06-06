// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Configuration globale des erreurs
const setupErrorHandling = () => {
  // Gestion des erreurs non capturées
  window.addEventListener('error', (event) => {
    console.error('Erreur non capturée:', event.error);
    // Ici on pourrait envoyer les erreurs à un service de monitoring
  });

  // Gestion des promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    event.preventDefault(); // Empêche l'affichage dans la console
  });
};

// Configuration de l'environnement
const setupEnvironment = () => {
  // Variables d'environnement
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Mode développement activé');
    console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001');
  }

  // Configuration PWA
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Optimisations de performance
const setupPerformance = () => {
  // Web Vitals pour monitoring des performances
  if (process.env.NODE_ENV === 'production') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// Configuration de l'accessibilité
const setupAccessibility = () => {
  // React Axe pour l'accessibilité en développement
  if (process.env.NODE_ENV === 'development') {
    import('@axe-core/react').then((axe) => {
      axe.default(React, ReactDOM, 1000);
    });
  }
};

// Initialisation de l'application
const initializeApp = () => {
  setupErrorHandling();
  setupEnvironment();
  setupPerformance();
  setupAccessibility();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Rendu avec gestion d'erreur de fallback
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Erreur critique lors du rendu:', error);
    
    // Fallback d'urgence
    root.render(
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Erreur de chargement
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            L'application n'a pas pu se charger correctement
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

// Lancement de l'application
initializeApp();

// Hot Module Replacement pour le développement
if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reload détecté');
    initializeApp();
  });
}