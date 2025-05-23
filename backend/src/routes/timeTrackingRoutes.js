const express = require('express');
const router = express.Router();
const timeTrackingController = require('../controllers/timeTrackingController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Pointages
 *   description: API pour la gestion des pointages (suivi du temps)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeTracking:
 *       type: object
 *       required:
 *         - user_id
 *         - date_time
 *         - tracking_type
 *         - validated
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du pointage
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur qui effectue le pointage
 *         task_id:
 *           type: integer
 *           description: ID de la tâche associée (facultatif)
 *         date_time:
 *           type: string
 *           format: date-time
 *           description: Date et heure du pointage
 *         tracking_type:
 *           type: string
 *           enum: [arrival, break_start, break_end, departure]
 *           description: Type de pointage (arrivée, début pause, fin pause, départ)
 *         comment:
 *           type: string
 *           description: Commentaire sur le pointage (facultatif)
 *         validated:
 *           type: boolean
 *           description: Indique si le pointage a été validé
 *         validated_by:
 *           type: integer
 *           description: ID de l'utilisateur qui a validé le pointage (facultatif)
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
 *           description: Informations sur l'utilisateur qui a effectué le pointage
 *         validator:
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
 *           description: Informations sur l'utilisateur qui a validé le pointage
 *         task:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             project_id:
 *               type: integer
 *           description: Informations sur la tâche associée au pointage
 *       example:
 *         id: 1
 *         user_id: 3
 *         task_id: 5
 *         date_time: "2025-06-01T09:00:00.000Z"
 *         tracking_type: "arrival"
 *         comment: "Arrivée au centre de loisirs"
 *         validated: true
 *         validated_by: 2
 *         createdAt: "2025-06-01T09:01:22.000Z"
 *         updatedAt: "2025-06-01T17:30:15.000Z"
 *         user:
 *           id: 3
 *           email: "animateur@example.com"
 *           first_name: "Marie"
 *           last_name: "Dupont"
 *           role: "animator"
 *         validator:
 *           id: 2
 *           email: "directeur@example.com"
 *           first_name: "Jean"
 *           last_name: "Martin"
 *           role: "director"
 *         task:
 *           id: 5
 *           name: "Accueil des enfants"
 *           description: "Accueil des enfants au centre de loisirs"
 *           project_id: 2
 * 
 *     TimeTrackingInput:
 *       type: object
 *       required:
 *         - user_id
 *         - date_time
 *         - tracking_type
 *         - validated
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur qui effectue le pointage
 *         task_id:
 *           type: integer
 *           description: ID de la tâche associée (facultatif)
 *         date_time:
 *           type: string
 *           format: date-time
 *           description: Date et heure du pointage
 *         tracking_type:
 *           type: string
 *           enum: [arrival, break_start, break_end, departure]
 *           description: Type de pointage (arrivée, début pause, fin pause, départ)
 *         comment:
 *           type: string
 *           description: Commentaire sur le pointage (facultatif)
 *         validated:
 *           type: boolean
 *           description: Indique si le pointage a été validé
 *         validated_by:
 *           type: integer
 *           description: ID de l'utilisateur qui a validé le pointage (facultatif)
 */

/**
 * @swagger
 * /time-trackings:
 *   get:
 *     summary: Récupérer tous les pointages
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des pointages récupérée avec succès
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
 *                     $ref: '#/components/schemas/TimeTracking'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer un nouveau pointage
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeTrackingInput'
 *     responses:
 *       201:
 *         description: Pointage créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/')
    .get(protect, authorize('admin', 'director'), timeTrackingController.getAllTimeEntries)
    .post(protect, timeTrackingController.createTimeEntry);

/**
 * @swagger
 * /time-trackings/range:
 *   get:
 *     summary: Récupérer les pointages sur une période donnée
 *     tags: [Pointages]
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
 *         description: Liste des pointages pour la période récupérée avec succès
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
 *                     $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Paramètres de date invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les pointages sur une période
router
    .route('/range')
    .get(protect, timeTrackingController.getTimeEntriesByDateRange);

/**
 * @swagger
 * /time-trackings/user/{userId}:
 *   get:
 *     summary: Récupérer les pointages d'un utilisateur spécifique
 *     tags: [Pointages]
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
 *         description: Liste des pointages de l'utilisateur récupérée avec succès
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
 *                     $ref: '#/components/schemas/TimeTracking'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les pointages d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, timeTrackingController.getTimeEntriesByUser);

/**
 * @swagger
 * /time-trackings/{id}:
 *   get:
 *     summary: Récupérer un pointage par son ID
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pointage
 *     responses:
 *       200:
 *         description: Pointage récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Pointage non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour un pointage
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pointage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               task_id:
 *                 type: integer
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               tracking_type:
 *                 type: string
 *                 enum: [arrival, break_start, break_end, departure]
 *               comment:
 *                 type: string
 *               validated:
 *                 type: boolean
 *               validated_by:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pointage mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Pointage non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer un pointage
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pointage
 *     responses:
 *       200:
 *         description: Pointage supprimé avec succès
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
 *                   example: "Pointage supprimé avec succès"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Pointage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, timeTrackingController.getTimeEntryById)
    .put(protect, timeTrackingController.updateTimeEntry) // Vérification des permissions dans le contrôleur
    .delete(protect, authorize('admin', 'director'), timeTrackingController.deleteTimeEntry);

module.exports = router;