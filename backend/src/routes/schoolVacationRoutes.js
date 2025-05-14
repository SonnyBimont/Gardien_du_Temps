const express = require('express');
const router = express.Router();
const schoolVacationController = require('../controllers/schoolVacationController');
const { protect, authorize } = require('../middlewares/auth');

// Routes existantes...

// Routes pour la synchronisation avec l'API gouvernementale
router.post('/sync', protect, authorize('admin'), schoolVacationController.syncVacationsFromAPI);
router.get('/available-years', protect, schoolVacationController.getAvailableSchoolYears);
router.post('/sync-auto', protect, authorize('admin'), schoolVacationController.syncCurrentAndNextYear);

module.exports = router;