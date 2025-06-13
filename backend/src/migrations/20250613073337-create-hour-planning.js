'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hour_planning', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plan_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      planned_hours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#3B82F6'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Index pour les performances
    await queryInterface.addIndex('hour_planning', ['user_id', 'plan_date'], {
      unique: true,
      name: 'unique_user_date'
    });

    await queryInterface.addIndex('hour_planning', ['user_id']);
    await queryInterface.addIndex('hour_planning', ['plan_date']);
    await queryInterface.addIndex('hour_planning', ['project_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hour_planning');
  }
};