const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router
    .route('/')
    .get(protect, authorize('admin', 'director'), userController.getUsers)
    .post(protect, authorize('admin', 'director'), userController.createUser);

router
    .route('/:id')
    .get(protect, userController.getUserById)
    .put(protect, authorize('admin', 'director'), userController.updateUser)
    .delete(protect, authorize('admin'), userController.deleteUser);

module.exports = router;