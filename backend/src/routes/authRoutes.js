const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: API pour la gestion de l'authentification
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAuth:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         first_name:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         last_name:
 *           type: string
 *           description: Nom de l'utilisateur
 *         role:
 *           type: string
 *           enum: [admin, director, animator]
 *           description: Rôle de l'utilisateur
 *         structure_id:
 *           type: integer
 *           description: ID de la structure associée à l'utilisateur
 *       example:
 *         id: 1
 *         email: "user@example.com"
 *         first_name: "Jean"
 *         last_name: "Dupont"
 *         role: "director"
 *         structure_id: 2
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur
 *       example:
 *         email: "user@example.com"
 *         password: "monMotDePasse123"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token d'authentification
 *                 user:
 *                   $ref: '#/components/schemas/UserAuth'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email ou mot de passe incorrect"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la connexion"
 *                 error:
 *                   type: string
 */
// POST: Authentifie un utilisateur et retourne un token JWT
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                       format: email
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     structure_id:
 *                       type: integer
 *                     contract_type:
 *                       type: string
 *                     weekly_hours:
 *                       type: number
 *                     annual_hours:
 *                       type: number
 *                     contract_start_date:
 *                       type: string
 *                       format: date-time
 *                     contract_end_date:
 *                       type: string
 *                       format: date-time
 *                     active:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès non autorisé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération du profil"
 *                 error:
 *                   type: string
 */
// Route pour récupérer le profil de l'utilisateur connecté
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès non autorisé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la déconnexion"
 *                 error:
 *                   type: string
 */
// Route de déconnexion (côté client - invalide le token)
router.post('/logout', protect, (req, res) => {
    res.status(200).json({ success: true, message: 'Déconnexion réussie' });
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token JWT
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: Nouveau JWT token d'authentification
 *                 user:
 *                   $ref: '#/components/schemas/UserAuth'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès non autorisé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors du rafraîchissement du token"
 *                 error:
 *                   type: string
 */
// Route pour rafraîchir le token JWT
// POST: Génère un nouveau token JWT si l'actuel est valide
router.post('/refresh-token', protect, authController.refreshToken);

module.exports = router;