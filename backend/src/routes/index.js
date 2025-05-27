const express = require('express');
const router = express.Router();

// Importer toutes les routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const structureRoutes = require('./structureRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const timeTrackingRoutes = require('./timeTrackingRoutes');
const plannedScheduleRoutes = require('./plannedScheduleRoutes');
const schoolVacationRoutes = require('./schoolVacationRoutes');
const activityLogRoutes = require('./activityLogRoutes');

// Définir les préfixes de routes pour chaque module
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/structures', structureRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/planned-schedules', plannedScheduleRoutes);
router.use('/school-vacations', schoolVacationRoutes);
router.use('/activity-logs', activityLogRoutes);

// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API Gardien du Temps',
        version: '1.0.0',
        status: 'online'
    });
});

module.exports = router;