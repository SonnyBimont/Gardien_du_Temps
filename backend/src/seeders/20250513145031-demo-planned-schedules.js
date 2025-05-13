'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Helper function to set time
    const setDateTime = (date, hours, minutes) => {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    // Créer des dates pour la semaine
    const monday = new Date(nextWeek);
    monday.setDate(monday.getDate() - (monday.getDay() - 1));

    const tuesday = new Date(monday);
    tuesday.setDate(tuesday.getDate() + 1);

    const wednesday = new Date(monday);
    wednesday.setDate(wednesday.getDate() + 2);

    const thursday = new Date(monday);
    thursday.setDate(thursday.getDate() + 3);

    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    return queryInterface.bulkInsert('planned_schedules', [
      // Planning de Sophie Martin (directeur à Paris)
      {
        user_id: 2,
        date: monday,
        start_time: setDateTime(monday, 8, 30),
        end_time: setDateTime(monday, 17, 30),
        break_start: setDateTime(monday, 12, 0),
        break_end: setDateTime(monday, 13, 0),
        comment: 'Réunion d\'équipe à 10h',
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: tuesday,
        start_time: setDateTime(tuesday, 8, 30),
        end_time: setDateTime(tuesday, 17, 30),
        break_start: setDateTime(tuesday, 12, 0),
        break_end: setDateTime(tuesday, 13, 0),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: wednesday,
        start_time: setDateTime(wednesday, 8, 30),
        end_time: setDateTime(wednesday, 17, 30),
        break_start: setDateTime(wednesday, 12, 0),
        break_end: setDateTime(wednesday, 13, 0),
        comment: 'Visite du partenaire à 14h',
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: thursday,
        start_time: setDateTime(thursday, 8, 30),
        end_time: setDateTime(thursday, 17, 30),
        break_start: setDateTime(thursday, 12, 0),
        break_end: setDateTime(thursday, 13, 0),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: friday,
        start_time: setDateTime(friday, 8, 30),
        end_time: setDateTime(friday, 17, 30),
        break_start: setDateTime(friday, 12, 0),
        break_end: setDateTime(friday, 13, 0),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Planning de Lucas Petit (animateur à Paris)
      {
        user_id: 3,
        date: monday,
        start_time: setDateTime(monday, 9, 0),
        end_time: setDateTime(monday, 17, 0),
        break_start: setDateTime(monday, 12, 15),
        break_end: setDateTime(monday, 13, 30),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date: wednesday,
        start_time: setDateTime(wednesday, 9, 0),
        end_time: setDateTime(wednesday, 17, 0),
        break_start: setDateTime(wednesday, 12, 15),
        break_end: setDateTime(wednesday, 13, 30),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date: friday,
        start_time: setDateTime(friday, 9, 0),
        end_time: setDateTime(friday, 17, 0),
        break_start: setDateTime(friday, 12, 15),
        break_end: setDateTime(friday, 13, 30),
        comment: 'Animation spéciale après-midi',
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Template pour Léa Durand (animateur à Paris)
      {
        user_id: 4,
        date: null,
        start_time: setDateTime(new Date(), 8, 45),
        end_time: setDateTime(new Date(), 16, 45),
        break_start: setDateTime(new Date(), 12, 0),
        break_end: setDateTime(new Date(), 13, 0),
        comment: 'Planning type semaine',
        is_template: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Planning spécifique pour Léa Durand (animateur à Paris)
      {
        user_id: 4,
        date: monday,
        start_time: setDateTime(monday, 8, 45),
        end_time: setDateTime(monday, 16, 45),
        break_start: setDateTime(monday, 12, 0),
        break_end: setDateTime(monday, 13, 0),
        comment: 'Formation 9h-12h',
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date: tuesday,
        start_time: setDateTime(tuesday, 8, 45),
        end_time: setDateTime(tuesday, 16, 45),
        break_start: setDateTime(tuesday, 12, 0),
        break_end: setDateTime(tuesday, 13, 0),
        comment: null,
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date: wednesday,
        start_time: setDateTime(wednesday, 8, 45),
        end_time: setDateTime(wednesday, 16, 45),
        break_start: setDateTime(wednesday, 12, 0),
        break_end: setDateTime(wednesday, 13, 0),
        comment: 'Sortie avec les enfants 14h-16h',
        is_template: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('planned_schedules', null, {});
  }
};