'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('school_vacations', [
      // Zone A
      {
        zone: 'A',
        period_name: 'Vacances de la Toussaint',
        start_date: new Date('2023-10-21'),
        end_date: new Date('2023-11-06'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'A',
        period_name: 'Vacances de Noël',
        start_date: new Date('2023-12-23'),
        end_date: new Date('2024-01-08'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'A',
        period_name: 'Vacances d\'hiver',
        start_date: new Date('2024-02-17'),
        end_date: new Date('2024-03-04'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'A',
        period_name: 'Vacances de printemps',
        start_date: new Date('2024-04-13'),
        end_date: new Date('2024-04-29'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Zone B
      {
        zone: 'B',
        period_name: 'Vacances de la Toussaint',
        start_date: new Date('2023-10-21'),
        end_date: new Date('2023-11-06'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'B',
        period_name: 'Vacances de Noël',
        start_date: new Date('2023-12-23'),
        end_date: new Date('2024-01-08'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'B',
        period_name: 'Vacances d\'hiver',
        start_date: new Date('2024-02-24'),
        end_date: new Date('2024-03-11'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'B',
        period_name: 'Vacances de printemps',
        start_date: new Date('2024-04-20'),
        end_date: new Date('2024-05-06'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Zone C
      {
        zone: 'C',
        period_name: 'Vacances de la Toussaint',
        start_date: new Date('2023-10-21'),
        end_date: new Date('2023-11-06'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'C',
        period_name: 'Vacances de Noël',
        start_date: new Date('2023-12-23'),
        end_date: new Date('2024-01-08'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'C',
        period_name: 'Vacances d\'hiver',
        start_date: new Date('2024-02-10'),
        end_date: new Date('2024-02-26'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'C',
        period_name: 'Vacances de printemps',
        start_date: new Date('2024-04-06'),
        end_date: new Date('2024-04-22'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Tous zones (vacances d'été)
      {
        zone: 'A',
        period_name: 'Vacances d\'été',
        start_date: new Date('2024-07-06'),
        end_date: new Date('2024-09-02'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'B',
        period_name: 'Vacances d\'été',
        start_date: new Date('2024-07-06'),
        end_date: new Date('2024-09-02'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zone: 'C',
        period_name: 'Vacances d\'été',
        start_date: new Date('2024-07-06'),
        end_date: new Date('2024-09-02'),
        school_year: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('school_vacations', null, {});
  }
};