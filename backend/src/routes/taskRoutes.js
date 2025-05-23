const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Tâches
 *   description: API pour la gestion des tâches
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - project_id
 *         - name
 *         - description
 *         - priority
 *         - estimated_time
 *         - start_date
 *         - due_date
 *         - status
 *         - recurrence
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de la tâche
 *         project_id:
 *           type: integer
 *           description: ID du projet auquel appartient la tâche
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la tâche
 *         description:
 *           type: string
 *           description: Description détaillée de la tâche
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Niveau de priorité de la tâche
 *         estimated_time:
 *           type: string
 *           format: date-time
 *           description: Temps estimé pour réaliser la tâche
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Date de début prévue
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Date d'échéance de la tâche
 *         status:
 *           type: string
 *           enum: [to_do, in_progress, completed]
 *           description: État d'avancement de la tâche
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           description: Fréquence de récurrence de la tâche
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la tâche
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de la tâche
 *         assignedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *           description: Utilisateurs assignés à la tâche
 *       example:
 *         id: 1
 *         project_id: 2
 *         name: "Préparer le planning d'activités"
 *         description: "Élaborer le planning détaillé des activités pour la semaine du 1er juin"
 *         priority: "high"
 *         estimated_time: "2025-05-28T14:00:00.000Z"
 *         start_date: "2025-05-25T09:00:00.000Z"
 *         due_date: "2025-05-31T18:00:00.000Z"
 *         status: "in_progress"
 *         recurrence: "weekly"
 *         createdAt: "2025-05-22T10:30:00.000Z"
 *         updatedAt: "2025-05-23T15:45:00.000Z"
 *         assignedUsers: [
 *           {
 *             id: 3,
 *             email: "animateur@example.com",
 *             first_name: "Marie",
 *             last_name: "Dubois"
 *           }
 *         ]
 * 
 *     TaskInput:
 *       type: object
 *       required:
 *         - project_id
 *         - name
 *         - description
 *         - priority
 *         - estimated_time
 *         - start_date
 *         - due_date
 *         - status
 *         - recurrence
 *       properties:
 *         project_id:
 *           type: integer
 *           description: ID du projet auquel appartient la tâche
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la tâche
 *         description:
 *           type: string
 *           description: Description détaillée de la tâche
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Niveau de priorité de la tâche
 *         estimated_time:
 *           type: string
 *           format: date-time
 *           description: Temps estimé pour réaliser la tâche
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Date de début prévue
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Date d'échéance de la tâche
 *         status:
 *           type: string
 *           enum: [to_do, in_progress, completed]
 *           description: État d'avancement de la tâche
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           description: Fréquence de récurrence de la tâche
 *         assigned_users:
 *           type: array
 *           items:
 *             type: integer
 *           description: Liste des IDs des utilisateurs assignés à la tâche
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_do, in_progress, completed]
 *         description: Filtrer par statut
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date de début (minimum)
 *       - in: query
 *         name: due_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date d'échéance (maximum)
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée avec succès
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
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/')
    .get(protect, taskController.getTasks)
    .post(protect, taskController.createTask); // La validation des rôles peut être gérée dans le contrôleur

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Récupérer une tâche par son ID
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour une tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               estimated_time:
 *                 type: string
 *                 format: date-time
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [to_do, in_progress, completed]
 *               recurrence:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               assigned_users:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
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
 *                       example: 1
 *                     message:
 *                       type: string
 *                       example: "Tâche supprimée"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Seuls les administrateurs et directeurs peuvent supprimer des tâches
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, taskController.getTaskById)
    .put(protect, taskController.updateTask) // Vérification des permissions dans le contrôleur
    .delete(protect, authorize('admin', 'director'), taskController.deleteTask);

/**
 * @swagger
 * /tasks/project/{projectId}:
 *   get:
 *     summary: Récupérer toutes les tâches d'un projet spécifique
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du projet
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_do, in_progress, completed]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des tâches du projet récupérée avec succès
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
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les tâches d'un projet spécifique
router
    .route('/project/:projectId')
    .get(protect, taskController.getTasksByProject);

/**
 * @swagger
 * /tasks/user/{userId}:
 *   get:
 *     summary: Récupérer toutes les tâches assignées à un utilisateur spécifique
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_do, in_progress, completed]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des tâches de l'utilisateur récupérée avec succès
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
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Vous n'avez pas accès aux tâches de cet utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les tâches assignées à un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, taskController.getTasksByUser);

module.exports = router;