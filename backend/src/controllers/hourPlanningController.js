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
    const { plan_date, planned_hours, project_id = null, color = '#3B82F6', description = '' } = req.body;

    const [planning] = await Hour_Planning.upsert({
      user_id: req.user.id,
      plan_date,
      planned_hours: parseFloat(planned_hours),
      project_id,
      color,
      description
    }, { returning: true });

    res.status(200).json({
      success: true,
      data: planning
    });
  } catch (error) {
    console.error('❌ ERREUR UPSERT PLANNING:', error); // <-- AJOUTE CE LOG
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la sauvegarde',
      error: error.message
    });
  }
};