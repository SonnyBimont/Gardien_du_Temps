const config = require('./config');

module.exports = {
    development: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect
    },
    test: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect
    },
    production: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect
    }
};

// Configuration spécifique pour Sequelize CLI
// - Réutilise la config principale pour éviter duplication
// - Définit les environnements dev/test/prod identiques
// - Permet l'utilisation des commandes sequelize-cli
// - Nécessaire pour migrations et seeders