/**
 * VALIDATEURS POUR LES DONNÉES UTILISATEUR
 * 
 * Utilise express-validator pour valider les données d'entrée des utilisateurs.
 * Inclut la validation des champs requis et le formatage des erreurs.
 * 
 * Validations :
 * - Email valide
 * - Mot de passe (min 6 caractères)
 * - Nom/prénom requis
 * - Rôle dans la liste autorisée
 * - Structure ID numérique
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware de validation pour création/modification d'utilisateur
 * 
 * @type {Array} Tableau de middlewares express-validator
 * 
 * Règles de validation :
 * - Email format valide
 * - Mot de passe minimum 6 caractères
 * - Nom et prénom obligatoires
 * - Rôle parmi admin/director/animator
 * - Structure ID entier
 */
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

    // Middleware final qui traite les erreurs de validation
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];