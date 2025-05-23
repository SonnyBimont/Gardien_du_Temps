import axios from "axios";

// Définir l'URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Créer une instance Axios avec la configuration de base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        // Journaliser les requêtes pour le débogage
        console.log('API Request:', config.method.toUpperCase(), config.url);

        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => {
        // Journaliser les réponses pour le débogage
        console.log('API Response:', response.config.method.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);

            // Gérer les erreurs d'authentification (401)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        } else if (error.request) {
            console.error('API Request Error (No Response):', error.request);
        } else {
            console.error('API Setup Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;