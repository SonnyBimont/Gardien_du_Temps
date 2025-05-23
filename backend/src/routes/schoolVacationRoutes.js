const express = require('express');
const router = express.Router();
const schoolVacationController = require('../controllers/schoolVacationController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Vacances Scolaires
 *   description: API pour la gestion des périodes de vacances scolaires
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SchoolVacation:
 *       type: object
 *       required:
 *         - zone
 *         - period_name
 *         - start_date
 *         - end_date
 *         - school_year
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré
 *         zone:
 *           type: string
 *           enum: [A, B, C]
 *           description: Zone scolaire (A, B, C)
 *         period_name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la période de vacances
 *         start_date:
 *           type: string
 *           format: date
 *           description: Date de début des vacances
 *         end_date:
 *           type: string
 *           format: date
 *           description: Date de fin des vacances
 *         school_year:
 *           type: string
 *           maxLength: 255
 *           description: Année scolaire (ex. 2024-2025)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'enregistrement
 *       example:
 *         id: 1
 *         zone: "B"
 *         period_name: "Vacances de la Toussaint"
 *         start_date: "2024-10-19"
 *         end_date: "2024-11-03"
 *         school_year: "2024-2025"
 *         createdAt: "2025-01-15T12:00:00.000Z"
 *         updatedAt: "2025-01-15T12:00:00.000Z"
 * 
 *     VacationInput:
 *       type: object
 *       required:
 *         - zone
 *         - period_name
 *         - start_date
 *         - end_date
 *         - school_year
 *       properties:
 *         zone:
 *           type: string
 *           enum: [A, B, C]
 *           description: Zone scolaire (A, B, C)
 *         period_name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la période de vacances
 *         start_date:
 *           type: string
 *           format: date
 *           description: Date de début des vacances
 *         end_date:
 *           type: string
 *           format: date
 *           description: Date de fin des vacances
 *         school_year:
 *           type: string
 *           maxLength: 255
 *           description: Année scolaire (ex. 2024-2025)
 *
 *     CalendarEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la période de vacances
 *         title:
 *           type: string
 *           description: Titre de l'événement (période + zone)
 *         start:
 *           type: string
 *           format: date-time
 *           description: Date de début de l'événement
 *         end:
 *           type: string
 *           format: date-time
 *           description: Date de fin de l'événement
 *         backgroundColor:
 *           type: string
 *           description: Couleur de fond selon la zone
 *         borderColor:
 *           type: string
 *           description: Couleur de bordure selon la zone
 *         textColor:
 *           type: string
 *           description: Couleur du texte
 *         allDay:
 *           type: boolean
 *           description: Indique si l'événement est sur toute la journée
 *         extendedProps:
 *           type: object
 *           properties:
 *             zone:
 *               type: string
 *               description: Zone scolaire
 *             schoolYear:
 *               type: string
 *               description: Année scolaire
 *       example:
 *         id: 1
 *         title: "Vacances de la Toussaint - Zone B"
 *         start: "2024-10-19T00:00:00.000Z"
 *         end: "2024-11-04T00:00:00.000Z"
 *         backgroundColor: "#EA4335"
 *         borderColor: "#EA4335"
 *         textColor: "#ffffff"
 *         allDay: true
 *         extendedProps:
 *           zone: "B"
 *           schoolYear: "2024-2025"
 *
 *     GovVacationData:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           description: Nom de la période de vacances
 *         population:
 *           type: string
 *           description: Population concernée (généralement "Élèves")
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Date de début des vacances
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Date de fin des vacances
 *         location:
 *           type: string
 *           description: Académie concernée
 *         zones:
 *           type: string
 *           description: Zone scolaire (format "Zone X")
 *         annee_scolaire:
 *           type: string
 *           description: Année scolaire
 *       example:
 *         description: "Vacances de la Toussaint"
 *         population: "Élèves"
 *         start_date: "2024-10-19T00:00:00.000Z"
 *         end_date: "2024-11-03T00:00:00.000Z"
 *         location: "Bordeaux"
 *         zones: "Zone B"
 *         annee_scolaire: "2024-2025"
 *
 *     SyncInput:
 *       type: object
 *       required:
 *         - zones
 *         - schoolYears
 *       properties:
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *             enum: [A, B, C]
 *           description: Liste des zones à synchroniser
 *         schoolYears:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des années scolaires à synchroniser (format "YYYY-YYYY")
 *         location:
 *           type: string
 *           description: Académie spécifique (optionnel)
 *       example:
 *         zones: ["A", "B", "C"]
 *         schoolYears: ["2024-2025", "2025-2026"]
 */

/**
 * @swagger
 * /school-vacations:
 *   get:
 *     summary: Récupérer toutes les périodes de vacances
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des périodes de vacances récupérée avec succès
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
 *                     $ref: '#/components/schemas/SchoolVacation'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 *   
 *   post:
 *     summary: Créer une nouvelle période de vacances manuellement
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VacationInput'
 *     responses:
 *       201:
 *         description: Période de vacances créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SchoolVacation'
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
    .get(protect, schoolVacationController.getAllVacations)
    .post(protect, authorize('admin'), schoolVacationController.createVacation);

/**
 * @swagger
 * /school-vacations/gov-format:
 *   get:
 *     summary: Récupérer les vacances au format de l'API gouvernementale
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Filtrer par zone scolaire
 *       - in: query
 *         name: schoolYear
 *         schema:
 *           type: string
 *         description: Filtrer par année scolaire (ex. 2024-2025)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrer par académie
 *     responses:
 *       200:
 *         description: Données formatées récupérées avec succès
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
 *                     $ref: '#/components/schemas/GovVacationData'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour obtenir les données au format de l'API gouvernementale
router
    .route('/gov-format')
    .get(protect, schoolVacationController.getVacationsInGovernmentFormat);

/**
 * @swagger
 * /school-vacations/raw-data:
 *   get:
 *     summary: Récupérer les données brutes depuis l'API gouvernementale
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Filtrer par zone scolaire
 *       - in: query
 *         name: schoolYear
 *         schema:
 *           type: string
 *         description: Filtrer par année scolaire (ex. 2024-2025)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrer par académie
 *     responses:
 *       200:
 *         description: Données brutes récupérées avec succès
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
 *                     $ref: '#/components/schemas/GovVacationData'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Ou pour la requête directe à l'API gouvernementale
router
    .route('/raw-data')
    .get(protect, schoolVacationController.getRawVacationData);

/**
 * @swagger
 * /school-vacations/academies:
 *   get:
 *     summary: Récupérer toutes les académies disponibles dans l'API gouvernementale
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des académies récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Aix-Marseille", "Amiens", "Besançon", "Bordeaux"]
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Routes pour la synchronisation avec l'API gouvernementale
router
    .route('/academies')
    .get(protect, schoolVacationController.getAvailableAcademies);

/**
 * @swagger
 * /school-vacations/available-years:
 *   get:
 *     summary: Récupérer toutes les années scolaires disponibles dans l'API gouvernementale
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des années scolaires récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["2023-2024", "2024-2025", "2025-2026"]
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/available-years')
    .get(protect, schoolVacationController.getAvailableSchoolYears);

/**
 * @swagger
 * /school-vacations/calendar:
 *   get:
 *     summary: Récupérer les vacances au format calendrier
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Filtrer par zone scolaire
 *       - in: query
 *         name: schoolYear
 *         schema:
 *           type: string
 *         description: Filtrer par année scolaire (ex. 2024-2025)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrer par académie (optionnel)
 *     responses:
 *       200:
 *         description: Données de calendrier récupérées avec succès
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
 *                     $ref: '#/components/schemas/CalendarEvent'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/calendar')
    .get(protect, schoolVacationController.getVacationsCalendar);

/**
 * @swagger
 * /school-vacations/sync:
 *   post:
 *     summary: Synchroniser les vacances scolaires depuis l'API gouvernementale
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncInput'
 *     responses:
 *       200:
 *         description: Synchronisation effectuée avec succès
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
 *                   example: "Synchronisation des vacances scolaires terminée"
 *                 results:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                       example: 10
 *                     updated:
 *                       type: integer
 *                       example: 5
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   nullable: true
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
// Route pour synchroniser les données de vacances depuis l'API gouvernementale
router
    .route('/sync')
    .post(protect, authorize('admin'), schoolVacationController.syncVacationsFromAPI);

/**
 * @swagger
 * /school-vacations/sync-auto:
 *   post:
 *     summary: Synchroniser automatiquement les vacances pour l'année scolaire courante et suivante
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation automatique effectuée avec succès
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
 *                   example: "Synchronisation des vacances scolaires terminée"
 *                 results:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                       example: 12
 *                     updated:
 *                       type: integer
 *                       example: 6
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   nullable: true
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
// POST: Déclenche la synchronisation automatique (admin uniquement)
// Route pour synchronisation automatique (années courante et suivante)
router
    .route('/sync-auto')
    .post(protect, authorize('admin'), schoolVacationController.syncCurrentAndNextYear);

/**
 * @swagger
 * /school-vacations/check:
 *   get:
 *     summary: Vérifier si une date donnée est pendant les vacances scolaires
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date à vérifier (format YYYY-MM-DD)
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Zone scolaire (optionnel)
 *     responses:
 *       200:
 *         description: Vérification effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isVacation:
 *                   type: boolean
 *                   example: true
 *                 vacationData:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/SchoolVacation'
 *                     - type: "null"
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour vérifier si une date est pendant les vacances
router
    .route('/check')
    .get(protect, schoolVacationController.checkIfDateIsVacation);

/**
 * @swagger
 * /school-vacations/zone/{zone}:
 *   get:
 *     summary: Récupérer les vacances d'une zone spécifique
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zone
 *         required: true
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Zone scolaire
 *     responses:
 *       200:
 *         description: Vacances de la zone récupérées avec succès
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
 *                     $ref: '#/components/schemas/SchoolVacation'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les vacances d'une zone spécifique
router
    .route('/zone/:zone')
    .get(protect, schoolVacationController.getVacationsByZone);

/**
 * @swagger
 * /school-vacations/year/{schoolYear}:
 *   get:
 *     summary: Récupérer les vacances d'une année scolaire spécifique
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolYear
 *         required: true
 *         schema:
 *           type: string
 *         description: Année scolaire (ex. 2024-2025)
 *     responses:
 *       200:
 *         description: Vacances de l'année scolaire récupérées avec succès
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
 *                     $ref: '#/components/schemas/SchoolVacation'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       500:
 *         description: Erreur serveur
 */
// Route pour récupérer les vacances d'une année scolaire spécifique
router
    .route('/year/:schoolYear')
    .get(protect, schoolVacationController.getVacationsBySchoolYear);

/**
 * @swagger
 * /school-vacations/{id}:
 *   get:
 *     summary: Récupérer une période de vacances par son ID
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la période de vacances
 *     responses:
 *       200:
 *         description: Période de vacances récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SchoolVacation'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       404:
 *         description: Période de vacances non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   put:
 *     summary: Mettre à jour une période de vacances
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la période de vacances
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VacationInput'
 *     responses:
 *       200:
 *         description: Période de vacances mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SchoolVacation'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Période de vacances non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     summary: Supprimer une période de vacances
 *     tags: [Vacances Scolaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la période de vacances
 *     responses:
 *       200:
 *         description: Période de vacances supprimée avec succès
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
 *                   example: "Période de vacances supprimée avec succès"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Période de vacances non trouvée
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, schoolVacationController.getVacationById)
    .put(protect, authorize('admin'), schoolVacationController.updateVacation)
    .delete(protect, authorize('admin'), schoolVacationController.deleteVacation);

module.exports = router;