'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const changeHistory = [];
    
    // Generate 15 history records for the last 7 days
    const resourceIds = [1, 2, 3, 4, 5, 6, 7];
    
    for (let i = 0; i < 15; i++) {
      const resourceId = faker.helpers.arrayElement(resourceIds);
      const daysAgo = faker.number.int({ min: 0, max: 7 });
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      // Generate realistic positive stock values based on resourceId
      let stock;
      if (resourceId === 1 || resourceId === 5) {
        // Oxygen (L)
        stock = faker.number.int({ min: 100, max: 1000 });
      } else if (resourceId === 2 || resourceId === 6) {
        // Water (L)
        stock = faker.number.int({ min: 10, max: 50 });
      } else if (resourceId === 3 || resourceId === 7) {
        // Food (kg)
        stock = faker.number.int({ min: 5, max: 30 });
      } else {
        // Spare parts (u)
        stock = faker.number.int({ min: 1, max: 10 });
      }
      
      changeHistory.push({
        stock: stock,
        resourceId: resourceId,
        createdAt: date,
        updatedAt: date
      });
    }
    
    // Sort by date
    changeHistory.sort((a, b) => a.createdAt - b.createdAt);

    await queryInterface.bulkInsert('change_history', changeHistory, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('change_history', null, {});
  }
};
