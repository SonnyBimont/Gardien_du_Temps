const express = require('express');
const router = express.Router();
const schoolVacationController = require('../controllers/schoolVacationController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, schoolVacationController.getAllVacations)
    .post(protect, authorize('admin'), schoolVacationController.createVacation);

// Routes pour la synchronisation avec l'API gouvernementale
router
    .route('/academies')
    .get(protect, schoolVacationController.getAvailableAcademies);

router
    .route('/available-years')
    .get(protect, schoolVacationController.getAvailableSchoolYears);

router
    .route('/calendar')
    .get(protect, schoolVacationController.getVacationsCalendar);

// Route pour synchroniser les données de vacances depuis l'API gouvernementale
router
    .route('/sync')
    .post(protect, authorize('admin'), schoolVacationController.syncVacationsFromAPI);

// POST: Déclenche la synchronisation automatique (admin uniquement)
// Route pour synchronisation automatique (années courante et suivante)
router
    .route('/sync-auto')
    .post(protect, authorize('admin'), schoolVacationController.syncCurrentAndNextYear);

// Route pour vérifier si une date est pendant les vacances
router
    .route('/check')
    .get(protect, schoolVacationController.checkIfDateIsVacation);

// Route pour récupérer les vacances d'une zone spécifique
router
    .route('/zone/:zone')
    .get(protect, schoolVacationController.getVacationsByZone);

// Route pour récupérer les vacances d'une année scolaire spécifique
router
    .route('/year/:schoolYear')
    .get(protect, schoolVacationController.getVacationsBySchoolYear);

router
    .route('/:id')
    .get(protect, schoolVacationController.getVacationById)
    .put(protect, authorize('admin'), schoolVacationController.updateVacation)
    .delete(protect, authorize('admin'), schoolVacationController.deleteVacation);

module.exports = router;