const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const debug = require('debug')('gardien:models');

const db = {};

// Création de l'instance Sequelize
debug('Initialisation de la connexion Sequelize à %s', config.database.database);
const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: config.database.pool
    }
);

// Chargement automatique des modèles
debug('Chargement des modèles depuis %s', __dirname);
const modelFiles = fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== 'index.js' &&
            file.slice(-3) === '.js'
        );
    });

debug('Modèles trouvés: %O', modelFiles);

modelFiles.forEach(file => {
    const modelPath = path.join(__dirname, file);
    debug('Chargement du modèle depuis: %s', modelPath);
    const model = require(modelPath)(sequelize, Sequelize.DataTypes);
    debug('Modèle chargé: %s', model.name);
    db[model.name] = model;
});

// Création des associations entre les modèles
debug('Création des associations entre les modèles');
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        debug('Création des associations pour le modèle: %s', modelName);
        db[modelName].associate(db);
    }
});

// Vérification que tous les modèles sont bien chargés
const expectedModels = [
    'Structure',
    'User',
    'Time_Tracking',
    'Planned_Schedule',
    'Project',
    'Task',
    'User_Task',
    'Activity_Log',
    'School_Vacations'
];

const missingModels = expectedModels.filter(model => !db[model]);
if (missingModels.length > 0) {
    debug('ATTENTION: Certains modèles n\'ont pas été chargés: %O', missingModels);
} else {
    debug('Tous les modèles ont été chargés avec succès');
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;