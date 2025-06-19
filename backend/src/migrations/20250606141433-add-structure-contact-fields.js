'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('structures', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('structures', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('structures', 'manager_name', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('structures', 'manager_email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('structures', 'capacity', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('structures', 'capacity');
    await queryInterface.removeColumn('structures', 'manager_email');
    await queryInterface.removeColumn('structures', 'manager_name');
    await queryInterface.removeColumn('structures', 'email');
    await queryInterface.removeColumn('structures', 'phone');
  }
};