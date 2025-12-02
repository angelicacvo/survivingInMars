// Business logic for resource management with dynamic level application

import { sequelize } from '../config/database.config.js';
import { Op } from 'sequelize';
import ResourceData from '../models/resources.model.js';
import Resource from '../models/resource.js';
import ChangeHistory from '../models/changeHistory.js';
import { getLevelsByCategory, isResourceCritical } from '../constants/resource.constants.js';

/**
 * Helper function to enrich resources with levels from constants
 */
const enrichResourceWithLevels = (resource) => {
  const resourceData = resource.resourceData;
  const levels = getLevelsByCategory(resourceData.category);
  
  return {
    id: resource.id,
    quantity: resource.quantity,
    resourceDataId: resource.resourceDataId,
    resourceData: {
      id: resourceData.id,
      name: resourceData.name,
      category: resourceData.category
    },
    minimumLevel: levels.minimumLevel,
    criticalLevel: levels.criticalLevel,
    maximumLevel: levels.maximumLevel,
    unit: levels.unit,
    status: resource.quantity <= levels.criticalLevel ? 'critical' : 
            resource.quantity <= levels.minimumLevel ? 'low' : 'normal'
  };
};

// Get all resources with dynamically applied levels from constants
export const getAllResourcesService = async () => {
  const resources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });
  
  return resources.map(r => enrichResourceWithLevels(r));
};

// Filter resources by category and apply standard levels
export const getResourcesByCategoryService = async (category) => {
  const validCategories = ['food', 'oxygen', 'water', 'spare_parts'];
  if (!validCategories.includes(category)) {
    return 'INVALID_CATEGORY';
  }

  const resources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category'],
      where: { category }
    }]
  });

  return resources.map(r => enrichResourceWithLevels(r));
};

// Get single resource by ID with applied levels
export const getResourceByIdService = async (id) => {
  const resource = await Resource.findByPk(id, {
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  if (!resource) {
    return null;
  }

  return enrichResourceWithLevels(resource);
};

// Update resource quantity and log to history (uses transaction for consistency)
export const updateResourceQuantityService = async (id, quantity) => {
  if (quantity === undefined || quantity === null || quantity < 0) {
    return 'INVALID_QUANTITY';
  }

  const resource = await Resource.findByPk(id, {
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });
  
  if (!resource) {
    return 'RESOURCE_NOT_FOUND';
  }

  const transaction = await sequelize.transaction();
  
  try {
    const oldQuantity = resource.quantity;
    resource.quantity = quantity;
    await resource.save({ transaction });

    await ChangeHistory.create({
      stock: quantity,
      resourceId: resource.resourceDataId,
      changeType: quantity > oldQuantity ? 'increase' : quantity < oldQuantity ? 'decrease' : 'update'
    }, { transaction });

    await transaction.commit();
    
    // Return enriched resource
    return enrichResourceWithLevels(resource);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get resources at or below critical levels (defined in constants)
export const getCriticalResourcesService = async () => {
  const resources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  // Filter and enrich critical resources
  return resources
    .filter(resource => isResourceCritical(resource.quantity, resource.resourceData.category))
    .map(r => enrichResourceWithLevels(r));
};

// Manually create history record (cron job creates them automatically every minute)
export const createChangeHistoryService = async (data) => {
  if (!data.stock || data.stock < 0) {
    return 'INVALID_STOCK';
  }
  if (!data.resourceId) {
    return 'RESOURCE_ID_REQUIRED';
  }

  const resourceData = await ResourceData.findByPk(data.resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  return await ChangeHistory.create({
    stock: data.stock,
    resourceId: data.resourceId
  });
};

// Get history for specific resource (newest to oldest)
export const getResourceHistoryService = async (resourceId, limit = 100) => {
  const resourceData = await ResourceData.findByPk(resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  const history = await ChangeHistory.findAll({
    where: { resourceId },
    order: [['createdAt', 'DESC']],
    limit: limit,
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  return history;
};

// Get recent history for all resources within time window (useful for graphs)
export const getRecentHistoryService = async (minutes = 60) => {
  const timeAgo = new Date();
  timeAgo.setMinutes(timeAgo.getMinutes() - minutes);

  const history = await ChangeHistory.findAll({
    where: {
      createdAt: {
        [Op.gte]: timeAgo
      }
    },
    order: [['createdAt', 'DESC']],
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  return history;
};

// Calculate statistics (avg, min, max, trend) for resource over last 24h
export const getHistoryStatsService = async (resourceId) => {
  const resourceData = await ResourceData.findByPk(resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  // Get history from last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const history = await ChangeHistory.findAll({
    where: { 
      resourceId,
      createdAt: {
        [Op.gte]: oneDayAgo
      }
    },
    order: [['createdAt', 'ASC']]
  });

  if (history.length === 0) {
    return {
      resourceData,
      stats: {
        average: 0,
        min: 0,
        max: 0,
        current: 0,
        trend: 'stable',
        totalRecords: 0
      }
    };
  }

  // Calculate statistics
  const values = history.map(h => h.stock);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const current = values[values.length - 1];
  const firstValue = values[0];

  // Determine trend
  let trend = 'stable';
  const change = current - firstValue;
  const percentageChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  if (percentageChange > 5) {
    trend = 'increasing';
  } else if (percentageChange < -5) {
    trend = 'decreasing';
  }

  return {
    resourceData,
    stats: {
      average: Math.round(average),
      min,
      max,
      current,
      trend,
      percentageChange: Math.round(percentageChange * 100) / 100,
      totalRecords: history.length,
      timeRange: '24h'
    }
  };
};

// Create a new resource entry (for adding new resources to track)
export const createResourceService = async (data) => {
  const { resourceDataId, quantity } = data;
  
  if (!resourceDataId) {
    return 'RESOURCE_DATA_ID_REQUIRED';
  }
  
  if (quantity === undefined || quantity === null || quantity < 0) {
    return 'INVALID_QUANTITY';
  }
  
  const resourceData = await ResourceData.findByPk(resourceDataId);
  if (!resourceData) {
    return 'RESOURCE_DATA_NOT_FOUND';
  }
  
  // Check if resource already exists
  const existingResource = await Resource.findOne({
    where: { resourceDataId }
  });
  
  if (existingResource) {
    return 'RESOURCE_ALREADY_EXISTS';
  }
  
  const resource = await Resource.create({
    resourceDataId,
    quantity
  });
  
  // Reload with associations
  const enrichedResource = await Resource.findByPk(resource.id, {
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });
  
  return enrichResourceWithLevels(enrichedResource);
};

// Get all available ResourceData (for dropdown/selection in frontend)
export const getAllResourceDataService = async () => {
  return await ResourceData.findAll({
    attributes: ['id', 'name', 'category'],
    order: [['category', 'ASC'], ['name', 'ASC']]
  });
};
