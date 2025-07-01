const { Time_Tracking, User, Task} = require('../models');
const { Op } = require('sequelize');

// Récupérer tous les pointages
exports.getAllTimeEntries = async (req, res) => {
    try {
        const timeEntries = await Time_Tracking.findAll({
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        res.status(200).json({
            success: true,
            count: timeEntries.length,
            data: timeEntries
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des pointages', error: error.message });
    }
};

// Récupérer un pointage par ID
exports.getTimeEntryById = async (req, res) => {
    try {
        const timeEntry = await Time_Tracking.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        if (!timeEntry) {
            return res.status(404).json({ message: 'Pointage non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: timeEntry
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du pointage', error: error.message });
    }
};

// Créer un nouveau pointage
exports.createTimeEntry = async (req, res) => {
    try {
        const timeEntry = await Time_Tracking.create(req.body);

        const newTimeEntry = await Time_Tracking.findByPk(timeEntry.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        res.status(201).json({
            success: true,
            data: newTimeEntry
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du pointage', error: error.message });
    }
};

// Mettre à jour un pointage
exports.updateTimeEntry = async (req, res) => {
    try {
        const [updated] = await Time_Tracking.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Pointage non trouvé' });
        }

        const updatedTimeEntry = await Time_Tracking.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        res.status(200).json({
            success: true,
            data: updatedTimeEntry
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du pointage', error: error.message });
    }
};

// Supprimer un pointage
exports.deleteTimeEntry = async (req, res) => {
    try {
        const deleted = await Time_Tracking.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Pointage non trouvé' });
        }

        res.status(200).json({
            success: true,
            message: 'Pointage supprimé avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression du pointage', error: error.message });
    }
};

// Récupérer les pointages par utilisateur
exports.getTimeEntriesByUser = async (req, res) => {
    try {
        const timeEntries = await Time_Tracking.findAll({
            where: { user_id: req.params.userId },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        res.status(200).json({
            success: true,
            count: timeEntries.length,
            data: timeEntries
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des pointages', error: error.message });
    }
};

// Récupérer les pointages par période
exports.getTimeEntriesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, userId, yearType } = req.query;
    console.log('🔍 Backend timeTracking params:', { startDate, endDate, userId, yearType });
    
    let whereClause = {};

    if (startDate && endDate) {
      whereClause.date_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
      console.log('📅 Backend période:', { startDate, endDate });
    }

    if (userId) {
      whereClause.user_id = userId;
    }

    const timeEntries = await Time_Tracking.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Task, as: 'task' }
      ],
      order: [['date_time', 'ASC']]
    });

    console.log(`📊 Backend trouvé: ${timeEntries.length} entrées pour la période`);

    res.status(200).json({
      success: true,
      count: timeEntries.length,
      data: timeEntries
    });
  } catch (error) {
    console.error('❌ Erreur backend timeTracking:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des pointages', error: error.message });
  }
};

// Récupérer les entrées de temps pour une période spécifique
exports.getTimeEntriesRange = async (req, res) => {
  try {
    const { startDate, endDate, userId, yearType } = req.query;
    const targetUserId = userId || req.user.id;

    // ✅ NOUVEAU : Si yearType et année fournis, calculer les bornes automatiquement
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (yearType && req.query.year) {
      const year = parseInt(req.query.year);
      const bounds = getYearBounds(year, yearType);
      finalStartDate = bounds.startDate;
      finalEndDate = bounds.endDate;
    }

    if (!finalStartDate || !finalEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }

    const entries = await TimeEntry.findAll({
      where: {
        user_id: targetUserId,
        date_time: {
          [Op.between]: [
            new Date(finalStartDate + 'T00:00:00.000Z'),
            new Date(finalEndDate + 'T23:59:59.999Z')
          ]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'email']
      }],
      order: [['date_time', 'ASC']]
    });

    res.json({
      success: true,
      data: entries,
      period: {
        startDate: finalStartDate,
        endDate: finalEndDate,
        yearType: yearType || 'civil'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des entrées de temps:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

//AJOUT REPORTING ET CALCUL
// Pointages du jour (pour frontend)
exports.getTodayEntries = async (req, res) => {
    try {
        const userId = req.user.role === 'admin' || req.user.role === 'director' 
            ? req.query.userId 
            : req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let whereClause = {
            date_time: {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            }
        };

        if (userId) {
            whereClause.user_id = userId;
        }

        const timeEntries = await Time_Tracking.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ],
            order: [['date_time', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: timeEntries.length,
            data: timeEntries,
            meta: {
                date: today.toISOString().split('T')[0],
                user_id: userId
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des pointages du jour', 
            error: error.message 
        });
    }
};

// Pointage rapide (clock-in/out)
exports.quickTimeEntry = async (req, res) => {
    try {
        const { tracking_type, task_id, comment } = req.body;
        const userId = req.user.id;
        const now = new Date();

        // Récupérer les pointages d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayEntries = await Time_Tracking.findAll({
            where: {
                user_id: userId,
                date_time: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            order: [['date_time', 'ASC']]
        });

        const hasArrival = todayEntries.some(e => e.tracking_type === 'arrival');
        const hasDeparture = todayEntries.some(e => e.tracking_type === 'departure');
        const hasBreakStart = todayEntries.some(e => e.tracking_type === 'break_start');
        const hasBreakEnd = todayEntries.some(e => e.tracking_type === 'break_end');

        // Validation logique métier AMÉLIORÉE
        switch (tracking_type) {
            case 'arrival':
                if (hasArrival) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous avez déjà pointé votre arrivée aujourd\'hui'
                    });
                }
                break;
                
            case 'break_start':
                if (!hasArrival) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous devez d\'abord pointer votre arrivée'
                    });
                }
                if (hasDeparture) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous avez déjà pointé votre départ'
                    });
                }
                break;
                
case 'break_end':
  // Vérifier qu'il y a une pause en cours
  const lastBreakStart = todayEntries
    .filter(e => e.tracking_type === 'break_start')
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0];
  
  const lastBreakEnd = todayEntries
    .filter(e => e.tracking_type === 'break_end')
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0];
  
  if (!lastBreakStart || (lastBreakEnd && new Date(lastBreakEnd.date_time) > new Date(lastBreakStart.date_time))) {
    return res.status(400).json({
      success: false,
      message: 'Vous n\'êtes pas en pause'
    });
  }
  break;
                
            case 'departure':
                if (!hasArrival) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous devez d\'abord pointer votre arrivée'
                    });
                }
                if (hasDeparture) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous avez déjà pointé votre départ aujourd\'hui'
                    });
                }
                if (hasBreakStart && !hasBreakEnd) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vous devez terminer votre pause avant de partir'
                    });
                }
                break;
        }

        // Créer l'entrée
        const timeEntry = await Time_Tracking.create({
            user_id: userId,
            task_id: task_id || null,
            date_time: now,
            tracking_type,
            comment: comment || null,
            validated: false
        });

        const newTimeEntry = await Time_Tracking.findByPk(timeEntry.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        const messages = {
            arrival: 'Arrivée enregistrée avec succès',
            break_start: 'Début de pause enregistré avec succès',
            break_end: 'Fin de pause enregistrée avec succès',
            departure: 'Départ enregistré avec succès'
        };

        res.status(201).json({
            success: true,
            message: messages[tracking_type],
            data: newTimeEntry
        });
    } catch (error) {
        console.error('Erreur quickTimeEntry:', error);
        res.status(400).json({ 
            success: false,
            message: 'Erreur lors de l\'enregistrement du pointage', 
            error: error.message 
        });
    }
};

