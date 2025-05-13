'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Récupérer les projets existants et leurs IDs
    const projects = await queryInterface.sequelize.query(
      `SELECT id, name FROM projects;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    console.log('Projets trouvés:', projects);

    if (!projects || projects.length === 0) {
      throw new Error("Aucun projet n'existe dans la base de données");
    }

    // 2. Fonction pour trouver l'ID d'un projet par son nom
    const findProjectIdByName = (name) => {
      const project = projects.find(p => p.name === name);
      if (!project) {
        throw new Error(`Projet '${name}' non trouvé`);
      }
      return project.id;
    };

    try {
      // 3. Récupérer les IDs des projets dont vous avez besoin
      const vacancesEteId = findProjectIdByName("Vacances d'été 2024");
      const festivalArtsId = findProjectIdByName("Festival des Arts");
      const projetEcoId = findProjectIdByName("Projet éco-responsable");
      const sortiesCulturellesId = findProjectIdByName("Sorties culturelles 2024");
      const tournoiSportifId = findProjectIdByName("Tournoi sportif inter-centres");

      // 4. Insérer les tâches avec les IDs corrects
      return queryInterface.bulkInsert('tasks', [
        // Tâches pour le projet "Vacances d'été 2024"
        {
          project_id: vacancesEteId,
          name: 'Planification des activités',
          description: 'Définir le programme d\'activités pour les 2 mois de vacances.',
          priority: 'high',
          estimated_time: new Date('2024-03-01'),
          start_date: new Date('2024-03-01'),
          due_date: new Date('2024-04-30'),
          status: 'in_progress',
          recurrence: 'weekly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          project_id: vacancesEteId,
          name: 'Réservation des sorties',
          description: 'Contacter les partenaires et réserver les sorties prévues.',
          priority: 'medium',
          estimated_time: new Date('2024-04-01'),
          start_date: new Date('2024-04-01'),
          due_date: new Date('2024-05-31'),
          status: 'to_do',
          recurrence: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          project_id: vacancesEteId,
          name: 'Recrutement des animateurs saisonniers',
          description: 'Publier les offres et organiser les entretiens pour le renfort d\'été.',
          priority: 'urgent',
          estimated_time: new Date('2024-04-15'),
          start_date: new Date('2024-04-15'),
          due_date: new Date('2024-06-15'),
          status: 'to_do',
          recurrence: 'weekly',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Tâches pour le projet "Festival des Arts"
        {
          project_id: festivalArtsId,
          name: 'Recherche de partenaires',
          description: 'Contacter des artistes et associations pour participer au festival.',
          priority: 'high',
          estimated_time: new Date('2024-05-01'),
          start_date: new Date('2024-05-01'),
          due_date: new Date('2024-05-31'),
          status: 'to_do',
          recurrence: 'weekly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          project_id: festivalArtsId,
          name: 'Préparation de la communication',
          description: 'Créer les affiches et supports de communication pour le festival.',
          priority: 'medium',
          estimated_time: new Date('2024-05-15'),
          start_date: new Date('2024-05-15'),
          due_date: new Date('2024-06-10'),
          status: 'to_do',
          recurrence: 'weekly',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Tâches pour le projet "Projet éco-responsable"
        {
          project_id: projetEcoId,
          name: 'Mise en place du tri sélectif',
          description: 'Installer des poubelles de tri dans toutes les salles du centre.',
          priority: 'medium',
          estimated_time: new Date('2023-11-01'),
          start_date: new Date('2023-11-01'),
          due_date: new Date('2023-12-15'),
          status: 'completed',
          recurrence: 'daily',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          project_id: projetEcoId,
          name: 'Création d\'un jardin pédagogique',
          description: 'Aménager un espace pour un potager et jardin pédagogique.',
          priority: 'low',
          estimated_time: new Date('2023-12-01'),
          start_date: new Date('2023-12-01'),
          due_date: new Date('2024-03-31'),
          status: 'in_progress',
          recurrence: 'weekly',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Tâches pour le projet "Sorties culturelles 2024"
        {
          project_id: sortiesCulturellesId,
          name: 'Planning des musées',
          description: 'Établir un calendrier de visites des musées de Lyon.',
          priority: 'medium',
          estimated_time: new Date('2024-01-15'),
          start_date: new Date('2024-01-15'),
          due_date: new Date('2024-02-15'),
          status: 'completed',
          recurrence: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          project_id: sortiesCulturellesId,
          name: 'Réservation spectacles',
          description: 'Réserver des places pour différents spectacles de la saison.',
          priority: 'high',
          estimated_time: new Date('2024-02-01'),
          start_date: new Date('2024-02-01'),
          due_date: new Date('2024-03-15'),
          status: 'in_progress',
          recurrence: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de la création des tâches:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tasks', null, {});
  }
};