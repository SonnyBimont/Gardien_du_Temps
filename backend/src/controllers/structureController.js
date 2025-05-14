const { Structure, User } = require('../models');

// Récupérer toutes les structures
exports.getStructures = async (req, res) => {
    try {
        const structures = await Structure.findAll({
            include: [{ model: User, as: 'users', attributes: { exclude: ['password'] } }]
        });

        res.status(200).json({
            success: true,
            count: structures.length,
            data: structures
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des structures', error: error.message });
    }
};

// Récupérer une structure par son ID
exports.getStructureById = async (req, res) => {
    try {
        const structure = await Structure.findByPk(req.params.id, {
            include: [{ model: User, as: 'users', attributes: { exclude: ['password'] } }]
        });

        if (!structure) {
            return res.status(404).json({ message: 'Structure non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: structure
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la structure', error: error.message });
    }
};

// Créer une nouvelle structure
exports.createStructure = async (req, res) => {
    try {
        const structure = await Structure.create(req.body);

        res.status(201).json({
            success: true,
            data: structure
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la structure', error: error.message });
    }
};

// Mettre à jour une structure
exports.updateStructure = async (req, res) => {
    try {
        const [updated] = await Structure.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Structure non trouvée' });
        }

        const updatedStructure = await Structure.findByPk(req.params.id);

        res.status(200).json({
            success: true,
            data: updatedStructure
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour de la structure', error: error.message });
    }
};

// Supprimer une structure (ou désactiver)
exports.deleteStructure = async (req, res) => {
    try {
        // Option 1 : Suppression physique
        // const deleted = await Structure.destroy({ where: { id: req.params.id } });

        // Option 2 : Désactivation (recommandée)
        const [updated] = await Structure.update(
            { active: false },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Structure non trouvée' });
        }

        res.status(200).json({
            success: true,
            message: 'Structure désactivée avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de la structure', error: error.message });
    }
};