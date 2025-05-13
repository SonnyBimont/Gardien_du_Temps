const { Sequelize } = require('sequelize');
const config = require('./config');
const debug = require('debug')('gardien:database');

// Configuration de Sequelize
const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging ? msg => debug(msg) : false,
        pool: {
            max: config.database.pool.max,
            min: config.database.pool.min,
            acquire: config.database.pool.acquire,
            idle: config.database.pool.idle
        }
    }
);

// Fonction pour tester la connexion
async function testConnection() {
    try {
        await sequelize.authenticate();
        debug('Connexion à la base de données établie avec succès.');
        return true;
    } catch (error) {
        debug('Impossible de se connecter à la base de données:', error);
        return false;
    }
}

// Fonction pour synchroniser les modèles avec la base de données
async function syncDatabase(force = false) {
    try {
        debug(`Synchronisation des modèles avec la base de données (force: ${force})`);
        await sequelize.sync({ force });
        debug('Synchronisation terminée avec succès.');
        return true;
    } catch (error) {
        debug('Erreur lors de la synchronisation:', error);
        return false;
    }
}

// Fonction pour initialiser la base de données avec des données de test (développement uniquement)
async function seedDatabase() {
    if (config.nodeEnv !== 'development') {
        debug('Le seeding ne peut être effectué qu\'en environnement de développement');
        return false;
    }

    const { Structure, User, School_Vacations } = require('../models');

    try {
        debug('Création de données initiales...');

        // Création d'une structure
        const structure = await Structure.create({
            name: 'Structure Test',
            address: '123 rue du Test',
            postal_code: '75000',
            city: 'Paris',
            school_vacation_zone: 'C',
            active: true
        });

        // Création d'un administrateur
        await User.create({
            email: 'admin@example.com',
            password: '$2b$10$vXmFr9F.gJBS47ZGwz0Gzei7dwr8aEXFdcPvDZEQlNhsiSYIGZ2ZK', // 'password' hashé avec bcrypt
            last_name: 'Admin',
            first_name: 'Super',
            phone: '0123456789',
            structure_id: structure.id,
            role: 'admin',
            contract_type: 'permanent',
            weekly_hours: 35,
            annual_hours: 1607,
            contract_start_date: new Date(),
            active: true
        });

        // Création des vacances scolaires
        await School_Vacations.create({
            zone: 'C',
            period_name: 'Vacances d\'été',
            start_date: new Date('2023-07-08'),
            end_date: new Date('2023-09-04'),
            school_year: '2023-2024'
        });

        debug('Données initiales créées avec succès.');
        return true;
    } catch (error) {
        debug('Erreur lors de la création des données initiales:', error);
        return false;
    }
}

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
    seedDatabase
};