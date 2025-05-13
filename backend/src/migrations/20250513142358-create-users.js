'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      structure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'structures',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      role: {
        type: Sequelize.ENUM('admin', 'director', 'animator'),
        allowNull: false
      },
      contract_type: {
        type: Sequelize.ENUM('permanent', 'fixed_term', 'etc.'),
        allowNull: false
      },
      weekly_hours: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      annual_hours: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      contract_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contract_end_date: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('users');
  }
};