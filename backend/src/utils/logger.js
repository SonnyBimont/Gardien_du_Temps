// Logger sécurisé avec Winston
const winston = require('winston');
const config = require('../config/config');

// Configuration du logger sécurisé
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    // Filtre pour masquer les données sensibles
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      // Masquer les tokens, mots de passe, etc.
      const sanitized = JSON.stringify(meta).replace(
        /(token|password|secret|authorization)[":\s]*["']?[^"',\s}]+/gi,
        '$1":"***REDACTED***"'
      );
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...JSON.parse(sanitized)
      });
    })
  ),
  transports: [
    // Console pour développement
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Fichier pour production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Fonction helper pour logs d'authentification
logger.auth = {
  success: (userId, ip) => {
    logger.info('Authentification réussie', {
      userId,
      ip,
      type: 'auth_success'
    });
  },
  failure: (ip, reason = 'token_invalid') => {
    logger.warn('Échec authentification', {
      ip,
      reason,
      type: 'auth_failure'
    });
  },
  bruteForce: (ip, attempts) => {
    logger.error('Tentative de force brute détectée', {
      ip,
      attempts,
      type: 'brute_force'
    });
  }
};

module.exports = logger;