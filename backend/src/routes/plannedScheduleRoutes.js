const express = require('express');
const router = express.Router();
const plannedScheduleController = require('../controllers/plannedScheduleController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, authorize('admin', 'director'), plannedScheduleController.getAllSchedules)
    .post(protect, authorize('admin', 'director'), plannedScheduleController.createSchedule);

router
    .route('/:id')
    .get(protect, plannedScheduleController.getScheduleById)
    .put(protect, authorize('admin', 'director'), plannedScheduleController.updateSchedule)
    .delete(protect, authorize('admin', 'director'), plannedScheduleController.deleteSchedule);

// Route pour récupérer les plannings d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, plannedScheduleController.getSchedulesByUser);

// Route pour récupérer les plannings sur une période
router
    .route('/range')
    .get(protect, plannedScheduleController.getSchedulesByDateRange);

// Route pour récupérer les modèles de planning
router
    .route('/templates')
    .get(protect, authorize('admin', 'director'), plannedScheduleController.getScheduleTemplates);

module.exports = router;