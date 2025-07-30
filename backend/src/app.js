/**
 * APPLICATION PRINCIPALE EXPRESS - GARDIEN DU TEMPS
 * 
 * Point d'entrée de l'API backend. Configure Express avec tous les middlewares,
 * la sécurité, les routes et la connexion base de données.
 * 
 * Architecture :
 * - Middlewares de sécurité (helmet, cors)
 * - Logging conditionnel (morgan en dev)
 * - Routes API et documentation Swagger
 * - Gestion d'erreurs centralisée
 * - Démarrage serveur avec connexion DB
 * 
 * Fonctionnalités :
 * - CORS configuré pour frontend React
 * - Documentation Swagger automatique
 * - Logs des requêtes personnalisés
 * - Tâches planifiées (cron jobs)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const debug = require('debug')('gardien:server');
const config = require('./config/config');
const { sequelize } = require('./models');
const { setupScheduledJobs } = require('./services/scheduleService');
const routes = require('./routes');
const swaggerConfig = require('./config/swagger');

const app = express();

// ===== MIDDLEWARES DE BASE =====

// Parse JSON et URL encoded (formulaires)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sécurité : Headers de sécurité automatiques
app.use(helmet());

// CORS : Autorisation frontend React (dev + prod)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // React dev + test
  credentials: true, // Cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization', // JWT Bearer tokens
    'Cache-Control'
  ]
}));

// ===== LOGGING =====

// Morgan : Logger HTTP professionnel (développement uniquement)
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Logger personnalisé : Toutes requêtes avec IP et timestamp
app.use((req, res, next) => {
    const dateISO = new Date().toISOString(); // Format ISO de la date et heure
    const clientIP = req.ip; // IP du client
    const method = req.method; // Ajout de la méthode HTTP
    const path = req.originalUrl; // Chemin accédé

    console.log(`[${dateISO}] ${method} ${path} - IP: ${clientIP}`);
    next();
});

// ===== ROUTES =====

// Routes API principales (préfixe /api)
app.use('/api', routes);

// Documentation Swagger UI (accessible sur /api-docs)
app.use('/api-docs', swaggerConfig.serve, swaggerConfig.setup);

// ===== GESTION D'ERREURS =====

// 404 : Route non trouvée (doit être après toutes les routes)
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Erreur serveur'
    });
});

// ===== DÉMARRAGE SERVEUR =====

/**
 * Démarre le serveur après connexion à la base de données
 * Active les tâches planifiées une fois la DB connectée
 * 
 * @async
 * @function startServer
 */
const startServer = async () => {
    try {
        // Test de connexion à la base de données
        await sequelize.authenticate();
        debug('Connexion à la base de données réussie.');
        console.log('Connexion à la base de données réussie.');

        // Activation des tâches planifiées (cron jobs)
        setupScheduledJobs();

        // Démarrage du serveur Express
        app.listen(config.port, () => {
            debug(`Serveur démarré sur le port ${config.port}`);
            console.log(`Serveur démarré sur le port ${config.port}`);
            console.log(`API disponible sur http://localhost:${config.port}/api`);
            console.log(`Documentation Swagger : http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        debug('Erreur de connexion à la base de données: %O', error);
        console.error('Impossible de se connecter à la base de données:', error);
        process.exit(1); // Arrêt propre en cas d'erreur critique
    }
};

// Lancement de l'application
startServer();