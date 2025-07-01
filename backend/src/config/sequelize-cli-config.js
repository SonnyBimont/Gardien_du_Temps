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

// Configuration pour Sequelize CLI (migrations/seeders)
// - Réutilise config principale pour éviter duplication
// - Environnements dev/test/prod identiques