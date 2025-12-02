'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const resources = [
      // OXYGEN - UN SOLO REGISTRO (niveles definidos en backend)
      {
        id: 1,
        quantity: faker.number.int({ min: 15000, max: 25000 }),
        resourceDataId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // WATER - UN SOLO REGISTRO (niveles definidos en backend)
      {
        id: 2,
        quantity: faker.number.int({ min: 200, max: 500 }),
        resourceDataId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // SPARE PARTS - UN SOLO REGISTRO (niveles definidos en backend)
      {
        id: 3,
        quantity: faker.number.int({ min: 40, max: 100 }),
        resourceDataId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // FOOD - Protein Pack Storage (niveles definidos en backend)
      {
        id: 4,
        quantity: faker.number.int({ min: 30, max: 60 }),
        resourceDataId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // FOOD - Vegetable Reserves (niveles definidos en backend)
      {
        id: 5,
        quantity: faker.number.int({ min: 20, max: 50 }),
        resourceDataId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // FOOD - Carbohydrate Supply (niveles definidos en backend)
      {
        id: 6,
        quantity: faker.number.int({ min: 30, max: 70 }),
        resourceDataId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // FOOD - Emergency Rations (niveles definidos en backend)
      {
        id: 7,
        quantity: faker.number.int({ min: 10, max: 30 }),
        resourceDataId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('resources', resources, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('resources', null, {});
  }
};
