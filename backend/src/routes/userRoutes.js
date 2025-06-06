const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');


/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: API pour la gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - structure_id
 *         - role
 *         - contract_type
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email unique de l'utilisateur
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur (ne sera pas renvoyé dans les réponses)
 *         first_name:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         last_name:
 *           type: string
 *           description: Nom de l'utilisateur
 *         phone:
 *           type: string
 *           description: Numéro de téléphone de l'utilisateur
 *         structure_id:
 *           type: integer
 *           description: ID de la structure à laquelle l'utilisateur est rattaché
 *         role:
 *           type: string
 *           enum: [admin, director, animator]
 *           description: Rôle de l'utilisateur (détermine les permissions)
 *         contract_type:
 *           type: string
 *           enum: [permanent, fixed_term, etc.]
 *           description: Type de contrat de l'utilisateur
 *         weekly_hours:
 *           type: number
 *           format: float
 *           description: Nombre d'heures hebdomadaires
 *         annual_hours:
 *           type: number
 *           format: float
 *           description: Nombre d'heures annuelles
 *         contract_start_date:
 *           type: string
 *           format: date
 *           description: Date de début du contrat
 *         contract_end_date:
 *           type: string
 *           format: date
 *           description: Date de fin du contrat
 *         active:
 *           type: boolean
 *           default: true
 *           description: Indique si le compte utilisateur est actif
 *       example:
 *         id: 1
 *         email: user@example.com
 *         first_name: Jean
 *         last_name: Dupont
 *         phone: "0601020304"
 *         role: animator
 *         contract_type: fixed_term
 *         weekly_hours: 35.0
 *         annual_hours: 1607.0
 *         contract_start_date: "2023-09-01"
 *         contract_end_date: "2024-08-31"
 *         active: true
 *         structure_id: 2
 * 
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - structure_id
 *         - role
 *         - contract_type
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         structure_id:
 *           type: integer
 *         role:
 *           type: string
 *           enum: [admin, director, animator]
 *         contract_type:
 *           type: string
 *           enum: [permanent, fixed_term, etc.]
 *         weekly_hours:
 *           type: number
 *           format: float
 *         annual_hours:
 *           type: number
 *           format: float
 *         contract_start_date:
 *           type: string
 *           format: date
 *         contract_end_date:
 *           type: string
 *           format: date
 *         active:
 *           type: boolean
 *           default: true
 */

// Routes pour tous les utilisateurs connectés
router.get('/profile', (req, res) => {
    req.params.id = req.user.id;
    userController.getUserById(req, res);
});

router.put('/profile', (req, res) => {
    req.params.id = req.user.id;
    userController.updateUser(req, res);
});

// ===== ROUTES UTILISATEURS =====

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrer par rôle
 *       - in: query
 *         name: structure_id
 *         schema:
 *           type: integer
 *         description: Filtrer par structure
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 * 
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/')
    .get(protect, authorize('admin', 'director'), userController.getUsers)
    .post(protect, authorize('admin', 'director'), userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Vous ne pouvez pas accéder à cet utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, director, animator, user]
 *               contract_type:
 *                 type: string
 *                 enum: [permanent, fixed_term, etc.]
 *               weekly_hours:
 *                 type: number
 *                 format: float
 *               annual_hours:
 *                 type: number
 *                 format: float
 *               contract_start_date:
 *                 type: string
 *                 format: date
 *               contract_end_date:
 *                 type: string
 *                 format: date
 *               active:
 *                 type: boolean
 *               structure_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Droits insuffisants
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
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
 *                       example: "Utilisateur supprimé"
 *       401:
 *         description: Non autorisé - Authentification requise
 *       403:
 *         description: Interdit - Seuls les administrateurs peuvent supprimer des utilisateurs
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router
    .route('/:id')
    .get(protect, authorize('admin', 'director'), userController.getUserById)
    .put(protect, authorize('admin', 'director'), userController.updateUser)
    .delete(protect, authorize('admin', 'director'), userController.deleteUser);


router.post('/:id/restore', protect, authorize('admin','director'), userController.restoreUser);  

router.patch('/:id/toggle-status', protect, authorize('admin','director'), userController.toggleUserStatus);  

// ===== ROUTES STATISTIQUES ADMIN ===== // ===== SYSTÈME ET AUDIT =====
router.get('/admin/stats', protect, authorize('admin'), userController.getStats);
router.get('/admin/stats-fixed', protect, authorize('admin'), userController.getStatsWithFixedPeriods);
router.get('/admin/dashboard-stats', protect, authorize('admin'), userController.getDashboardStats);
router.get('/admin/dashboard-stats-fixed', protect, authorize('admin'), userController.getDashboardStatsWithFixedPeriods);
router.get('/admin/recent-activity', protect, authorize('admin'), userController.getRecentActivity);
router.get('/admin/recent-activity-period', protect, authorize('admin'), userController.getRecentActivityWithPeriod);
router.get('/admin/system/health',protect, authorize('admin'), userController.getSystemHealth);
router.get('/admin/system/audit-logs',protect, authorize('admin'), userController.getAuditLogs);

module.exports = router;