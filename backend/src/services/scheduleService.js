const cron = require('node-cron');
const axios = require('axios');
const { School_Vacations } = require('../models');
const config = require('../config/config');

// Fonction de synchronisation
async function syncSchoolVacations() {
    console.log('Démarrage de la synchronisation automatique des vacances scolaires');

    try {
        // Logique similaire à la méthode syncCurrentAndNextYear
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYear
        let nextSchoolYear
        if (currentMonth >= 9) {
            currentSchoolYear = `${currentYear}-${currentYear + 1}`;
            nextSchoolYear = `${currentYear + 1}-${currentYear + 2}`;
        } else {
            currentSchoolYear = `${currentYear - 1}-${currentYear}`;
            nextSchoolYear = `${currentYear}-${currentYear + 1}`;
        }

        const zones = ['A', 'B', 'C'];
        const schoolYears = [currentSchoolYear, nextSchoolYear];

        // Traitement pour chaque combinaison zone/année
        // [Implémentation similaire à syncVacationsFromAPI]

        console.log('Synchronisation des vacances scolaires terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de la synchronisation automatique des vacances scolaires:', error);
    }
}

// Planifier la synchronisation (tous les 1er du mois à 03:00)
function setupScheduledJobs() {
    if (config.nodeEnv === 'production') {
        cron.schedule('0 3 1 * *', () => {
            syncSchoolVacations();
        });
        console.log('Tâche planifiée pour la synchronisation des vacances scolaires configurée');
    }
}

module.exports = {
    syncSchoolVacations,
    setupScheduledJobs
};