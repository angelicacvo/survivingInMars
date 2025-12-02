// Resource: Stores current quantity. Levels applied dynamically from constants.

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config.js';

class Resource extends Model {
  static associate(models) {
    // belongsTo relationship with ResourceData
    Resource.belongsTo(models.ResourceData, {
      foreignKey: 'resourceDataId',
      as: 'resourceData'
    });
  }
}

Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    resourceDataId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resource_data',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'Resource',
    tableName: 'resources',
    timestamps: true,
    underscored: false
  }
);

export default Resource;
