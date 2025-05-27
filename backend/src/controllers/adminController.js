// backend/src/controllers/adminController.js - AJOUTER CES MÉTHODES

const { User, TimeTracking, Task, Structure } = require('../models');
const { Op } = require('sequelize');

// Statistiques générales admin
exports.getStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const [totalUsers, totalEntries, activeUsers] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'admin' } } }),
      TimeTracking.count({
        where: {
          date_time: { [Op.gte]: startDate }
        }
      }),
      TimeTracking.count({
        distinct: true,
        col: 'user_id',
        where: {
          date_time: { [Op.gte]: startDate }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers,
        total_entries: totalEntries,
        active_users: activeUsers,
        period_days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

// Statistiques dashboard admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [totalUsers, todayEntries, totalStructures] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'admin' } } }),
      TimeTracking.count({
        where: {
          date_time: {
            [Op.gte]: new Date(today + 'T00:00:00.000Z'),
            [Op.lt]: new Date(today + 'T23:59:59.999Z')
          }
        }
      }),
      Structure.count()
    ]);

    // Utilisateurs actifs aujourd'hui
    const activeUsersToday = await TimeTracking.count({
      distinct: true,
      col: 'user_id',
      where: {
        date_time: {
          [Op.gte]: new Date(today + 'T00:00:00.000Z'),
          [Op.lt]: new Date(today + 'T23:59:59.999Z')
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers,
        today_entries: todayEntries,
        active_users_today: activeUsersToday,
        total_structures: totalStructures,
        date: today
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des statistiques dashboard'
    });
  }
};

// Activité récente
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const activities = await TimeTracking.findAll({
      limit: parseInt(limit),
      order: [['date_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          include: [
            {
              model: Structure,
              as: 'structure',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Erreur getRecentActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'activité récente'
    });
  }
};