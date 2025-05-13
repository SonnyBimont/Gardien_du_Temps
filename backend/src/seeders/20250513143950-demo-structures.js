'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('structures', [
      {
        name: 'Centre de Loisirs Paris',
        address: '15 rue des Lilas',
        postal_code: '75015',
        city: 'Paris',
        school_vacation_zone: 'C',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Centre Animation Lyon',
        address: '45 avenue Berthelot',
        postal_code: '69007',
        city: 'Lyon',
        school_vacation_zone: 'A',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Maison des Jeunes Marseille',
        address: '25 boulevard du Prado',
        postal_code: '13008',
        city: 'Marseille',
        school_vacation_zone: 'B',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('structures', null, {});
  }
};