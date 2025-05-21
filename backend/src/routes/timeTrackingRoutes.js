const express = require('express');
const router = express.Router();
const timeTrackingController = require('../controllers/timeTrackingController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, authorize('admin', 'director'), timeTrackingController.getAllTimeEntries)
    .post(protect, timeTrackingController.createTimeEntry);

// Route pour récupérer les pointages sur une période
router
    .route('/range')
    .get(protect, timeTrackingController.getTimeEntriesByDateRange);

// Route pour récupérer les pointages d'un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, timeTrackingController.getTimeEntriesByUser);

router
    .route('/:id')
    .get(protect, timeTrackingController.getTimeEntryById)
    .put(protect, timeTrackingController.updateTimeEntry) // Vérification des permissions dans le contrôleur
    .delete(protect, authorize('admin', 'director'), timeTrackingController.deleteTimeEntry);

module.exports = router;