'use strict';
const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Récupérer les structures existantes et leurs IDs
    const structures = await queryInterface.sequelize.query(
      `SELECT id, name FROM structures;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    console.log('Structures trouvées:', structures);

    if (!structures || structures.length === 0) {
      throw new Error("Aucune structure n'existe dans la base de données");
    }

    // 2. Fonction pour trouver l'ID d'une structure par son nom
    const findStructureIdByName = (name) => {
      const structure = structures.find(s => s.name === name);
      if (!structure) {
        throw new Error(`Structure '${name}' non trouvée`);
      }
      return structure.id;
    };

    try {
      // 3. Récupérer les IDs des structures dont vous avez besoin
      const parisId = findStructureIdByName('Centre de Loisirs Paris');
      const lyonId = findStructureIdByName('Centre Animation Lyon');
      const marseilleId = findStructureIdByName('Maison des Jeunes Marseille');

      console.log('ID Centre Paris:', parisId);
      console.log('ID Centre Lyon:', lyonId);
      console.log('ID Marseille:', marseilleId);

      // 4. Hasher les mots de passe
      const hashedPassword = await bcryptjs.hash('password123', 10);

      // 5. Insérer les utilisateurs avec les IDs dynamiques des structures
      return queryInterface.bulkInsert('users', [
        {
          email: 'admin@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Dubois',
          first_name: 'Jean',
          phone: '0601020304',
          structure_id: parisId, // Utiliser l'ID dynamique, pas une valeur fixe comme 1
          role: 'admin',
          contract_type: 'permanent',
          weekly_hours: 35,
          annual_hours: 1607,
          contract_start_date: new Date('2023-01-01'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'directeur@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Martin',
          first_name: 'Sophie',
          phone: '0602030405',
          structure_id: parisId, // Utiliser l'ID dynamique
          role: 'director',
          contract_type: 'permanent',
          weekly_hours: 35,
          annual_hours: 1607,
          contract_start_date: new Date('2023-01-15'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'animateur1@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Petit',
          first_name: 'Lucas',
          phone: '0603040506',
          structure_id: parisId, // Utiliser l'ID dynamique
          role: 'animator',
          contract_type: 'fixed_term',
          weekly_hours: 24,
          annual_hours: 1100,
          contract_start_date: new Date('2023-02-01'),
          contract_end_date: new Date('2023-08-31'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'animateur2@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Durand',
          first_name: 'Léa',
          phone: '0604050607',
          structure_id: parisId, // Utiliser l'ID dynamique
          role: 'animator',
          contract_type: 'permanent',
          weekly_hours: 30,
          annual_hours: 1372,
          contract_start_date: new Date('2022-09-01'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'directeur.lyon@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Moreau',
          first_name: 'Thomas',
          phone: '0605060708',
          structure_id: lyonId, // Utiliser l'ID dynamique
          role: 'director',
          contract_type: 'permanent',
          weekly_hours: 35,
          annual_hours: 1607,
          contract_start_date: new Date('2022-11-01'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'animateur.lyon@gardien-temps.com',
          password: hashedPassword,
          last_name: 'Lefebvre',
          first_name: 'Emma',
          phone: '0606070809',
          structure_id: lyonId, // Utiliser l'ID dynamique
          role: 'animator',
          contract_type: 'fixed_term',
          weekly_hours: 20,
          annual_hours: 920,
          contract_start_date: new Date('2023-03-01'),
          contract_end_date: new Date('2023-09-30'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de la création des utilisateurs:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};