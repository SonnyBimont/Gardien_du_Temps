'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('projects', [
      {
        structure_id: 1, // Centre de Loisirs Paris
        name: 'Vacances d\'été 2024',
        description: 'Organisation et planification des activités pour les vacances d\'été 2024.',
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-08-31'),
        status: 'in_preparation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        structure_id: 1, // Centre de Loisirs Paris
        name: 'Festival des Arts',
        description: 'Organisation d\'un festival artistique pour les jeunes du centre.',
        start_date: new Date('2024-05-01'),
        end_date: new Date('2024-06-30'),
        status: 'in_preparation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        structure_id: 1, // Centre de Loisirs Paris
        name: 'Projet éco-responsable',
        description: 'Mise en place d\'actions écologiques au sein du centre.',
        start_date: new Date('2023-11-01'),
        end_date: new Date('2024-03-31'),
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        structure_id: 2, // Centre Animation Lyon
        name: 'Sorties culturelles 2024',
        description: 'Programme de sorties culturelles pour les jeunes du centre.',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-12-15'),
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        structure_id: 3, // Maison des Jeunes Marseille
        name: 'Tournoi sportif inter-centres',
        description: 'Organisation d\'un tournoi sportif entre différents centres.',
        start_date: new Date('2024-04-01'),
        end_date: new Date('2024-06-30'),
        status: 'in_preparation',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('projects', null, {});
  }
};