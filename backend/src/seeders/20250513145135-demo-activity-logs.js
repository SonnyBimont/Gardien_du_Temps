'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dates pour les logs
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Helper function to set time
    const setDateTime = (date, hours, minutes, seconds) => {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, seconds, 0);
      return newDate;
    };

    return queryInterface.bulkInsert('activity_logs', [
      // Logs de Jean Dubois (Admin)
      {
        user_id: 1,
        action_date: setDateTime(yesterday, 9, 15, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.100',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 1,
        action_date: setDateTime(yesterday, 9, 30, 0),
        action_type: 'creation',
        description: 'Création d\'une nouvelle tâche dans le projet "Vacances d\'été 2024"',
        ip_address: '192.168.1.100',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 1,
        action_date: setDateTime(yesterday, 11, 45, 0),
        action_type: 'modification',
        description: 'Modification des informations de structure "Centre de Loisirs Paris"',
        ip_address: '192.168.1.100',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Logs de Sophie Martin (Directeur)
      {
        user_id: 2,
        action_date: setDateTime(yesterday, 8, 40, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        action_date: setDateTime(yesterday, 10, 15, 0),
        action_type: 'creation',
        description: 'Création d\'un planning pour Lucas Petit (Animateur)',
        ip_address: '192.168.1.101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        action_date: setDateTime(yesterday, 14, 30, 0),
        action_type: 'modification',
        description: 'Validation des pointages de l\'équipe',
        ip_address: '192.168.1.101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        action_date: setDateTime(twoDaysAgo, 9, 10, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        action_date: setDateTime(twoDaysAgo, 16, 20, 0),
        action_type: 'creation',
        description: 'Création d\'une nouvelle tâche dans le projet "Festival des Arts"',
        ip_address: '192.168.1.101',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Logs de Lucas Petit (Animateur)
      {
        user_id: 3,
        action_date: setDateTime(yesterday, 9, 5, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.102',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        action_date: setDateTime(yesterday, 10, 30, 0),
        action_type: 'modification',
        description: 'Mise à jour de son profil',
        ip_address: '192.168.1.102',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Logs de Léa Durand (Animateur)
      {
        user_id: 4,
        action_date: setDateTime(yesterday, 8, 50, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.103',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        action_date: setDateTime(yesterday, 15, 25, 0),
        action_type: 'creation',
        description: 'Ajout d\'un commentaire sur la tâche "Mise en place du tri sélectif"',
        ip_address: '192.168.1.103',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        action_date: setDateTime(threeDaysAgo, 9, 0, 0),
        action_type: 'login',
        description: 'Connexion au système',
        ip_address: '192.168.1.103',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('activity_logs', null, {});
  }
};