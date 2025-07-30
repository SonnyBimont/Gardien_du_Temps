const rateLimit = require('express-rate-limit');

// Protection login
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Protection API globale
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requêtes par IP/15min
  message: 'Trop de requêtes, réessayez plus tard'
});

// Account lockout après X tentatives
const loginAttempts = new Map();

exports.accountLockout = (req, res, next) => {
  const email = req.body.email;
  const attempts = loginAttempts.get(email) || 0;
  
  if (attempts >= 5) {
    return res.status(429).json({
      message: 'Compte temporairement verrouillé'
    });
  }
  next();
};