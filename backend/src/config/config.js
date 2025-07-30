const path = require('path');
require('dotenv').config({ path: '../../.env' });

const config = {
    // Serveur
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Base de données
    database: {
        username: process.env.DB_USERNAME || 'guardiantime',
        password: process.env.DB_PASSWORD || 'guardiantime',
        database: process.env.DB_NAME || 'guardiantime',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || 5),
            min: parseInt(process.env.DB_POOL_MIN || 0),
            acquire: parseInt(process.env.DB_POOL_ACQUIRE || 30000),
            idle: parseInt(process.env.DB_POOL_IDLE || 10000)
        }
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'votre_secret_jwt',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
};

if (config.nodeEnv === 'production') {
    const required = ['JWT_SECRET', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
        throw new Error(`Variables manquantes: ${missing.join(', ')}`);
    }
}

module.exports = config;

// Configuration centralisée de l'application
// - Charge les variables d'environnement (.env)
// - Définit paramètres serveur (port, env)
// - Configure connexion PostgreSQL avec pool
// - Paramètres JWT (secret, expiration)