const express = require('express');
const { apiLimiter } = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');
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
app.use(helmet());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
}));

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
    
    // Log structuré pour production
    logger.debug('Requête reçue', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    next();
});

// Routes
app.use('/api', apiLimiter, routes);

// Documentation API Swagger - Placez-la après les routes API
app.use('/api-docs', swaggerConfig.serve, swaggerConfig.setup);

// Gestion des erreurs 404 - doit être après les routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Logger middleware
app.use((err, req, res, next) => {
    logger.error('Erreur serveur', {
        error: err.message,
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    
    res.status(err.statusCode || 500).json({
        success: false,
        error: config.nodeEnv === 'development' ? err.message : 'Erreur serveur'
    });
});

// Connexion à la base de données
const startServer = async () => {
    try {
        console.log('🔌 Tentative de connexion à la base de données...');
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données réussie.');

        // Démarrer les tâches planifiées après connexion à la DB
        setupScheduledJobs();

        app.listen(config.port, () => {
            console.log(`🚀 Serveur démarré sur le port ${config.port}`);
            console.log(`📡 API disponible sur http://localhost:${config.port}/api`);
            console.log(`📚 Documentation sur http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Impossible de se connecter à la base de données:', error);
        console.error('🔧 Vérifiez que PostgreSQL est démarré et configuré');
        process.exit(1);
    }
};

// GESTION DES SIGNAUX POUR ARRÊT PROPRE
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM reçu, arrêt du serveur...');
    sequelize.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT reçu, arrêt du serveur...');
    sequelize.close();
    process.exit(0);
});

startServer();

module.exports = app;
