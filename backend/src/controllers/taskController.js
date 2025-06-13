const { Task, Project, User, User_Task } = require('../models');

// Récupérer toutes les tâches
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'assignedUsers', through: { attributes: [] }, attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
    }
};

// Récupérer une tâche par son ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id, {
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'assignedUsers', through: { attributes: [] }, attributes: { exclude: ['password'] } }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la tâche', error: error.message });
    }
};

// Créer une nouvelle tâche
exports.createTask = async (req, res) => {
    try {
        const { assignedUserIds, ...taskData } = req.body;

        const task = await Task.create(taskData);

        // Assigner des utilisateurs à la tâche si spécifiés
        if (assignedUserIds && assignedUserIds.length > 0) {
            const userTaskAssignments = assignedUserIds.map(userId => ({
                user_id: userId,
                task_id: task.id
            }));

            await User_Task.bulkCreate(userTaskAssignments);
        }

        // Récupérer la tâche créée avec ses relations
        const newTask = await Task.findByPk(task.id, {
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'assignedUsers', through: { attributes: [] }, attributes: { exclude: ['password'] } }
            ]
        });

        res.status(201).json({
            success: true,
            data: newTask
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
    }
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
    try {
        const { assignedUserIds, ...taskData } = req.body;

        const [updated] = await Task.update(taskData, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        // Mettre à jour les assignations d'utilisateurs si spécifiées
        if (assignedUserIds) {
            // Supprimer les assignations existantes
            await User_Task.destroy({
                where: { task_id: req.params.id }
            });

            // Créer les nouvelles assignations
            if (assignedUserIds.length > 0) {
                const userTaskAssignments = assignedUserIds.map(userId => ({
                    user_id: userId,
                    task_id: req.params.id
                }));

                await User_Task.bulkCreate(userTaskAssignments);
            }
        }

        const updatedTask = await Task.findByPk(req.params.id, {
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'assignedUsers', through: { attributes: [] }, attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour de la tâche', error: error.message });
    }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
    try {
        const deleted = await Task.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.status(200).json({
            success: true,
            message: 'Tâche supprimée avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de la tâche', error: error.message });
    }
};

// Récupérer les tâches par projet
exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { project_id: req.params.projectId },
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'assignedUsers', through: { attributes: [] }, attributes: { exclude: ['password'] } }
            ]
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
    }
};

// Récupérer les tâches assignées à un utilisateur 
exports.getTasksByUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            include: [
                {
                    model: Task,
                    as: 'assignedTasks',
                    include: [{ model: Project, as: 'project' }]
                }
            ],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            count: user.assignedTasks?.length || 0,
            data: user.assignedTasks || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
    }
};

// METHODE SUPPLEMENTAIRE
exports.getTasksByAnimator = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { 
        assigned_to: req.user.id,
        status: { [Op.in]: ['todo', 'in_progress'] } // Pas les terminées
      },
      include: [
        { model: Project, as: 'project' },
        { 
          model: Time_Tracking, 
          as: 'timeEntries',
          where: { user_id: req.user.id },
          required: false
        }
      ]
    });

    // Calculer le temps total par tâche
    const tasksWithTime = tasks.map(task => {
      const totalMinutes = task.timeEntries?.reduce((sum, entry) => {
        if (entry.tracking_type === 'task_time') {
          return sum + (entry.duration_minutes || 0);
        }
        return sum;
      }, 0) || 0;

      return {
        ...task.toJSON(),
        totalTimeSpent: Math.round(totalMinutes / 60 * 100) / 100, // En heures
        formattedTime: `${Math.floor(totalMinutes / 60)}h${(totalMinutes % 60).toString().padStart(2, '0')}`
      };
    });

    res.status(200).json({
      success: true,
      count: tasksWithTime.length,
      data: tasksWithTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des tâches', 
      error: error.message 
    });
  }
};

// MODIFIER pour marquer comme terminée
exports.markTaskAsCompleted = async (req, res) => {
  try {
    const [updated] = await Task.update(
      { 
        status: 'completed',
        completed_at: new Date()
      },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    const updatedTask = await Task.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur lors de la validation', 
      error: error.message 
    });
  }
};