/**
 * Ce fichier est le point d'entrée pour tous les modèles Sequelize.
 * Il initialise la connexion à la base de données, charge dynamiquement tous les modèles,
 * et configure leurs associations.
 */

// Importation des modules nécessaires
const fs = require('fs');                  // Module pour interagir avec le système de fichiers
const path = require('path');              // Module pour manipuler les chemins de fichiers
const Sequelize = require('sequelize');    // ORM pour interagir avec la base de données
const config = require('../config/config'); // Configuration de l'application
const debug = require('debug')('gardien:models'); // Utilitaire de débogage avec namespace 'gardien:models'

// Objet qui contiendra tous les modèles chargés
const db = {};

// Initialisation de la connexion à la base de données
debug('Initialisation de la connexion Sequelize à %s', config.database.database);
const sequelize = new Sequelize(
    config.database.database,    // Nom de la base de données
    config.database.username,    // Nom d'utilisateur
    config.database.password,    // Mot de passe
    {
        host: config.database.host,          // Hôte de la base de données (localhost ou adresse IP)
        port: config.database.port,          // Port de la base de données
        dialect: config.database.dialect,    // Type de base de données (mysql, postgres, sqlite, etc.)
        logging: config.database.logging,    // Fonction de journalisation des requêtes SQL
        pool: config.database.pool           // Configuration du pool de connexions
    }
);

/**
 * Chargement automatique de tous les modèles présents dans le répertoire 'models'
 * Cette approche évite d'avoir à importer manuellement chaque modèle
 */
debug('Chargement des modèles depuis %s', __dirname);
// Lit tous les fichiers du répertoire actuel et filtre ceux qui sont des modèles
const modelFiles = fs
    .readdirSync(__dirname)      // Lire tous les fichiers du répertoire
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&   // Ignore les fichiers cachés (commençant par '.')
            file !== 'index.js' &&       // Ignore ce fichier index.js lui-même
            file.slice(-3) === '.js'     // Ne prend que les fichiers JavaScript
        );
    });

// Affiche les noms des fichiers de modèles trouvés
debug('Modèles trouvés: %O', modelFiles);

/**
 * Parcourt chaque fichier de modèle trouvé et les charge dans l'objet 'db'
 * Chaque modèle est initialisé avec l'instance Sequelize
 */
modelFiles.forEach(file => {
    const modelPath = path.join(__dirname, file);      // Chemin complet du fichier
    debug('Chargement du modèle depuis: %s', modelPath);
    // Importe et initialise le modèle
    const model = require(modelPath)(sequelize, Sequelize.DataTypes);
    debug('Modèle chargé: %s', model.name);
    // Ajoute le modèle à l'objet 'db' avec son nom comme clé
    db[model.name] = model;
});

/**
 * Établit les associations entre les modèles
 * Chaque modèle peut définir une méthode 'associate' qui configure ses relations avec d'autres modèles
 */
debug('Création des associations entre les modèles');
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {  // Vérifie si le modèle a une méthode 'associate'
        debug('Création des associations pour le modèle: %s', modelName);
        db[modelName].associate(db);  // Appelle la méthode 'associate' avec tous les modèles
    }
});

/**
 * Vérification que tous les modèles attendus ont bien été chargés
 * Cela aide à identifier rapidement les problèmes de chargement des modèles
 */
const expectedModels = [
    'User',              // Utilisateurs du système (admin, directeur, animateur)
    'Structure',         // Structure organisationnelle (centre de loisirs, etc.)
    'Time_Tracking',     // Enregistrements de temps de travail
    'Task',              // Tâches liées aux projets (comment faire?)
    'Project',           // Projets (quoi faire?)
    'User_Task',         // Table de jointure entre utilisateurs et tâches
    'Planned_Schedule',  // Plannings prévus
    'Activity_Log',      // Journaux d'activité
    'School_Vacations'   // Périodes de vacances scolaires
];

// Vérifie si des modèles attendus sont manquants
const missingModels = expectedModels.filter(model => !db[model]);
if (missingModels.length > 0) {
    debug('ATTENTION: Certains modèles n\'ont pas été chargés: %O', missingModels);
} else {
    debug('Tous les modèles ont été chargés avec succès');
}

// Ajoute l'instance Sequelize et la classe Sequelize à l'objet 'db'
db.sequelize = sequelize;   // Instance de connexion pour les opérations
db.Sequelize = Sequelize;   // Classe Sequelize pour les types de données et utilitaires

// Exporte l'objet 'db' contenant tous les modèles et l'instance Sequelize
module.exports = db;