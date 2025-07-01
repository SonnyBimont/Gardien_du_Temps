// src/validators/userValidator.js
const { body, validationResult } = require('express-validator');

// Middleware pour valider les données utilisateur lors de la création ou de la mise à jour
exports.validateUser = [
    body('email').isEmail().withMessage('Veuillez fournir un email valide'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('last_name').notEmpty().withMessage('Le nom est requis'),
    body('first_name').notEmpty().withMessage('Le prénom est requis'),
    body('role')
        .isIn(['admin', 'director', 'animator'])
        .withMessage('Le rôle doit être admin, director ou animator'),
    body('structure_id').isInt().withMessage('L\'ID de la structure doit être un entier'),

    // Middleware qui vérifie les résultats de validation
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];