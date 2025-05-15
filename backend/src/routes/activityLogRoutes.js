const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, authorize('admin'), activityLogController.getAllLogs)
    .post(protect, activityLogController.createLog); // Le système génère les logs

router
    .route('/:id')
    .get(protect, authorize('admin'), activityLogController.getLogById)
    .delete(protect, authorize('admin'), activityLogController.deleteLog);

// Route pour récupérer les logs d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, authorize('admin', 'director'), activityLogController.getLogsByUser);

// Route pour récupérer les logs sur une période
router
    .route('/range')
    .get(protect, authorize('admin'), activityLogController.getLogsByDateRange);

// Route pour rechercher dans les logs
router
    .route('/search')
    .get(protect, authorize('admin'), activityLogController.searchLogs);

module.exports = router;