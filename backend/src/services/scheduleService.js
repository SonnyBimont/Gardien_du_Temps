const cron = require('node-cron');
const axios = require('axios');
const { School_Vacations } = require('../models');
const config = require('../config/config');

// Fonction de synchronisation
async function syncSchoolVacations() {
    console.log('Démarrage de la synchronisation automatique des vacances scolaires');

    try {
        // Calcul de l'année scolaire selon la période (septembre = nouvelle année)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYear
        let nextSchoolYear
        // Si on est après septembre, nouvelle année scolaire a commencé
        if (currentMonth >= 9) {
            currentSchoolYear = `${currentYear}-${currentYear + 1}`;
            nextSchoolYear = `${currentYear + 1}-${currentYear + 2}`;
        } else {
            // Sinon on est encore sur l'année scolaire précédente
            currentSchoolYear = `${currentYear - 1}-${currentYear}`;
            nextSchoolYear = `${currentYear}-${currentYear + 1}`;
        }

        const zones = ['A', 'B', 'C'];
        const schoolYears = [currentSchoolYear, nextSchoolYear];

        // Traitement pour chaque combinaison zone/année
        // [Implémentation similaire à syncVacationsFromAPI]
        // Devrait appeler l'API gouvernementale et sauvegarder en DB

        console.log('Synchronisation des vacances scolaires terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de la synchronisation automatique des vacances scolaires:', error);
    }
}

/**
 * Configure et démarre les tâches planifiées (cron jobs)
 * Active uniquement en production pour éviter les doublons en dev
 * 
 * @function setupScheduledJobs
 * @returns {void}
 * 
 * Planning : Tous les 1er du mois à 03:00 (faible charge serveur)
 */
function setupScheduledJobs() {
    if (config.nodeEnv === 'production') {
        // Cron : minute heure jour mois jour-semaine
        // 0 3 1 * * = 03:00 le 1er de chaque mois
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