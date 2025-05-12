const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const debug = require('debug')('gardien:server');
const config = require('./config/config');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/', require('./routes/home'));
// Ajoutez d'autres routes au fur et à mesure

// Connexion à la base de données
const startServer = async () => {
    try {
        await sequelize.authenticate();
        debug('Connexion à la base de données réussie.');
        console.log('Connexion à la base de données réussie.');

        app.listen(config.port, () => {
            debug(`Serveur démarré sur le port ${config.port}`);
            console.log(`Serveur démarré sur le port ${config.port}`);
        });
    } catch (error) {
        debug('Erreur de connexion à la base de données: %O', error);
        console.error('Impossible de se connecter à la base de données:', error);
    }
};

startServer();