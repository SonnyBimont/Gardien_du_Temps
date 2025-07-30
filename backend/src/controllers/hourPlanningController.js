const { Hour_Planning, Project, User } = require('../models');
const { Op } = require('sequelize');

// Récupérer la planification annuelle
exports.getYearlyPlanning = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const userId = req.user.role === 'animator' ? req.user.id : req.query.userId || req.user.id;

    const planning = await Hour_Planning.findAll({
      where: {
        user_id: userId,
        plan_date: {
          [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
        }
      },
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      order: [['plan_date', 'ASC']]
    });

    // Récupérer l'objectif annuel
    const user = await User.findByPk(userId, { attributes: ['annual_hours'] });
    const annualObjective = user?.annual_hours || 1600;
    const totalPlanned = planning.reduce((sum, p) => sum + parseFloat(p.planned_hours), 0);

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        annual_objective: annualObjective,
        total_planned: Math.round(totalPlanned * 100) / 100,
        remaining_hours: Math.round((annualObjective - totalPlanned) * 100) / 100,
        completion_rate: Math.round((totalPlanned / annualObjective) * 100 * 100) / 100,
        planning
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la planification',
      error: error.message
    });
  }
};

// Créer/modifier une planification
exports.upsertPlanning = async (req, res) => {
  try {
    console.log('🎯 DEBUT upsertPlanning');
    console.log('👤 User:', req.user ? req.user.id : 'NON AUTHENTIFIE');
    console.log('📦 Body reçu:', req.body);

    const { plan_date, planned_hours, project_id = null, color = '#3B82F6', description = '' } = req.body;

    // Validation des champs requis
    if (!plan_date) {
      console.error('❌ plan_date manquant');
      return res.status(400).json({
        success: false,
        message: 'La date de planification est obligatoire',
        error: 'Missing plan_date field'
      });
    }

    // Accepter 0 pour la suppression
    if (planned_hours === null || planned_hours === undefined || isNaN(planned_hours)) {
      console.error('❌ planned_hours invalide:', planned_hours);
      return res.status(400).json({
        success: false,
        message: 'Le nombre d\'heures doit être un nombre valide',
        error: 'Invalid planned_hours field'
      });
    }

    const hoursValue = parseFloat(planned_hours);
    if (hoursValue < 0 || hoursValue > 24) {
      console.error('❌ planned_hours hors limite:', hoursValue);
      return res.status(400).json({
        success: false,
        message: 'Le nombre d\'heures doit être entre 0 et 24',
        error: 'planned_hours out of range'
      });
    }

    if (!req.user || !req.user.id) {
      console.error('❌ Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
        error: 'Unauthorized'
      });
    }

    console.log('✅ Validation OK, tentative upsert...');

    // GESTION SUPPRESSION : Si 0 heures, supprimer l'enregistrement
    if (hoursValue === 0) {
      console.log('🗑️ Suppression demandée (0 heures)');
      
      const deleted = await Hour_Planning.destroy({
        where: {
          user_id: req.user.id,
          plan_date: plan_date
        }
      });
      
      console.log('✅ Lignes supprimées:', deleted);
      
      return res.status(200).json({
        success: true,
        message: 'Planification supprimée',
        data: null
      });
    }

    // CREATION/MODIFICATION normale
    const dataToInsert = {
      user_id: req.user.id,
      plan_date,
      planned_hours: hoursValue,
      project_id: project_id || null,
      color,
      description: description?.trim() || ''
    };

    console.log('📝 Données à insérer:', dataToInsert);

    const [planning] = await Hour_Planning.upsert(dataToInsert, { returning: true });

    console.log('✅ Planning sauvegardé:', planning.toJSON());

    res.status(200).json({
      success: true,
      data: planning
    });
  } catch (error) {
    console.error('❌ ERREUR UPSERT PLANNING:', error);
    console.error('📍 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde',
      error: error.message
    });
  }
};

// Planification annuelle détaillée
// - Upsert planning avec validation 0-24h
// - Suppression automatique si 0h
// - Calculs objectifs annuels