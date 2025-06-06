const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const config = require('../config/config');

// Générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Vérifier si l'utilisateur existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // 2. Vérifier si le mot de passe est correct
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // 3. Vérifier si l'utilisateur est actif
        if (!user.active) {
            return res.status(401).json({ message: 'Votre compte est désactivé' });
        }

        // 4. Générer un token JWT
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                structure_id: user.structure_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
};

// Déconnexion
exports.logout = async (req, res) => {
    try {
        // Notez que JWT est stateless, donc côté serveur vous ne pouvez pas vraiment "invalider" un token
        // Les approches possibles sont:

        // 1. Mettre le token dans une "blacklist" (nécessite une base de données ou un cache)
        // await BlacklistedToken.create({ token: req.token, expiresAt: ... });

        // 2. Ou simplement dire au client de supprimer le token

        res.status(200).json({
            success: true,
            message: 'Utilisateur déconnecté avec succès'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la déconnexion',
            error: error.message
        });
    }
};

// Récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: require('../models').Structure,
                as: 'structure',
                attributes: ['id', 'name', 'city']
            }]
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
    }
};

// Rafraîchir le token JWT
exports.refreshToken = async (req, res) => {
    try {
        const user = req.user;

        // Générer un nouveau token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                structure_id: user.structure_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du rafraîchissement du token', error: error.message });
    }
};