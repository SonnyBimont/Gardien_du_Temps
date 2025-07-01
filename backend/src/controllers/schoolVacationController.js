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


// Synchroniser les vacances scolaires depuis l'API du gouvernement
exports.syncVacationsFromAPI = async (req, res) => {
  try {
    const { zones = ['A', 'B', 'C'], schoolYears = ['2024-2025'], forceSync = false } = req.body;
    
    console.log('🔄 Début synchronisation forcée:', { zones, schoolYears, forceSync });
    
    const results = [];
    const errors = [];
    
    // Supprimer TOUTES les anciennes données
    if (forceSync) {
      console.log('🗑️ Suppression forcée de toutes les anciennes vacances...');
      const deletedCount = await School_Vacations.destroy({
        where: {
          zone: { [Op.in]: zones },
          school_year: { [Op.in]: schoolYears }
        }
      });
      console.log(`🗑️ ${deletedCount} anciennes vacances supprimées`);
    }
    
    // BOUCLE sur chaque zone ET année
    for (const zone of zones) {
      for (const schoolYear of schoolYears) {
        try {
          console.log(`📡 Récupération zone ${zone}, année ${schoolYear}...`);
          
          // URL corrigée avec plus de résultats
          const apiUrl = `https://data.education.gouv.fr/api/records/1.0/search/`
            + `?dataset=fr-en-calendrier-scolaire`
            + `&q=`
            + `&rows=200`
            + `&facet=description&facet=population&facet=start_date&facet=end_date&facet=zones&facet=annee_scolaire`
            + `&refine.zones=Zone+${zone}`
            + `&refine.annee_scolaire=${schoolYear}`

          console.log(`📡 URL: ${apiUrl}`);
          
          const response = await axios.get(apiUrl, {
            timeout: 60000, // 1 minute
            headers: {
              'User-Agent': 'Gardien-du-Temps/1.0',
              'Accept': 'application/json'
            }
          });
          
          if (!response.data || !response.data.records) {
            console.warn(`⚠️ Réponse API vide pour zone ${zone}`);
            continue;
          }
          
          const records = response.data.records;
          console.log(`📊 ${records.length} records reçus de l'API pour zone ${zone}`);
          
          if (records.length === 0) {
            console.warn(`⚠️ Aucun record pour zone ${zone}, année ${schoolYear}`);
            continue;
          }
          
          // TRAITER chaque record
          for (const record of records) {
            const fields = record.fields;
    
   if (!fields || !fields.description || !fields.start_date || !fields.end_date) {
    console.warn('⚠️ Record incomplet ignoré:', fields);
    continue;
  }
  
  const population = fields.population;           

  if (population && population === "Enseignants") {
    console.log(`ℹ️ Ignoré (enseignants seulement):`, fields.description);
    continue;
  }
            
            // VÉRIFIER que c'est pour les élèves
  if (population !== "Élèves" && population !== "-" && population != null && population !== "") {
    console.log(`ℹ️ Ignoré (population inconnue: ${population}):`, fields.description);
    continue;
  }
            
  // Vérifier que c'est bien la bonne zone
  const recordZones = fields.zones || '';
  if (!recordZones.includes(`Zone ${zone}`)) {
    console.log(`ℹ️ Ignoré (zone: ${recordZones}, attendu: Zone ${zone}):`, fields.description);
    continue;
  }

            // CRÉER l'objet vacance
            const vacationData = {
              zone: zone,
              period_name: fields.description,
              start_date: new Date(fields.start_date),
              end_date: new Date(fields.end_date),
              school_year: schoolYear,
            };
            
            // CRÉER directement (pas de vérification doublon si forceSync)
            try {
              const newVacation = await School_Vacations.create(vacationData);
              console.log(`✅ CRÉÉ: ${fields.description} (${fields.start_date} → ${fields.end_date})`);
              results.push({
                status: 'created',
                data: newVacation,
                zone: zone,
                period: fields.description
              });
            } catch (createError) {
              console.error(`❌ Erreur création ${fields.description}:`, createError.message);
              errors.push({
                zone,
                schoolYear,
                period: fields.description,
                error: createError.message
              });
            }
          }
          
        } catch (apiError) {
          console.error(`❌ Erreur API zone ${zone}, année ${schoolYear}:`, apiError.message);
          errors.push({
            zone,
            schoolYear,
            error: `API Error: ${apiError.message}`
          });
        }
      }
    }
    
    // RÉSUMÉ final
    const summary = {
      total_processed: results.length,
      created: results.filter(r => r.status === 'created').length,
      errors: errors.length
    };
    
    console.log(`🎉 Synchronisation terminée:`, summary);
    console.log(`📋 Détails:`, results.map(r => `${r.zone}: ${r.period}`));
    
    if (errors.length > 0) {
      console.error(`❌ Erreurs:`, errors);
    }
    
    res.json({
      success: true,
      message: `Synchronisation terminée: ${summary.created} vacances créées`,
      results: summary,
      errors: errors.length > 0 ? errors : null,
      details: results
    });

  } catch (globalError) {
    console.error('❌ Erreur globale synchronisation:', globalError);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la synchronisation des vacances scolaires',
      error: globalError.message,
      stack: process.env.NODE_ENV === 'development' ? globalError.stack : undefined
    });
  }
};

