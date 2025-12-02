'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const resourceData = [
      // OXYGEN - UN SOLO REGISTRO
      {
        id: 1,
        name: 'Oxygen',
        category: 'oxygen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // WATER - UN SOLO REGISTRO
      {
        id: 2,
        name: 'Water',
        category: 'water',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // SPARE PARTS - UN SOLO REGISTRO
      {
        id: 3,
        name: 'Spare Parts',
        category: 'spare_parts',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // FOOD - Varios tipos
      {
        id: 4,
        name: 'Protein Pack Storage',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Vegetable Reserves',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Carbohydrate Supply',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Emergency Rations',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('resource_data', resourceData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('resource_data', null, {});
  }
};
