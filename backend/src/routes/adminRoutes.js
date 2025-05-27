const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/stats', protect, authorize('admin', 'director'), adminController.getStats);
router.get('/dashboard/stats', protect, authorize('admin', 'director'), adminController.getDashboardStats);
router.get('/activity', protect, authorize('admin', 'director'), adminController.getRecentActivity);

module.exports = router;