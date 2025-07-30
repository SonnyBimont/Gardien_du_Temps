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
            whereClause.action_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (userId) {
            whereClause.user_id = userId;
        }

        if (action) {
            whereClause.action_type = action;
        }

        const logs = await Activity_Log.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: [['action_date', 'DESC']]
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

// Rechercher dans les logs d'activité avec options de tri
exports.searchLogs = async (req, res) => {
    try {
        const { query, sortBy, sortOrder, userId } = req.query;
        let whereClause = {};
        let orderArray = [['action_date', 'DESC']]; // Tri par défaut

        // Si userId est spécifié, filtrer par utilisateur
        if (userId) {
            whereClause.user_id = userId;
        }

        // Gestion des options de tri
        if (sortBy) {
            const validSortFields = ['action_type', 'action_date', 'description'];
            const validSortOrders = ['ASC', 'DESC'];

            // Vérifier si le champ de tri est valide
            if (validSortFields.includes(sortBy)) {
                // Déterminer l'ordre de tri (ASC ou DESC)
                const order = validSortOrders.includes(sortOrder?.toUpperCase())
                    ? sortOrder.toUpperCase()
                    : 'ASC';

                // Remplacer le tri par défaut par celui spécifié
                orderArray = [[sortBy, order]];

                // Si on trie par utilisateur, il faut utiliser une approche différente
                if (sortBy === 'user') {
                    orderArray = [[{ model: User, as: 'user' }, 'last_name', order], [{ model: User, as: 'user' }, 'first_name', order]];
                }
            }
        }

        // Si query n'existe pas, retourner tous les logs avec le tri demandé
        if (!query) {
            const logs = await Activity_Log.findAll({
                where: whereClause,
                include: [
                    { model: User, as: 'user', attributes: { exclude: ['password'] } }
                ],
                order: orderArray
            });

            return res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });
        }

        // Liste des valeurs enum possibles
        const actionTypes = ['login', 'creation', 'modification', 'deletion'];

        // Vérifier si la requête correspond à une des valeurs enum
        const matchingActionTypes = actionTypes.filter(type =>
            type.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingActionTypes.length > 0) {
            // Si oui, utiliser Op.in pour les types d'action
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { action_type: { [Op.in]: matchingActionTypes } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            };
        } else {
            // Sinon, rechercher uniquement dans la description
            whereClause = {
                ...whereClause,
                description: { [Op.like]: `%${query}%` }
            };
        }

        const logs = await Activity_Log.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password'] } }
            ],
            order: orderArray
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la recherche dans les logs d\'activité',
            error: error.message
        });
    }
};

// Gestion des logs d'activité système
// - CRUD complet pour Activity_Log
// - Recherche avancée avec tri et filtres
// - Filtrage par utilisateur, date, type d'action
// - Inclusion automatique des données utilisateur