const { School_Vacations } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

// Récupérer toutes les périodes de vacances scolaires
exports.getAllVacations = async (req, res) => {
    try {
        const vacations = await School_Vacations.findAll({
            order: [['start_date', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: vacations.length,
            data: vacations
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des vacances scolaires', error: error.message });
    }
};

// Récupérer une période de vacances par ID
exports.getVacationById = async (req, res) => {
    try {
        const vacation = await School_Vacations.findByPk(req.params.id);

        if (!vacation) {
            return res.status(404).json({ message: 'Période de vacances non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: vacation
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la période de vacances', error: error.message });
    }
};

// Créer une nouvelle période de vacances
exports.createVacation = async (req, res) => {
    try {
        const vacation = await School_Vacations.create(req.body);

        res.status(201).json({
            success: true,
            data: vacation
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la période de vacances', error: error.message });
    }
};

// Mettre à jour une période de vacances
exports.updateVacation = async (req, res) => {
    try {
        const [updated] = await School_Vacations.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Période de vacances non trouvée' });
        }

        const updatedVacation = await School_Vacations.findByPk(req.params.id);

        res.status(200).json({
            success: true,
            data: updatedVacation
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour de la période de vacances', error: error.message });
    }
};

// Supprimer une période de vacances
exports.deleteVacation = async (req, res) => {
    try {
        const deleted = await School_Vacations.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Période de vacances non trouvée' });
        }

        res.status(200).json({
            success: true,
            message: 'Période de vacances supprimée avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de la période de vacances', error: error.message });
    }
};

// Récupérer les périodes de vacances par zone
exports.getVacationsByZone = async (req, res) => {
    try {
        const vacations = await School_Vacations.findAll({
            where: { zone: req.params.zone },
            order: [['start_date', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: vacations.length,
            data: vacations
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des vacances scolaires', error: error.message });
    }
};

// Récupérer les périodes de vacances par année scolaire
exports.getVacationsBySchoolYear = async (req, res) => {
    try {
        const vacations = await School_Vacations.findAll({
            where: { school_year: req.params.schoolYear },
            order: [['start_date', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: vacations.length,
            data: vacations
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des vacances scolaires', error: error.message });
    }
};

// Vérifier si une date donnée est pendant les vacances scolaires
exports.checkIfDateIsVacation = async (req, res) => {
    try {
        const { date, zone } = req.query;
        const checkDate = new Date(date);

        if (!checkDate || Number.isNaN(checkDate.getTime())) {
            return res.status(400).json({ message: 'Date invalide' });
        }

        const whereClause = {
            start_date: { [Op.lte]: checkDate },
            end_date: { [Op.gte]: checkDate }
        };

        if (zone) {
            whereClause.zone = zone;
        }

        const vacation = await School_Vacations.findOne({
            where: whereClause
        });

        res.status(200).json({
            success: true,
            isVacation: !!vacation,
            vacationData: vacation
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification de la date', error: error.message });
    }
};

// API pour synchroniser les vacances scolaires 
// Synchroniser les vacances scolaires depuis l'API du gouvernement
exports.syncVacationsFromAPI = async (req, res) => {
    try {
        const { zones, schoolYears } = req.body;

        // Valider les paramètres
        if (!zones || !zones.length || !schoolYears || !schoolYears.length) {
            return res.status(400).json({
                message: 'Veuillez fournir au moins une zone (A, B, C) et une année scolaire (format: YYYY-YYYY)'
            });
        }

        // Récupérer les données pour chaque zone et année
        const results = [];
        const errors = [];

        for (const zone of zones) {
            for (const schoolYear of schoolYears) {
                try {
                    // Format de l'API : exemple pour 2023-2024, zone A
                    const apiUrl = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&facet=description&facet=population&facet=start_date&facet=end_date&facet=zones&facet=annee_scolaire&refine.zones=Zone+${zone}&refine.annee_scolaire=${schoolYear}`;

                    const response = await axios.get(apiUrl);
                    const records = response.data.records;

                    if (records && records.length > 0) {
                        // Traiter et enregistrer chaque période de vacances
                        for (const record of records) {
                            const fields = record.fields;

                            // Ne traiter que les vacances (pas les jours fériés)
                            if (fields.population === "Élèves") {
                                const vacationData = {
                                    zone: zone,
                                    period_name: fields.description,
                                    start_date: new Date(fields.start_date),
                                    end_date: new Date(fields.end_date),
                                    school_year: schoolYear,
                                };

                                // Vérifier si cette période existe déjà
                                const existingVacation = await School_Vacations.findOne({
                                    where: {
                                        zone: vacationData.zone,
                                        period_name: vacationData.period_name,
                                        school_year: vacationData.school_year
                                    }
                                });

                                if (existingVacation) {
                                    // Mettre à jour si existe déjà
                                    await existingVacation.update(vacationData);
                                    results.push({
                                        status: 'updated',
                                        data: existingVacation
                                    });
                                } else {
                                    // Créer nouvelle entrée
                                    const newVacation = await School_Vacations.create(vacationData);
                                    results.push({
                                        status: 'created',
                                        data: newVacation
                                    });
                                }
                            }
                        }
                    } else {
                        errors.push(`Aucune donnée trouvée pour la zone ${zone}, année scolaire ${schoolYear}`);
                    }
                } catch (error) {
                    errors.push(`Erreur pour zone ${zone}, année ${schoolYear}: ${error.message}`);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Synchronisation des vacances scolaires terminée',
            results: {
                created: results.filter(r => r.status === 'created').length,
                updated: results.filter(r => r.status === 'updated').length
            },
            errors: errors.length > 0 ? errors : null
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la synchronisation des vacances scolaires',
            error: error.message
        });
    }
};

// Récupérer les années scolaires disponibles dans l'API
exports.getAvailableSchoolYears = async (req, res) => {
    try {
        const apiUrl = 'https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&facet=annee_scolaire';
        const response = await axios.get(apiUrl);

        const schoolYears = response.data.facet_groups
            .find(group => group.name === 'annee_scolaire')?.facets
            .map(facet => facet.name) || [];

        res.status(200).json({
            success: true,
            data: schoolYears
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des années scolaires disponibles',
            error: error.message
        });
    }
};

// Interface simplifiée pour synchroniser les vacances scolaires
exports.syncCurrentAndNextYear = async (req, res) => {
    try {
        // Déterminer l'année scolaire actuelle et la suivante
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() est 0-indexé

        // En France, l'année scolaire commence en septembre
        let currentSchoolYear
        let nextSchoolYear
        if (currentMonth >= 9) { // Septembre ou après
            currentSchoolYear = `${currentYear}-${currentYear + 1}`;
            nextSchoolYear = `${currentYear + 1}-${currentYear + 2}`;
        } else {
            currentSchoolYear = `${currentYear - 1}-${currentYear}`;
            nextSchoolYear = `${currentYear}-${currentYear + 1}`;
        }

        // Configurer la requête pour toutes les zones
        const zones = ['A', 'B', 'C'];
        const schoolYears = [currentSchoolYear, nextSchoolYear];

        // Réutiliser la méthode de synchronisation
        req.body = { zones, schoolYears };
        return await exports.syncVacationsFromAPI(req, res);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la synchronisation automatique des vacances scolaires',
            error: error.message
        });
    }
};