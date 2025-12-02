// ResourceData: Master catalog of resource types. Levels are NOT in DB, applied dynamically from constants.

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config.js';

class ResourceData extends Model {
  static associate(models) {
    // hasOne relationship with Resource
    ResourceData.hasOne(models.Resource, {
      foreignKey: 'resourceDataId',
      as: 'resource'
    });

    // hasMany relationship with ChangeHistory
    ResourceData.hasMany(models.ChangeHistory, {
      foreignKey: 'resourceId',
      as: 'changeHistory'
    });
  }
}

ResourceData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('food', 'oxygen', 'water', 'spare_parts'),
      allowNull: false,
      validate: {
        isIn: [['food', 'oxygen', 'water', 'spare_parts']]
      }
    }
  },
  {
    sequelize,
    modelName: 'ResourceData',
    tableName: 'resource_data',
    timestamps: true,
    underscored: false
  }
);

export default ResourceData;