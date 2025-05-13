'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Helper function to set time
    const setDateTime = (date, hours, minutes) => {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    return queryInterface.bulkInsert('time_trackings', [
      // Pointages de Sophie Martin (directeur à Paris)
      {
        user_id: 2,
        date_time: setDateTime(yesterday, 8, 30), // 8h30
        tracking_type: 'arrival',
        comment: null,
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date_time: setDateTime(yesterday, 12, 0), // 12h00
        tracking_type: 'break_start',
        comment: null,
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date_time: setDateTime(yesterday, 13, 0), // 13h00
        tracking_type: 'break_end',
        comment: null,
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date_time: setDateTime(yesterday, 17, 30), // 17h30
        tracking_type: 'departure',
        comment: null,
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Pointages de Lucas Petit (animateur à Paris)
      {
        user_id: 3,
        date_time: setDateTime(yesterday, 9, 0), // 9h00
        tracking_type: 'arrival',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date_time: setDateTime(yesterday, 12, 15), // 12h15
        tracking_type: 'break_start',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date_time: setDateTime(yesterday, 13, 30), // 13h30
        tracking_type: 'break_end',
        comment: 'Retard cause transport',
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date_time: setDateTime(yesterday, 17, 0), // 17h00
        tracking_type: 'departure',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Pointages de Léa Durand (animateur à Paris)
      {
        user_id: 4,
        date_time: setDateTime(yesterday, 8, 45), // 8h45
        tracking_type: 'arrival',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date_time: setDateTime(yesterday, 12, 0), // 12h00
        tracking_type: 'break_start',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date_time: setDateTime(yesterday, 13, 0), // 13h00
        tracking_type: 'break_end',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date_time: setDateTime(yesterday, 16, 45), // 16h45
        tracking_type: 'departure',
        comment: null,
        validated: true,
        validated_by: 2, // Sophie (directeur)
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Pointages de Thomas Moreau (directeur à Lyon)
      {
        user_id: 5,
        date_time: setDateTime(yesterday, 8, 15), // 8h15
        tracking_type: 'arrival',
        comment: null,
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        date_time: setDateTime(yesterday, 18, 0), // 18h00
        tracking_type: 'departure',
        comment: 'Réunion prolongée',
        validated: true,
        validated_by: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('time_trackings', null, {});
  }
};