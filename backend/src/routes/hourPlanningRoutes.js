const express = require('express');
const router = express.Router();
const hourPlanningController = require('../controllers/hourPlanningController');
const { protect } = require('../middlewares/auth');

router.get('/yearly', protect, hourPlanningController.getYearlyPlanning);
router.post('/upsert', protect, hourPlanningController.upsertPlanning);

module.exports = router;