const { Project, Task, User } = require('../models');

// Récupérer tous les projets
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{ model: Task, as: 'tasks' }]
        });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: error.message });
    }
};

// Récupérer un projet par son ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{ model: Task, as: 'tasks' }]
        });

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du projet', error: error.message });
    }
};

// Créer un nouveau projet
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du projet', error: error.message });
    }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
    try {
        const [updated] = await Project.update(req.body, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const updatedProject = await Project.findByPk(req.params.id);

        res.status(200).json({
            success: true,
            data: updatedProject
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du projet', error: error.message });
    }
};

// Supprimer un projet
exports.deleteProject = async (req, res) => {
    try {
        const deleted = await Project.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.status(200).json({
            success: true,
            message: 'Projet supprimé avec succès'
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression du projet', error: error.message });
    }
};

// Récupérer les projets par structure
exports.getProjectsByStructure = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { structure_id: req.params.structureId },
            include: [{ model: Task, as: 'tasks' }]
        });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: error.message });
    }
};

// METHODE SUPPLEMENTAIRE : Récupérer les projets par directeur 
exports.getProjectsByDirector = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { 
        structure_id: req.user.structure_id 
      },
      include: [
        { 
          model: Task, 
          as: 'tasks',
          include: [
            { model: User, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name'] }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des projets', 
      error: error.message 
    });
  }
};

// AJOUTER assignation de tâche
exports.assignTaskToAnimator = async (req, res) => {
  try {
    const { taskId, animatorId } = req.body;
    
    // Vérifier que l'animateur appartient à la même structure
    const animator = await User.findOne({
      where: { 
        id: animatorId, 
        structure_id: req.user.structure_id,
        role: 'animator'
      }
    });
    
    if (!animator) {
      return res.status(400).json({
        success: false,
        message: 'Animateur non trouvé ou non autorisé'
      });
    }

    const [updated] = await Task.update(
      { assigned_to: animatorId },
      { where: { id: taskId } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    const updatedTask = await Task.findByPk(taskId, {
      include: [
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
      message: 'Erreur lors de l\'assignation', 
      error: error.message 
    });
  }
};