// Statistiques avancées
exports.getTimeStats = async (req, res) => {
    try {
        const { days = 7, userId } = req.query;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'director';
        
        // Si pas admin, forcer son propre userId
        const targetUserId = isAdmin ? userId : req.user.id;
        
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - parseInt(days));
        
        let whereClause = {
            date_time: { [Op.gte]: periodStart }
        };
        
        if (targetUserId) {
            whereClause.user_id = targetUserId;
        }

        // CORRIGER : Utiliser db.sequelize au lieu de sequelize
        const db = require('../models');
        
        // Statistiques globales
        const totalEntries = await Time_Tracking.count({
            where: whereClause
        });

        const uniqueUsers = await Time_Tracking.count({
            where: whereClause,
            distinct: true,
            col: 'user_id'
        });

        // Statistiques aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEntries = await Time_Tracking.count({
            where: {
                ...whereClause,
                date_time: { [Op.gte]: today }
            }
        });

        const todayUsers = await Time_Tracking.count({
            where: {
                ...whereClause,
                date_time: { [Op.gte]: today }
            },
            distinct: true,
            col: 'user_id'
        });

        // Version simplifiée des heures travaillées
        const workHours = await Time_Tracking.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('date_time')), 'work_date'],
                'user_id',
                'tracking_type',
                'date_time'
            ],
            where: whereClause,
            order: [['date_time', 'ASC']],
            raw: true
        });

        // Calculer moyenne des heures (version simple)
        const averageHours = 7.5; // Placeholder - calcul complexe à faire plus tard

        res.status(200).json({
            success: true,
            data: {
                period: {
                    days: parseInt(days),
                    total_entries: totalEntries || 0,
                    unique_users: uniqueUsers || 0
                },
                today: {
                    entries: todayEntries || 0,
                    active_users: todayUsers || 0
                },
                work_hours: {
                    average_daily: averageHours,
                    total_days_worked: workHours.length,
                    details: []
                }
            }
        });
    } catch (error) {
        console.error('Erreur getTimeStats:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des statistiques', 
            error: error.message 
        });
    }
};

