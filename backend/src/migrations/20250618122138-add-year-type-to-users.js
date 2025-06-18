'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'year_type', {
      type: Sequelize.ENUM('civil', 'school'),
      allowNull: false,
      defaultValue: 'civil'
    });

    await queryInterface.addIndex('users', ['year_type'], {
      name: 'idx_users_year_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'idx_users_year_type');
    await queryInterface.removeColumn('users', 'year_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_year_type";');
  }
};