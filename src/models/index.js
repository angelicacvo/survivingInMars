import { sequelize } from '../config/database.config.js';
import ResourceData from './resources.model.js';
import Resource from './resource.js';
import ChangeHistory from './changeHistory.js';

const db = {
  sequelize,
  ResourceData,
  Resource,
  ChangeHistory
};

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
