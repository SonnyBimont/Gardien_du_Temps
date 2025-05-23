const express = require('express');
const router = express.Router();
const plannedScheduleController = require('../controllers/plannedScheduleController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Plannings
 *   description: API pour la gestion des plannings prévus
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PlannedSchedule:
 *       type: object
 *       required:
 *         - user_id
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du planning
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur auquel le planning est associé
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date du planning (peut être null pour les modèles)
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Heure de début du planning
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Heure de fin du planning
 *         break_start:
 *           type: string
 *           format: date-time
 *           description: Heure de début de la pause (facultatif)
 *         break_end:
 *           type: string
 *           format: date-time
 *           description: Heure de fin de la pause (facultatif)
 *         comment:
 *           type: string
 *           description: Commentaire sur le planning (facultatif)
 *         is_template:
 *           type: boolean
 *           default: true
 *           description: Indique s'il s'agit d'un modèle de planning
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
 *         date: "2025-06-01T00:00:00.000Z"
 *         start_time: "2025-06-01T09:00:00.000Z"
 *         end_time: "2025-06-01T17:30:00.000Z"
 *         break_start: "2025-06-01T12:00:00.000Z"
 *         break_end: "2025-06-01T13:00:00.000Z"
 *         comment: "Journée d'activités extérieures"
 *         is_template: false
 *         createdAt: "2025-05-15T10:30:00.000Z"
 *         updatedAt: "2025-05-15T10:30:00.000Z"
 *         user:
 *           id: 3
 *           email: "animateur@example.com"
 *           first_name: "Marie"
 *           last_name: "Dupont"
 *           role: "animator"
 * 
 *     ScheduleInput:
 *       type: object
 *       required:
 *         - user_id
 *         - start_time
 *         - end_time
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur auquel le planning est associé
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date du planning (peut être null pour les modèles)
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Heure de début du planning
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Heure de fin du planning
 *         break_start:
 *           type: string
 *           format: date-time
 *           description: Heure de début de la pause (facultatif)
 *         break_end:
 *           type: string
 *           format: date-time
 *           description: Heure de fin de la pause (facultatif)
 *         comment:
 *           type: string
 *           description: Commentaire sur le planning (facultatif)
 *         is_template:
 *           type: boolean
 *           default: true
 *           description: Indique s'il s'agit d'un modèle de planning
 */

/**
 * @swagger
 * /planned-schedules:
 *   get:
 *     summary: Récupérer tous les plannings
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des plannings récupérée avec succès
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
 *                     $ref: '#/components/schemas/PlannedSchedule'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer un nouveau planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: Planning créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PlannedSchedule'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/')
    .get(protect, authorize('admin', 'director'), plannedScheduleController.getAllSchedules)
    .post(protect, authorize('admin', 'director'), plannedScheduleController.createSchedule);

/**
 * @swagger
 * /planned-schedules/range:
 *   get:
 *     summary: Récupérer les plannings sur une période donnée
 *     tags: [Plannings]
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
 *     responses:
 *       200:
 *         description: Liste des plannings pour la période récupérée avec succès
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlannedSchedule'
 *       400:
 *         description: Paramètres de date invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les plannings sur une période
router
    .route('/range')
    .get(protect, plannedScheduleController.getSchedulesByDateRange);

/**
 * @swagger
 * /planned-schedules/templates:
 *   get:
 *     summary: Récupérer les modèles de planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID d'utilisateur (optionnel)
 *     responses:
 *       200:
 *         description: Liste des modèles de planning récupérée avec succès
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
 *                     $ref: '#/components/schemas/PlannedSchedule'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les modèles de planning
router
    .route('/templates')
    .get(protect, authorize('admin', 'director'), plannedScheduleController.getScheduleTemplates);

/**
 * @swagger
 * /planned-schedules/user/{userId}:
 *   get:
 *     summary: Récupérer les plannings d'un utilisateur spécifique
 *     tags: [Plannings]
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
 *         description: Liste des plannings de l'utilisateur récupérée avec succès
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
 *                     $ref: '#/components/schemas/PlannedSchedule'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les plannings d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, plannedScheduleController.getSchedulesByUser);

/**
 * @swagger
 * /planned-schedules/{id}:
 *   get:
 *     summary: Récupérer un planning par son ID
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du planning
 *     responses:
 *       200:
 *         description: Planning récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PlannedSchedule'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Planning non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour un planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du planning
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               break_start:
 *                 type: string
 *                 format: date-time
 *               break_end:
 *                 type: string
 *                 format: date-time
 *               comment:
 *                 type: string
 *               is_template:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Planning mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PlannedSchedule'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Planning non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer un planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du planning
 *     responses:
 *       200:
 *         description: Planning supprimé avec succès
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
 *                   example: "Planning supprimé avec succès"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Planning non trouvé
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, plannedScheduleController.getScheduleById)
    .put(protect, authorize('admin', 'director'), plannedScheduleController.updateSchedule)
    .delete(protect, authorize('admin', 'director'), plannedScheduleController.deleteSchedule);

module.exports = router;