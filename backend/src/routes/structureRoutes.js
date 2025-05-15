const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, authorize('admin'), structureController.getStructures)
    .post(protect, authorize('admin'), structureController.createStructure);

router
    .route('/:id')
    .get(protect, authorize('admin', 'director'), structureController.getStructureById)
    .put(protect, authorize('admin'), structureController.updateStructure)
    .delete(protect, authorize('admin'), structureController.deleteStructure);

module.exports = router;