const { Planned_Schedule, User } = require('../models');
const { Op } = require('sequelize');

// Récupérer tous les plannings
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Planned_Schedule.findAll({
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des plannings', error: error.message });
    }
};

// Récupérer un planning par ID
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Planned_Schedule.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        if (!schedule) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du planning', error: error.message });
    }
};

// Créer un nouveau planning
exports.createSchedule = async (req, res) => {
    try {
        const schedule = await Planned_Schedule.create(req.body);

        const newSchedule = await Planned_Schedule.findByPk(schedule.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(201).json({
            success: true,
            data: newSchedule
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du planning', error: error.message });
    }
};

// Mettre à jour un planning
exports.updateSchedule = async (req, res) => {
    try {
        const [updated] = await Planned_Schedule.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        const updatedSchedule = await Planned_Schedule.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            data: updatedSchedule
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du planning', error: error.message });
    }
};

// Supprimer un planning
exports.deleteSchedule = async (req, res) => {
    try {
        const deleted = await Planned_Schedule.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        res.status(200).json({
            success: true,
            message: 'Planning supprimé avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression du planning', error: error.message });
    }
};

// Récupérer les plannings par utilisateur
exports.getSchedulesByUser = async (req, res) => {
    try {
        const schedules = await Planned_Schedule.findAll({
            where: { user_id: req.params.userId },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des plannings', error: error.message });
    }
};

// Récupérer les plannings par période
exports.getSchedulesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        let whereClause = {};

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (userId) {
            whereClause.user_id = userId;
        }

        const schedules = await Planned_Schedule.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['date', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des plannings', error: error.message });
    }
};

// Récupérer les modèles de planning
exports.getScheduleTemplates = async (req, res) => {
    try {
        const templates = await Planned_Schedule.findAll({
            where: {
                is_template: true,
                user_id: req.query.userId ? req.query.userId : { [Op.ne]: null }
            },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des modèles de planning', error: error.message });
    }
};

// Ajouter les mêmes fonctions utilitaires

exports.getYearBounds = (year, yearType = 'civil') => {
  switch (yearType) {
    case 'school':
      return {
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-08-31`
      };
    case 'civil':
    default:
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`
      };
  }
};

// ✅ MODIFIER : getYearlyPlanning pour supporter yearType
exports.getYearlyPlanning = async (req, res) => {
  try {
    const { userId, startDate, endDate, yearType, year } = req.query;
    const targetUserId = userId || req.user.id;

    // ✅ NOUVEAU : Calculer les bornes si yearType et année fournis
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (yearType && year) {
      const bounds = getYearBounds(parseInt(year), yearType);
      finalStartDate = bounds.startDate;
      finalEndDate = bounds.endDate;
    }

    if (!finalStartDate || !finalEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Les paramètres de période sont requis'
      });
    }

    // Récupérer les planifications dans la période
    const planning = await HourPlanning.findAll({
      where: {
        user_id: targetUserId,
        plan_date: {
          [Op.between]: [finalStartDate, finalEndDate]
        }
      },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'color']
      }],
      order: [['plan_date', 'ASC']]
    });

    // Calculer les statistiques
    const totalPlanned = planning.reduce((sum, p) => sum + parseFloat(p.planned_hours || 0), 0);
    
    // Récupérer l'objectif annuel de l'utilisateur
    const user = await User.findByPk(targetUserId, {
      attributes: ['annual_hours', 'year_type']
    });
    
    const annualObjective = user?.annual_hours || 1600;
    const remainingHours = Math.max(0, annualObjective - totalPlanned);

    res.json({
      success: true,
      data: {
        planning,
        total_planned: Math.round(totalPlanned * 100) / 100,
        annual_objective: annualObjective,
        remaining_hours: Math.round(remainingHours * 100) / 100,
        period: {
          start: finalStartDate,
          end: finalEndDate,
          yearType: yearType || user?.year_type || 'civil'
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la planification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Planification horaires et modèles
// - CRUD plannings avec templates
// - Filtrage par période et utilisateur
// - Support années scolaires/civiles