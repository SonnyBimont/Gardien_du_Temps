const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Projets
 *   description: API pour la gestion des projets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - structure_id
 *         - name
 *         - description
 *         - start_date
 *         - end_date
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du projet
 *         structure_id:
 *           type: integer
 *           description: ID de la structure à laquelle le projet est rattaché
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom du projet
 *         description:
 *           type: string
 *           description: Description détaillée du projet
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Date de début du projet
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Date de fin prévue du projet
 *         status:
 *           type: string
 *           enum: [in_preparation, in_progress, completed]
 *           description: État d'avancement du projet
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'enregistrement
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: Tâches associées à ce projet
 *         structure:
 *           $ref: '#/components/schemas/Structure'
 *           description: Structure à laquelle le projet est rattaché
 *       example:
 *         id: 1
 *         structure_id: 2
 *         name: "Préparation Vacances d'Été 2025"
 *         description: "Organisation des activités et du planning pour les vacances scolaires d'été 2025"
 *         start_date: "2025-04-01T09:00:00.000Z"
 *         end_date: "2025-06-15T18:00:00.000Z"
 *         status: "in_progress"
 *         createdAt: "2025-03-15T10:30:00.000Z"
 *         updatedAt: "2025-04-10T15:45:00.000Z"
 * 
 *     ProjectInput:
 *       type: object
 *       required:
 *         - structure_id
 *         - name
 *         - description
 *         - start_date
 *         - end_date
 *         - status
 *       properties:
 *         structure_id:
 *           type: integer
 *           description: ID de la structure à laquelle le projet est rattaché
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom du projet
 *         description:
 *           type: string
 *           description: Description détaillée du projet
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Date de début du projet
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Date de fin prévue du projet
 *         status:
 *           type: string
 *           enum: [in_preparation, in_progress, completed]
 *           description: État d'avancement du projet
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Récupérer tous les projets
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_preparation, in_progress, completed]
 *         description: Filtrer par statut du projet
 *       - in: query
 *         name: structure_id
 *         schema:
 *           type: integer
 *         description: Filtrer par structure
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date de début (minimum)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date de fin (maximum)
 *     responses:
 *       200:
 *         description: Liste des projets récupérée avec succès
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
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer un nouveau projet
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Projet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
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
    .get(protect, projectController.getProjects)
    .post(protect, authorize('admin', 'director'), projectController.createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Récupérer un projet par son ID
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du projet
 *     responses:
 *       200:
 *         description: Projet récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour un projet
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du projet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               structure_id:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [in_preparation, in_progress, completed]
 *     responses:
 *       200:
 *         description: Projet mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer un projet
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du projet
 *     responses:
 *       200:
 *         description: Projet supprimé avec succès
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
 *                       example: "Projet supprimé"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Seuls les administrateurs et directeurs peuvent supprimer des projets
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, projectController.getProjectById)
    .put(protect, authorize('admin', 'director'), projectController.updateProject)
    .delete(protect, authorize('admin', 'director'), projectController.deleteProject);

/**
 * @swagger
 * /projects/structure/{structureId}:
 *   get:
 *     summary: Récupérer tous les projets d'une structure spécifique
 *     tags: [Projets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: structureId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la structure
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_preparation, in_progress, completed]
 *         description: Filtrer par statut de projet
 *     responses:
 *       200:
 *         description: Liste des projets de la structure récupérée avec succès
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
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Vous n'avez pas accès aux projets de cette structure
 *       404:
 *         description: Structure non trouvée
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les projets d'une structure spécifique
router
    .route('/structure/:structureId')
    .get(protect, projectController.getProjectsByStructure);

// // AJOUTER ces routes
// router
// .get('/director/projects', protect, authorize('director'), projectController.getProjectsByDirector);

// router
// .post('/assign-task', protect, authorize('director'), projectController.assignTaskToAnimator);

// // AJOUTER ces routes
// router
// .get('/my-tasks', protect, authorize('animator'), taskController.getTasksByAnimator);

// router
// .patch('/:id/complete', protect, authorize('director'), taskController.markTaskAsCompleted);

module.exports = router;