// Récupérer les académies disponibles
exports.getAvailableAcademies = async (req, res) => {
    try {
        const apiUrl = 'https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&facet=location';
        const response = await axios.get(apiUrl);

        const academies = response.data.facet_groups
            .find(group => group.name === 'location')?.facets
            .map(facet => facet.name) || [];

        res.status(200).json({
            success: true,
            data: academies.sort()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des académies disponibles',
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


// À ajouter dans schoolVacationController.js
exports.getVacationsCalendar = async (req, res) => {
    try {
        const { zone, schoolYear, location } = req.query;
        let whereClause = {};

        if (zone) whereClause.zone = zone;
        if (schoolYear) whereClause.school_year = schoolYear;

        const vacations = await School_Vacations.findAll({
            where: whereClause,
            order: [['start_date', 'ASC']]
        });

        // Formater pour l'affichage calendrier
        const calendarData = vacations.map(vacation => {
            // Les dates dans la DB sont les VRAIES dates de début/fin des vacances
            const startDate = new Date(vacation.start_date);
            
            // Pour le calendrier, on veut que la fin soit INCLUSIVE
            // Donc on GARDE la date de fin telle quelle (pas +1 jour)
            const endDate = new Date(vacation.end_date);
            
            // POUR FullCalendar, il faut AJOUTER 1 jour seulement pour l'affichage
            // car FullCalendar traite la date de fin comme exclusive
            const fullCalendarEndDate = new Date(endDate);
            fullCalendarEndDate.setDate(fullCalendarEndDate.getDate() + 1);

            return {
                id: vacation.id,
                title: `${vacation.period_name} - Zone ${vacation.zone}`,
                start: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                end: fullCalendarEndDate.toISOString().split('T')[0], // Format YYYY-MM-DD + 1 jour pour FullCalendar
                backgroundColor: getColorForZone(vacation.zone),
                borderColor: getColorForZone(vacation.zone),
                textColor: '#ffffff',
                allDay: true,
                extendedProps: {
                    zone: vacation.zone,
                    schoolYear: vacation.school_year,
                    // Les vraies dates pour les vérifications
                    realStartDate: vacation.start_date,
                    realEndDate: vacation.end_date
                }
            };
        });

        res.status(200).json({
            success: true,
            count: vacations.length,
            data: calendarData
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération du calendrier des vacances',
            error: error.message
        });
    }
};

// Fonction utilitaire à ajouter en haut du fichier
const getColorForZone = (zone) => {
    switch (zone) {
        case 'A': return '#4285F4'; // Bleu
        case 'B': return '#EA4335'; // Rouge
        case 'C': return '#34A853'; // Vert
        default: return '#FBBC05';  // Jaune
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

// Récupérer les vacances au format de l'API gouvernementale
exports.getRawVacationData = async (req, res) => {
    try {
        const { zone, schoolYear, location } = req.query;

        // Construction de l'URL de l'API
        let apiUrl = 'https://data.education.gouv.fr/api/records/1.0/search/'
            + '?dataset=fr-en-calendrier-scolaire'
            + '&q='
            + '&rows=100'
            + '&facet=description&facet=population&facet=start_date&facet=end_date&facet=zones&facet=annee_scolaire';

        // Ajouter les filtres si présents
        if (zone) apiUrl += `&refine.zones=Zone+${zone}`;
        if (schoolYear) apiUrl += `&refine.annee_scolaire=${schoolYear}`;
        if (location) apiUrl += `&refine.location=${encodeURIComponent(location)}`;

        const response = await axios.get(apiUrl);

        // Extraire les champs pertinents
        const formattedData = response.data.records.map(record => record.fields);

        res.status(200).json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des données brutes de vacances',
            error: error.message
        });
    }
};

// formater au format requis
exports.getVacationsInGovernmentFormat = async (req, res) => {
    try {
        const { zone, schoolYear, location } = req.query;
        let whereClause = {};

        if (zone) whereClause.zone = zone;
        if (schoolYear) whereClause.school_year = schoolYear;

        const vacations = await School_Vacations.findAll({
            where: whereClause,
            order: [['start_date', 'ASC']]
        });

        // Transformer au format de l'API gouvernementale
        const formattedData = vacations.map(vacation => ({
            description: vacation.period_name,
            population: "Élèves",
            start_date: vacation.start_date.toISOString(),
            end_date: vacation.end_date.toISOString(),
            location: location || "Toutes académies",
            zones: `Zone ${vacation.zone}`,
            annee_scolaire: vacation.school_year
        }));

        res.status(200).json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des données formatées de vacances',
            error: error.message
        });
    }
};

// Synchronisation vacances scolaires API gouvernement
// - Sync automatique depuis data.education.gouv.fr
// - Gestion zones A/B/C et années scolaires
// - Format calendrier FullCalendar
// - Vérification si date = vacances