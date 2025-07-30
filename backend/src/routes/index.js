const express = require('express');
const router = express.Router();

// Importer toutes les routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const structureRoutes = require('./structureRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const timeTrackingRoutes = require('./timeTrackingRoutes');
const plannedScheduleRoutes = require('./plannedScheduleRoutes');
const hourPlanningRoutes = require('./hourPlanningRoutes');
const schoolVacationRoutes = require('./schoolVacationRoutes');
const activityLogRoutes = require('./activityLogRoutes');

// Définir les préfixes de routes pour chaque module
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/structures', structureRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/planned-schedules', plannedScheduleRoutes);
router.use('/hour-planning', hourPlanningRoutes);
router.use('/school-vacations', schoolVacationRoutes);
router.use('/activity-logs', activityLogRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Vérification du statut de l'API
 *     description: Endpoint de base pour vérifier que l'API est en ligne et fonctionnelle
 *     tags: [Général]
 *     responses:
 *       200:
 *         description: API en ligne et fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bienvenue sur l'API Gardien du Temps"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "online"
 */
// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API Gardien du Temps',
        version: '1.0.0',
        status: 'online'
    });
});

module.exports = router;