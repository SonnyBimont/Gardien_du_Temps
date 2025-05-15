const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, projectController.getProjects)
    .post(protect, authorize('admin', 'director'), projectController.createProject);

router
    .route('/:id')
    .get(protect, projectController.getProjectById)
    .put(protect, authorize('admin', 'director'), projectController.updateProject)
    .delete(protect, authorize('admin', 'director'), projectController.deleteProject);

// Route pour récupérer les projets d'une structure spécifique
router
    .route('/structure/:structureId')
    .get(protect, projectController.getProjectsByStructure);

module.exports = router;