const { User, Structure } = require('../models');

// Récupérer tous les utilisateurs
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Structure, as: 'structure' }]
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
    }
};

// Récupérer un utilisateur par son ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Structure, as: 'structure' }]
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
    }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
    try {
        // Hachage du mot de passe
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const user = await User.create(req.body);

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                structure_id: user.structure_id
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        // Hachage du mot de passe si fourni
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const [updated] = await User.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
    }
};

// Supprimer un utilisateur (ou désactiver)
exports.deleteUser = async (req, res) => {
    try {
        // Option 1 : Suppression physique
        // const deleted = await User.destroy({ where: { id: req.params.id } });

        // Option 2 : Désactivation (recommandée)
        const [updated] = await User.update(
            { active: false },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            message: 'Utilisateur désactivé avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
    }
};