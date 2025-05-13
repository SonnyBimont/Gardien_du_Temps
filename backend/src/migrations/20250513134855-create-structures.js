'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('structures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      postal_code: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      school_vacation_zone: {
        type: Sequelize.ENUM('A', 'B', 'C'),
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('structures');
  }
};
