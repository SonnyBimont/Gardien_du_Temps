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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

// Logger
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Journalisation des requêtes
app.use((req, res, next) => {
    const dateISO = new Date().toISOString(); // Format ISO de la date et heure
    const clientIP = req.ip; // IP du client
    const method = req.method; // Ajout de la méthode HTTP
    const path = req.originalUrl; // Chemin accédé

    console.log(`[${dateISO}] ${method} ${path} - IP: ${clientIP}`);
    next();
});

// Routes
app.use('/api', routes);

// Documentation API Swagger - Placez-la après les routes API
app.use('/api-docs', swaggerConfig.serve, swaggerConfig.setup);

// Gestion des erreurs 404 - doit être après les routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Erreur serveur'
    });
});

// Connexion à la base de données
const startServer = async () => {
    try {
        await sequelize.authenticate();
        debug('Connexion à la base de données réussie.');
        console.log('Connexion à la base de données réussie.');

        // Démarrer les tâches planifiées après connexion à la DB
        setupScheduledJobs();

        app.listen(config.port, () => {
            debug(`Serveur démarré sur le port ${config.port}`);
            console.log(`Serveur démarré sur le port ${config.port}`);
            console.log(`API disponible sur http://localhost:${config.port}/api`);
        });
    } catch (error) {
        debug('Erreur de connexion à la base de données: %O', error);
        console.error('Impossible de se connecter à la base de données:', error);
    }
};

startServer();