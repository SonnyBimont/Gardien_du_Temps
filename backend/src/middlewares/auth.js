const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
    try {
        // 1. Vérifier si le token existe
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('🎫 Token trouvé:', token ? 'OUI' : 'NON');
        }

        if (!token) {
            console.error('❌ Pas de token');
            return res.status(401).json({ message: 'Accès non autorisé' });
        }

        // 2. Vérifier la validité du token
        const decoded = jwt.verify(token, config.jwt.secret);

        // 3. Vérifier si l'utilisateur existe toujours
        const user = await User.findByPk(decoded.id);
        if (!user || !user.active) {
            return res.status(401).json({ message: 'Cet utilisateur n\'existe plus ou est désactivé' });
        }

        // 4. Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Erreur auth middleware:', error);
        return res.status(401).json({ message: 'Accès non autorisé' });
    }
};
// Middleware pour vérifier les rôles d'utilisateur
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
        }
        next();
    };
};