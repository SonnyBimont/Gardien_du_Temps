const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

        // 3. Vérifier si l'utilisateur est déjà en cache
        const cacheKey = `user_${decoded.id}`;
        const cached = userCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            req.user = cached.user;
        return next();
}
        // 4. Vérifier si l'utilisateur existe toujours
        const user = await User.findByPk(decoded.id);
        if (!user || !user.active) {
            return res.status(401).json({ message: 'Cet utilisateur n\'existe plus ou est désactivé' });
        }

        // 5. Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
    }
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