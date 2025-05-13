'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user_tasks', [
      // Assignations pour l'équipe de Paris
      {
        user_id: 2, // Sophie Martin (directeur)
        task_id: 1, // Planification des activités
        time_worked: 480, // 8 heures en minutes
        work_date: new Date('2024-03-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2, // Sophie Martin (directeur)
        task_id: 3, // Recrutement des animateurs
        time_worked: 300, // 5 heures en minutes
        work_date: new Date('2024-04-18'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3, // Lucas Petit (animateur)
        task_id: 1, // Planification des activités
        time_worked: 240, // 4 heures en minutes
        work_date: new Date('2024-03-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4, // Léa Durand (animateur)
        task_id: 2, // Réservation des sorties
        time_worked: 180, // 3 heures en minutes
        work_date: new Date('2024-04-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4, // Léa Durand (animateur)
        task_id: 6, // Mise en place du tri sélectif
        time_worked: 120, // 2 heures en minutes
        work_date: new Date('2023-11-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Assignations pour l'équipe de Lyon
      {
        user_id: 5, // Thomas Moreau (directeur Lyon)
        task_id: 8, // Planning des musées
        time_worked: 360, // 6 heures en minutes
        work_date: new Date('2024-01-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 6, // Emma Lefebvre (animateur Lyon)
        task_id: 9, // Réservation spectacles
        time_worked: 240, // 4 heures en minutes
        work_date: new Date('2024-02-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user_tasks', null, {});
  }
};