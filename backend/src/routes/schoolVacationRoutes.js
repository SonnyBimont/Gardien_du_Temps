const express = require('express');
const router = express.Router();
const schoolVacationController = require('../controllers/schoolVacationController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, schoolVacationController.getAllVacations)
    .post(protect, authorize('admin'), schoolVacationController.createVacation);

router
    .route('/:id')
    .get(protect, schoolVacationController.getVacationById)
    .put(protect, authorize('admin'), schoolVacationController.updateVacation)
    .delete(protect, authorize('admin'), schoolVacationController.deleteVacation);

// Route pour récupérer les vacances d'une zone spécifique
router
    .route('/zone/:zone')
    .get(protect, schoolVacationController.getVacationsByZone);

// Route pour récupérer les vacances d'une année scolaire spécifique
router
    .route('/year/:schoolYear')
    .get(protect, schoolVacationController.getVacationsBySchoolYear);

// Route pour vérifier si une date est pendant les vacances
router
    .route('/check')
    .get(protect, schoolVacationController.checkIfDateIsVacation);

// Route pour synchroniser les données de vacances depuis l'API gouvernementale
router
    .route('/sync')
    .post(protect, authorize('admin'), schoolVacationController.syncVacationsFromAPI);

// Route pour synchronisation automatique (années courante et suivante)
// POST: Déclenche la synchronisation automatique (admin uniquement)
router
    .route('/sync-auto')
    .post(protect, authorize('admin'), schoolVacationController.syncCurrentAndNextYear);

// Routes pour la synchronisation avec l'API gouvernementale
router.post('/sync', protect, authorize('admin'), schoolVacationController.syncVacationsFromAPI);
router.get('/available-years', protect, schoolVacationController.getAvailableSchoolYears);
router.post('/sync-auto', protect, authorize('admin'), schoolVacationController.syncCurrentAndNextYear);

module.exports = router;