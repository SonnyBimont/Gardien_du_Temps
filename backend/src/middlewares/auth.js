const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');
const logger = require('../utils/logger');

// Cache simple en mémoire (en production, utiliser Redis)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
    try {
        // 1. Vérifier si le token existe
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            // Log sécurisé
            logger.debug('Token d\'authentification reçu', { hasToken: !!token });
        }

        if (!token) {
            // Log avec IP pour monitoring
            logger.auth.failure(req.ip, 'no_token');
            return res.status(401).json({ 
                success: false,
                message: 'Accès non autorisé - Token manquant' 
            });
        }

        // 2. Vérifier la validité du token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (jwtError) {
            // Gestion spécifique des erreurs JWT
            let reason = 'token_invalid';
            let message = 'Token invalide';
            
            if (jwtError.name === 'TokenExpiredError') {
                reason = 'token_expired';
                message = 'Token expiré';
            } else if (jwtError.name === 'JsonWebTokenError') {
                reason = 'token_malformed';
                message = 'Format de token invalide';
            }
            
            logger.auth.failure(req.ip, reason);
            return res.status(401).json({ 
                success: false,
                message 
            });
        }

        // 3. Vérifier l'utilisateur (avec cache)
        let user;
        const cacheKey = `user_${decoded.id}`;
        const cached = userCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            // Utiliser le cache
            user = cached.user;
            logger.debug('Utilisateur récupéré depuis le cache', { userId: decoded.id });
        } else {
            // Récupérer depuis la BDD
            user = await User.findByPk(decoded.id, {
                attributes: ['id', 'email', 'role', 'active', 'first_name', 'last_name']
            });
            
            if (user) {
                // Mettre en cache
                userCache.set(cacheKey, {
                    user: user.toJSON(),
                    timestamp: Date.now()
                });
            }
        }

        if (!user || !user.active) {
            logger.auth.failure(req.ip, 'user_not_found_or_inactive');
            return res.status(401).json({ 
                success: false,
                message: 'Utilisateur non trouvé ou désactivé' 
            });
        }

        // 4. Succès - Ajouter l'utilisateur à la requête
        req.user = user;
        logger.auth.success(user.id, req.ip);
        next();

    } catch (error) {
        // Log détaillé pour debug
        logger.error('Erreur dans le middleware d\'authentification', {
            error: error.message,
            stack: config.nodeEnv === 'development' ? error.stack : undefined,
            ip: req.ip
        });
        
        return res.status(401).json({ 
            success: false,
            message: 'Erreur d\'authentification' 
        });
    }
};

// Middleware pour vérifier les rôles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            logger.error('authorize() appelé sans utilisateur authentifié');
            return res.status(401).json({ 
                success: false,
                message: 'Authentification requise' 
            });
        }

        if (!roles.includes(req.user.role)) {
            logger.warn('Accès refusé - Rôle insuffisant', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                ip: req.ip
            });
            
            return res.status(403).json({ 
                success: false,
                message: 'Permissions insuffisantes' 
            });
        }

        logger.debug('Autorisation accordée', {
            userId: req.user.id,
            role: req.user.role
        });
        
        next();
    };
};

// Fonction pour nettoyer le cache
exports.clearUserCache = (userId) => {
    userCache.delete(`user_${userId}`);
    logger.debug('Cache utilisateur nettoyé', { userId });
};