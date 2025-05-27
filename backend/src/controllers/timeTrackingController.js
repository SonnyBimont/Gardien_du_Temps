const { Time_Tracking, User, Task } = require('../models');
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
        const { startDate, endDate, userId } = req.query;
        let whereClause = {};

        if (startDate && endDate) {
            whereClause.date_time = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
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

        res.status(200).json({
            success: true,
            count: timeEntries.length,
            data: timeEntries
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des pointages', error: error.message });
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

        // Validation logique métier
        if (tracking_type === 'departure') {
            // Vérifier qu'il y a une arrivée aujourd'hui
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayArrival = await Time_Tracking.findOne({
                where: {
                    user_id: userId,
                    tracking_type: 'arrival',
                    date_time: { [Op.gte]: today }
                }
            });

            if (!todayArrival) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous devez d\'abord pointer votre arrivée'
                });
            }

            // Vérifier qu'il n'y a pas déjà un départ
            const todayDeparture = await Time_Tracking.findOne({
                where: {
                    user_id: userId,
                    tracking_type: 'departure',
                    date_time: { [Op.gte]: today }
                }
            });

            if (todayDeparture) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous avez déjà pointé votre départ aujourd\'hui'
                });
            }
        }

        // Créer l'entrée
        const timeEntry = await Time_Tracking.create({
            user_id: userId,
            task_id: task_id || null,
            date_time: now,
            tracking_type,
            comment: comment || null,
            validated: false // Auto-validation selon vos règles métier
        });

        const newTimeEntry = await Time_Tracking.findByPk(timeEntry.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } },
                { model: Task, as: 'task' }
            ]
        });

        res.status(201).json({
            success: true,
            message: `${tracking_type === 'arrival' ? 'Arrivée' : 'Départ'} enregistré avec succès`,
            data: newTimeEntry
        });
    } catch (error) {
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

        // Statistiques globales
        const [totalEntries] = await Time_Tracking.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_entries'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'unique_users']
            ],
            where: whereClause,
            raw: true
        });

        // Statistiques aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [todayStats] = await Time_Tracking.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'today_entries'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'today_users']
            ],
            where: {
                ...whereClause,
                date_time: { [Op.gte]: today }
            },
            raw: true
        });

        // Calcul des heures travaillées (par jour)
        const workHours = await Time_Tracking.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date_time')), 'work_date'],
                'user_id',
                [sequelize.fn('MIN', sequelize.case()
                    .when(sequelize.col('tracking_type'), 'arrival')
                    .then(sequelize.col('date_time'))
                ), 'first_arrival'],
                [sequelize.fn('MAX', sequelize.case()
                    .when(sequelize.col('tracking_type'), 'departure')
                    .then(sequelize.col('date_time'))
                ), 'last_departure']
            ],
            where: whereClause,
            group: ['work_date', 'user_id'],
            having: sequelize.and(
                sequelize.where(sequelize.fn('MIN', sequelize.case()
                    .when(sequelize.col('tracking_type'), 'arrival')
                    .then(sequelize.col('date_time'))
                ), { [Op.ne]: null }),
                sequelize.where(sequelize.fn('MAX', sequelize.case()
                    .when(sequelize.col('tracking_type'), 'departure')
                    .then(sequelize.col('date_time'))
                ), { [Op.ne]: null })
            ),
            raw: true
        });

        // Calculer moyenne des heures
        const averageHours = workHours.length > 0 
            ? workHours.reduce((acc, day) => {
                const arrival = new Date(day.first_arrival);
                const departure = new Date(day.last_departure);
                const hours = (departure - arrival) / (1000 * 60 * 60);
                return acc + hours;
            }, 0) / workHours.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                period: {
                    days: parseInt(days),
                    total_entries: parseInt(totalEntries.total_entries) || 0,
                    unique_users: parseInt(totalEntries.unique_users) || 0
                },
                today: {
                    entries: parseInt(todayStats.today_entries) || 0,
                    active_users: parseInt(todayStats.today_users) || 0
                },
                work_hours: {
                    average_daily: Math.round(averageHours * 100) / 100,
                    total_days_worked: workHours.length,
                    details: workHours
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