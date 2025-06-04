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

// récupérer les heures d'équipe :
router.get('/team-summary', protect, authorize('director', 'admin'), timeTrackingController.getTeamSummary);

// Routes simplifiées pour le frontend
/**
 * @swagger
 * /time-trackings/today:
 *   get:
 *     summary: Récupérer les pointages d'aujourd'hui
 *     description: Récupère tous les pointages effectués aujourd'hui pour l'utilisateur connecté ou un utilisateur spécifique (admin/directeur)
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (optionnel, réservé aux admin/directeur)
 *     responses:
 *       200:
 *         description: Pointages d'aujourd'hui récupérés avec succès
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
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeTracking'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-05-27"
 *                     user_id:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.get('/today', protect, timeTrackingController.getTodayEntries);
/**
 * @swagger
 * /time-trackings/quick:
 *   post:
 *     summary: Créer un pointage rapide
 *     description: Permet de créer rapidement un pointage avec validation métier intégrée
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tracking_type
 *             properties:
 *               tracking_type:
 *                 type: string
 *                 enum: [arrival, break_start, break_end, departure]
 *                 description: Type de pointage
 *                 example: "arrival"
 *               task_id:
 *                 type: integer
 *                 description: ID de la tâche associée (optionnel)
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Commentaire sur le pointage
 *                 example: "Arrivée au centre de loisirs"
 *             example:
 *               tracking_type: "arrival"
 *               task_id: 5
 *               comment: "Arrivée au centre de loisirs"
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
 *                 message:
 *                   type: string
 *                   example: "Arrivée enregistrée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Données invalides ou règle métier violée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Vous devez d'abord pointer votre arrivée"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.post('/quick', protect, timeTrackingController.quickTimeEntry);
/**
 * @swagger
 * /time-trackings/stats:
 *   get:
 *     summary: Récupérer les statistiques de pointage
 *     description: Fournit des statistiques détaillées sur les pointages incluant calculs d'heures et moyennes
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Nombre de jours pour la période d'analyse
 *         example: 30
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (optionnel, réservé aux admin/directeur)
 *         example: 3
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                     period:
 *                       type: object
 *                       properties:
 *                         days:
 *                           type: integer
 *                           example: 7
 *                         total_entries:
 *                           type: integer
 *                           example: 28
 *                         unique_users:
 *                           type: integer
 *                           example: 5
 *                     today:
 *                       type: object
 *                       properties:
 *                         entries:
 *                           type: integer
 *                           example: 8
 *                         active_users:
 *                           type: integer
 *                           example: 4
 *                     work_hours:
 *                       type: object
 *                       properties:
 *                         average_daily:
 *                           type: number
 *                           format: float
 *                           example: 7.5
 *                         total_days_worked:
 *                           type: integer
 *                           example: 5
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               work_date:
 *                                 type: string
 *                                 format: date
 *                               user_id:
 *                                 type: integer
 *                               first_arrival:
 *                                 type: string
 *                                 format: date-time
 *                               last_departure:
 *                                 type: string
 *                                 format: date-time
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', protect, timeTrackingController.getTimeStats);
/**
 * @swagger
 * /time-trackings/report/monthly:
 *   get:
 *     summary: Générer un rapport mensuel
 *     description: Génère un rapport détaillé des pointages pour un mois donné avec calcul des heures travaillées
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mois du rapport (1-12)
 *         example: 5
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *         description: Année du rapport
 *         example: 2025
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (optionnel, réservé aux admin/directeur)
 *         example: 3
 *     responses:
 *       200:
 *         description: Rapport mensuel généré avec succès
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
 *                     month:
 *                       type: integer
 *                       example: 5
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     total_entries:
 *                       type: integer
 *                       example: 120
 *                     daily_report:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         additionalProperties:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 first_name:
 *                                   type: string
 *                                 last_name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                             entries:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/TimeTracking'
 *                             arrival:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                             departure:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                             hours_worked:
 *                               type: number
 *                               format: float
 *                       example:
 *                         "2025-05-01":
 *                           "3":
 *                             user:
 *                               id: 3
 *                               first_name: "Marie"
 *                               last_name: "Dupont"
 *                               email: "marie@example.com"
 *                             arrival: "2025-05-01T09:00:00.000Z"
 *                             departure: "2025-05-01T17:30:00.000Z"
 *                             hours_worked: 8.5
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.get('/report/monthly', protect, timeTrackingController.getMonthlyReport);

// Routes spécialisées pour actions rapides
/**
 * @swagger
 * /time-trackings/clock-in:
 *   post:
 *     summary: Pointer l'arrivée
 *     description: Enregistre rapidement l'arrivée de l'utilisateur connecté
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: ID de la tâche associée (optionnel)
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Commentaire sur l'arrivée
 *                 example: "Arrivée au centre de loisirs"
 *     responses:
 *       201:
 *         description: Arrivée enregistrée avec succès
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
 *                   example: "Arrivée enregistrée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Arrivée déjà enregistrée aujourd'hui
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.post('/clock-in', protect, (req, res) => {
    req.body.tracking_type = 'arrival';
    timeTrackingController.quickTimeEntry(req, res);
});

/**
 * @swagger
 * /time-trackings/clock-out:
 *   post:
 *     summary: Pointer le départ
 *     description: Enregistre rapidement le départ de l'utilisateur connecté
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Commentaire sur le départ
 *                 example: "Fin de journée"
 *     responses:
 *       201:
 *         description: Départ enregistré avec succès
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
 *                   example: "Départ enregistré avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       400:
 *         description: Pas d'arrivée enregistrée ou départ déjà enregistré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Vous devez d'abord pointer votre arrivée"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */

router.post('/clock-out', protect, (req, res) => {
    req.body.tracking_type = 'departure';
    timeTrackingController.quickTimeEntry(req, res);
});

/**
 * @swagger
 * /time-trackings/break-start:
 *   post:
 *     summary: Commencer une pause
 *     description: Enregistre le début d'une pause pour l'utilisateur connecté
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Commentaire sur la pause
 *                 example: "Pause déjeuner"
 *     responses:
 *       201:
 *         description: Début de pause enregistré avec succès
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
 *                   example: "Début de pause enregistré avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.post('/break-start', protect, (req, res) => {
    req.body.tracking_type = 'break_start';
    timeTrackingController.quickTimeEntry(req, res);
});

/**
 * @swagger
 * /time-trackings/break-end:
 *   post:
 *     summary: Terminer une pause
 *     description: Enregistre la fin d'une pause pour l'utilisateur connecté
 *     tags: [Pointages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Commentaire sur la fin de pause
 *                 example: "Fin pause déjeuner"
 *     responses:
 *       201:
 *         description: Fin de pause enregistrée avec succès
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
 *                   example: "Fin de pause enregistrée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/TimeTracking'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.post('/break-end', protect, (req, res) => {
    req.body.tracking_type = 'break_end';
    timeTrackingController.quickTimeEntry(req, res);
});

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