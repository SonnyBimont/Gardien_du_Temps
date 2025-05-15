const { Time_Tracking, User, Task } = require('../models');

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
            whereClause.date = {
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
            order: [['date', 'ASC'], ['start_time', 'ASC']]
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