// Rapport mensuel
exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year, userId } = req.query;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'director';
        const targetUserId = isAdmin ? userId : req.user.id;

        const reportMonth = month || new Date().getMonth() + 1;
        const reportYear = year || new Date().getFullYear();

        const startDate = new Date(reportYear, reportMonth - 1, 1);
        const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

        let whereClause = {
            date_time: { [Op.between]: [startDate, endDate] }
        };

        if (targetUserId) {
            whereClause.user_id = targetUserId;
        }

        // Récupérer tous les pointages du mois
        const monthlyEntries = await Time_Tracking.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ],
            order: [['date_time', 'ASC']]
        });

        // Grouper par jour et calculer les heures
        const dailyReport = {};
        
        monthlyEntries.forEach(entry => {
            const date = entry.date_time.toISOString().split('T')[0];
            const userId = entry.user_id;
            
            if (!dailyReport[date]) {
                dailyReport[date] = {};
            }
            
            if (!dailyReport[date][userId]) {
                dailyReport[date][userId] = {
                    user: entry.user,
                    entries: [],
                    arrival: null,
                    departure: null,
                    hours_worked: 0
                };
            }
            
            dailyReport[date][userId].entries.push(entry);
            
            if (entry.tracking_type === 'arrival') {
                dailyReport[date][userId].arrival = entry.date_time;
            }
            if (entry.tracking_type === 'departure') {
                dailyReport[date][userId].departure = entry.date_time;
            }
        });

        // Calculer les heures pour chaque jour
        Object.keys(dailyReport).forEach(date => {
            Object.keys(dailyReport[date]).forEach(userId => {
                const dayData = dailyReport[date][userId];
                if (dayData.arrival && dayData.departure) {
                    const hours = (new Date(dayData.departure) - new Date(dayData.arrival)) / (1000 * 60 * 60);
                    dayData.hours_worked = Math.round(hours * 100) / 100;
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                month: reportMonth,
                year: reportYear,
                total_entries: monthlyEntries.length,
                daily_report: dailyReport
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la génération du rapport mensuel', 
            error: error.message 
        });
    }
};

// Récupérer le résumé de l'équipe
exports.getTeamSummary = async (req, res) => {
  try {
    const { days = 30, userId, structureId } = req.query;
    const userStructureId = req.user.structure_id;
    
    // Les directeurs ne peuvent voir que leur structure
    const targetStructureId = req.user.role === 'admin' ? structureId : userStructureId;
    
    if (!targetStructureId) {
      return res.status(400).json({
        success: false,
        message: 'Structure non définie'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Récupérer les utilisateurs de la structure
    const structureUsers = await User.findAll({
      where: {
        structure_id: targetStructureId,
        role: 'animator',
        active: true
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'weekly_hours', 'annual_hours']
    });

    // Récupérer les entrées de temps
    const timeEntries = await Time_Tracking.findAll({
      where: {
        user_id: { [Op.in]: structureUsers.map(u => u.id) },
        date_time: { [Op.gte]: startDate }
      },
      order: [['date_time', 'ASC']]
    });

    // Calculer les heures par utilisateur
    const userSummaries = structureUsers.map(user => {
      const userEntries = timeEntries.filter(entry => entry.user_id === user.id);
      
      // Grouper par jour
      const dayGroups = {};
      userEntries.forEach(entry => {
        const date = entry.date_time.toISOString().split('T')[0];
        if (!dayGroups[date]) {
          dayGroups[date] = [];
        }
        dayGroups[date].push(entry);
      });

      // Calculer les heures travaillées
      let totalHours = 0;
      Object.keys(dayGroups).forEach(date => {
        const dayEntries = dayGroups[date];
        const arrival = dayEntries.find(e => e.tracking_type === 'arrival');
        const departure = dayEntries.find(e => e.tracking_type === 'departure');
        const breakStart = dayEntries.find(e => e.tracking_type === 'break_start');
        const breakEnd = dayEntries.find(e => e.tracking_type === 'break_end');

        if (arrival && departure) {
          let dayHours = (new Date(departure.date_time) - new Date(arrival.date_time)) / (1000 * 60 * 60);
          
          // Soustraire les pauses
          if (breakStart && breakEnd) {
            const breakDuration = (new Date(breakEnd.date_time) - new Date(breakStart.date_time)) / (1000 * 60 * 60);
            dayHours -= breakDuration;
          }
          
          totalHours += Math.max(0, dayHours);
        }
      });

      // Calculer l'objectif pour la période
      const weeklyHours = user.weekly_hours || 35;
      const annualHours = user.annual_hours;
  
  let periodObjective;
  
  // Calculer selon le nombre de jours de la période
  if (parseInt(days) <= 7) {
    // Période hebdomadaire
    periodObjective = weeklyHours;
  } else if (parseInt(days) <= 31) {
    // Période mensuelle (jusqu'à 31 jours)
    periodObjective = weeklyHours * 4.33;
  } else if (parseInt(days) <= 92) {
    // Période trimestrielle (jusqu'à 92 jours)
    periodObjective = weeklyHours * 13;
  } else {
    // Période annuelle (plus de 92 jours) - ✅ UTILISER annual_hours
    periodObjective = annualHours || (weeklyHours * 52);
  }

      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          weekly_hours: user.weekly_hours,
          annual_hours: user.annual_hours
        },
        totalHours: Math.round(totalHours * 100) / 100,
        periodObjective: Math.round(periodObjective * 100) / 100,
        hoursDifference: Math.round((totalHours - periodObjective) * 100) / 100, // AJOUTER cette ligne
        daysWorked: Object.keys(dayGroups).length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        period_days: parseInt(days),
        structure_id: targetStructureId,
        users: userSummaries,
        total_users: userSummaries.length,
        total_hours: userSummaries.reduce((sum, u) => sum + u.totalHours, 0)
      }
    });

  } catch (error) {
    console.error('Erreur getTeamSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du résumé d\'équipe',
      error: error.message
    });
  }
};

// Récupérer l'année scolaire à partir d'une date
exports.getSchoolYear = (date) => {
  const d = new Date(date);
  const month = d.getMonth(); // 0-11
  const year = d.getFullYear();
  
  // Si on est entre janvier et août (mois 0-7), on est dans l'exercice de l'année précédente
  return month >= 8 ? year : year - 1; // 8 = septembre
};

// Récupérer les bornes d'une année selon le type
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

// Gestion du pointage et suivi du temps
// - CRUD pointages avec validations métier
// - Pointage rapide (clock-in/out) avec logique anti-doublon
// - Rapports mensuels et statistiques équipe