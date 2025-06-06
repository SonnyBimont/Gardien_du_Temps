// Configuration des services API
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Créer une instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logging pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    // log pour déboguer
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🌐 Full URL:', config.baseURL + config.url);

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    // Logging pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion si on n'y est pas déjà
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      console.error('Erreur serveur:', error.response.data);
    }
    
    // Gestion des erreurs réseau
    if (error.code === 'NETWORK_ERROR') {
      console.error('Erreur de réseau - Vérifiez votre connexion');
    }
    
    return Promise.reject(error);
  }
);

export default api;