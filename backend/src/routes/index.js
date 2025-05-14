const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const structureRoutes = require('./structureRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const timeTrackingRoutes = require('./timeTrackingRoutes');
const plannedScheduleRoutes = require('./plannedScheduleRoutes');


// Définir les routes principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/structures', structureRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/planned-schedules', plannedScheduleRoutes);

module.exports = router;