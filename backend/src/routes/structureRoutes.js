const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Structures
 *   description: API pour la gestion des structures (centres de loisirs)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Structure:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - postal_code
 *         - city
 *         - school_vacation_zone
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de la structure
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la structure
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Adresse de la structure
 *         postal_code:
 *           type: string
 *           description: Code postal de la structure
 *         city:
 *           type: string
 *           maxLength: 255
 *           description: Ville de la structure
 *         school_vacation_zone:
 *           type: string
 *           enum: [A, B, C]
 *           description: Zone de vacances scolaires (A, B ou C)
 *         active:
 *           type: boolean
 *           default: true
 *           description: Indique si la structure est active
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
 *         name: Centre de Loisirs Saint-Michel
 *         address: 25 rue des Lilas
 *         postal_code: 75001
 *         city: Paris
 *         school_vacation_zone: B
 *         active: true
 *         createdAt: "2025-01-15T12:00:00.000Z"
 *         updatedAt: "2025-01-15T12:00:00.000Z"
 * 
 *     StructureInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - postal_code
 *         - city
 *         - school_vacation_zone
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Nom de la structure
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Adresse de la structure
 *         postal_code:
 *           type: string
 *           description: Code postal de la structure
 *         city:
 *           type: string
 *           maxLength: 255
 *           description: Ville de la structure
 *         school_vacation_zone:
 *           type: string
 *           enum: [A, B, C]
 *           description: Zone de vacances scolaires (A, B ou C)
 *         active:
 *           type: boolean
 *           default: true
 *           description: Indique si la structure est active
 */

/**
 * @swagger
 * /structures:
 *   get:
 *     summary: Récupérer toutes les structures
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *           enum: [A, B, C]
 *         description: Filtrer par zone de vacances scolaires
 *     responses:
 *       200:
 *         description: Liste des structures récupérée avec succès
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
 *                     $ref: '#/components/schemas/Structure'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer une nouvelle structure
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StructureInput'
 *     responses:
 *       201:
 *         description: Structure créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Structure'
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
    .get(protect, authorize('admin', 'director'), structureController.getStructures)
    .post(protect, authorize('admin'), structureController.createStructure);

/**
 * @swagger
 * /structures/{id}:
 *   get:
 *     summary: Récupérer une structure par son ID
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la structure
 *     responses:
 *       200:
 *         description: Structure récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Structure'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Structure non trouvée
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour une structure
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la structure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               address:
 *                 type: string
 *                 maxLength: 255
 *               postal_code:
 *                 type: string
 *               city:
 *                 type: string
 *                 maxLength: 255
 *               school_vacation_zone:
 *                 type: string
 *                 enum: [A, B, C]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Structure mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Structure'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Structure non trouvée
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer une structure
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la structure
 *     responses:
 *       200:
 *         description: Structure supprimée avec succès
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
 *                       example: "Structure supprimée"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Structure non trouvée
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, authorize('admin', 'director'), structureController.getStructureById)
    .put(protect, authorize('admin'), structureController.updateStructure)
    .delete(protect, authorize('admin'), structureController.deleteStructure);

module.exports = router;