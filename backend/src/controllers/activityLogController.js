const { Activity_Log, User } = require('../models');
const { Op } = require('sequelize');

// Récupérer tous les logs d'activité
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await Activity_Log.findAll({
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des logs d\'activité', error: error.message });
    }
};

// Récupérer un log d'activité par ID
exports.getLogById = async (req, res) => {
    try {
        const log = await Activity_Log.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        if (!log) {
            return res.status(404).json({ message: 'Log d\'activité non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du log d\'activité', error: error.message });
    }
};

// Créer un nouveau log d'activité
exports.createLog = async (req, res) => {
    try {
        const log = await Activity_Log.create({
            ...req.body,
            user_id: req.user.id // Prend l'ID de l'utilisateur connecté
        });

        const newLog = await Activity_Log.findByPk(log.id, {
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ]
        });

        res.status(201).json({
            success: true,
            data: newLog
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du log d\'activité', error: error.message });
    }
};

// Supprimer un log d'activité (réservé aux administrateurs)
exports.deleteLog = async (req, res) => {
    try {
        const deleted = await Activity_Log.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Log d\'activité non trouvé' });
        }

        res.status(200).json({
            success: true,
            message: 'Log d\'activité supprimé avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression du log d\'activité', error: error.message });
    }
};

// Récupérer les logs d'activité par utilisateur
exports.getLogsByUser = async (req, res) => {
    try {
        const logs = await Activity_Log.findAll({
            where: { user_id: req.params.userId },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des logs d\'activité', error: error.message });
    }
};

// Récupérer les logs d'activité par période
exports.getLogsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, userId, action } = req.query;
        let whereClause = {};

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (userId) {
            whereClause.user_id = userId;
        }

        if (action) {
            whereClause.action = action;
        }

        const logs = await Activity_Log.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des logs d\'activité', error: error.message });
    }
};

// Rechercher dans les logs d'activité
exports.searchLogs = async (req, res) => {
    try {
        const { query } = req.query;

        const logs = await Activity_Log.findAll({
            where: {
                [Op.or]: [
                    { action: { [Op.iLike]: `%${query}%` } },
                    { details: { [Op.iLike]: `%${query}%` } }
                ]
            },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la recherche dans les logs d\'activité', error: error.message });
    }
};