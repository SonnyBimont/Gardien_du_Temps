const express = require('express');
const router = express.Router();
const hourPlanningController = require('../controllers/hourPlanningController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Planification Horaire
 *   description: API pour la gestion de la planification horaire annuelle
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HourPlanning:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la planification
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur
 *         year:
 *           type: integer
 *           description: Année de planification
 *         year_type:
 *           type: string
 *           enum: [civil, school]
 *           description: Type d'année (civile ou scolaire)
 *         january_hours:
 *           type: number
 *           description: Heures prévues en janvier
 *         february_hours:
 *           type: number
 *           description: Heures prévues en février
 *         march_hours:
 *           type: number
 *           description: Heures prévues en mars
 *         april_hours:
 *           type: number
 *           description: Heures prévues en avril
 *         may_hours:
 *           type: number
 *           description: Heures prévues en mai
 *         june_hours:
 *           type: number
 *           description: Heures prévues en juin
 *         july_hours:
 *           type: number
 *           description: Heures prévues en juillet
 *         august_hours:
 *           type: number
 *           description: Heures prévues en août
 *         september_hours:
 *           type: number
 *           description: Heures prévues en septembre
 *         october_hours:
 *           type: number
 *           description: Heures prévues en octobre
 *         november_hours:
 *           type: number
 *           description: Heures prévues en novembre
 *         december_hours:
 *           type: number
 *           description: Heures prévues en décembre
 *       example:
 *         id: 1
 *         user_id: 5
 *         year: 2025
 *         year_type: "school"
 *         january_hours: 120
 *         february_hours: 110
 *         march_hours: 130
 *
 *     PlanningUpsert:
 *       type: object
 *       required:
 *         - year
 *         - year_type
 *       properties:
 *         year:
 *           type: integer
 *           description: Année de planification
 *         year_type:
 *           type: string
 *           enum: [civil, school]
 *           description: Type d'année
 *         january_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         february_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         march_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         april_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         may_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         june_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         july_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         august_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         september_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         october_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         november_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 *         december_hours:
 *           type: number
 *           minimum: 0
 *           maximum: 24
 */

/**
 * @swagger
 * /api/hour-planning/yearly:
 *   get:
 *     summary: Récupérer la planification horaire annuelle
 *     tags: [Planification Horaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Année de planification (par défaut année courante)
 *       - in: query
 *         name: year_type
 *         schema:
 *           type: string
 *           enum: [civil, school]
 *         description: Type d'année (par défaut school)
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: ID utilisateur (pour admin/directeur seulement)
 *     responses:
 *       200:
 *         description: Planification récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HourPlanning'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Planification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/yearly', protect, hourPlanningController.getYearlyPlanning);

/**
 * @swagger
 * /api/hour-planning/upsert:
 *   post:
 *     summary: Créer ou mettre à jour une planification horaire
 *     tags: [Planification Horaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanningUpsert'
 *     responses:
 *       200:
 *         description: Planification mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/HourPlanning'
 *       201:
 *         description: Planification créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/HourPlanning'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/upsert', protect, hourPlanningController.upsertPlanning);

module.exports = router;