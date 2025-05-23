const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Logs d'activité
 *   description: API pour la gestion des logs d'activité utilisateur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityLog:
 *       type: object
 *       required:
 *         - user_id
 *         - action_date
 *         - action_type
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du log
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur qui a effectué l'action
 *         action_date:
 *           type: string
 *           format: date-time
 *           description: Date et heure de l'action
 *         action_type:
 *           type: string
 *           enum: [login, creation, modification, deletion]
 *           description: Type d'action effectuée
 *         description:
 *           type: string
 *           description: Description détaillée de l'action
 *         ip_address:
 *           type: string
 *           maxLength: 25
 *           description: Adresse IP de l'utilisateur (facultatif)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'enregistrement
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             role:
 *               type: string
 *           description: Informations sur l'utilisateur associé
 *       example:
 *         id: 1
 *         user_id: 3
 *         action_date: "2025-06-01T09:15:22.000Z"
 *         action_type: "login"
 *         description: "Connexion au système"
 *         ip_address: "192.168.1.100"
 *         createdAt: "2025-06-01T09:15:22.000Z"
 *         updatedAt: "2025-06-01T09:15:22.000Z"
 *         user:
 *           id: 3
 *           email: "utilisateur@example.com"
 *           first_name: "Marie"
 *           last_name: "Dupont"
 *           role: "animator"
 * 
 *     LogInput:
 *       type: object
 *       required:
 *         - action_date
 *         - action_type
 *         - description
 *       properties:
 *         action_date:
 *           type: string
 *           format: date-time
 *           description: Date et heure de l'action
 *         action_type:
 *           type: string
 *           enum: [login, creation, modification, deletion]
 *           description: Type d'action effectuée
 *         description:
 *           type: string
 *           description: Description détaillée de l'action
 *         ip_address:
 *           type: string
 *           maxLength: 25
 *           description: Adresse IP de l'utilisateur (facultatif)
 */

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Récupérer tous les logs d'activité
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des logs d'activité récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 15
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer un nouveau log d'activité
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogInput'
 *     responses:
 *       201:
 *         description: Log d'activité créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/')
    .get(protect, authorize('admin'), activityLogController.getAllLogs)
    .post(protect, activityLogController.createLog); // Le système génère les logs

/**
 * @swagger
 * /activity-logs/range:
 *   get:
 *     summary: Récupérer les logs d'activité sur une période donnée
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période (YYYY-MM-DD)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID d'utilisateur (optionnel)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [login, creation, modification, deletion]
 *         description: Filtrer par type d'action (optionnel)
 *     responses:
 *       200:
 *         description: Liste des logs d'activité pour la période récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Paramètres de date invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les logs sur une période
router
    .route('/range')
    .get(protect, authorize('admin'), activityLogController.getLogsByDateRange);

/**
 * @swagger
 * /activity-logs/search:
 *   get:
 *     summary: Rechercher dans les logs d'activité
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche (optionnel)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID d'utilisateur (optionnel)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [action_type, action_date, description]
 *         description: Champ utilisé pour le tri (optionnel)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Ordre de tri (ASC ou DESC, défaut ASC) (optionnel)
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
// Route pour rechercher dans les logs
router
    .route('/search')
    .get(protect, authorize('admin'), activityLogController.searchLogs);

/**
 * @swagger
 * /activity-logs/{id}:
 *   get:
 *     summary: Récupérer un log d'activité par son ID
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du log d'activité
 *     responses:
 *       200:
 *         description: Log d'activité récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Log d'activité non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer un log d'activité
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du log d'activité
 *     responses:
 *       200:
 *         description: Log d'activité supprimé avec succès
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
 *                   example: "Log d'activité supprimé avec succès"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Log d'activité non trouvé
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, authorize('admin'), activityLogController.getLogById)
    .delete(protect, authorize('admin'), activityLogController.deleteLog);

/**
 * @swagger
 * /activity-logs/user/{userId}:
 *   get:
 *     summary: Récupérer les logs d'activité d'un utilisateur spécifique
 *     tags: [Logs d'activité]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des logs d'activité de l'utilisateur récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les logs d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, authorize('admin', 'director'), activityLogController.getLogsByUser);

module.exports = router;