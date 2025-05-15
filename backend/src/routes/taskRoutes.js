const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, taskController.getTasks)
    .post(protect, taskController.createTask); // La validation des rôles peut être gérée dans le contrôleur

router
    .route('/:id')
    .get(protect, taskController.getTaskById)
    .put(protect, taskController.updateTask) // Vérification des permissions dans le contrôleur
    .delete(protect, authorize('admin', 'director'), taskController.deleteTask);

// Route pour récupérer les tâches d'un projet spécifique
router
    .route('/project/:projectId')
    .get(protect, taskController.getTasksByProject);

// Route pour récupérer les tâches assignées à un utilisateur spécifique
router
    .route('/user/:userId')
    .get(protect, taskController.getTasksByUser);

module.exports = router;