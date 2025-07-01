// Middleware pour limiter le nombre de requêtes
const rateLimit = require('express-rate-limit');
// const MongoStore = require('rate-limit-mongo');

// Protection contre les attaques par force brute sur l'authentification
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Optionnel : Utiliser Redis/MongoDB pour le stockage
  // store: new MongoStore({
  //   uri: process.env.MONGODB_URI,
  //   collectionName: 'rate_limits',
  //   expireTimeMs: 15 * 60 * 1000
  // }),
  skip: (req) => {
    // Ignorer le rate limiting pour les IPs whitelistées
    const whitelistedIPs = process.env.WHITELIST_IPS?.split(',') || [];
    return whitelistedIPs.includes(req.ip);
  }
});

// Protection générale API
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});

