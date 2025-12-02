// Controllers handle HTTP requests and responses for resource endpoints

import { errorHandler } from '../utils/error.handle.js';
import {
  getAllResourcesService,
  getResourcesByCategoryService,
  getResourceByIdService,
  updateResourceQuantityService,
  getCriticalResourcesService,
  createResourceService,
  getAllResourceDataService,
  getResourceHistoryService,
  getRecentHistoryService,
  getHistoryStatsService
} from '../services/resource.service.js';

// GET /api/resources/ - List all resources with dynamic levels
export const getAllResourcesController = async (req, res) => {
  try {
    const data = await getAllResourcesService();
    return res.status(200).json({ 
      message: 'Resources retrieved successfully', 
      resources: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resources', e);
  }
};

// GET /api/resources/category/:category - Filter resources by category
export const getResourcesByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const data = await getResourcesByCategoryService(category);
    
    if (data === 'INVALID_CATEGORY') {
      return res.status(400).json({ 
        message: 'Invalid category. Use: food, oxygen, water, or spare_parts' 
      });
    }
    
    return res.status(200).json({ 
      message: `Resources for category ${category} retrieved successfully`, 
      resources: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resources by category', e);
  }
};

// GET /api/resources/:id - Get resource by ID
export const getResourceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getResourceByIdService(Number(id));
    
    if (!data) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource retrieved successfully', 
      resource: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource', e);
  }
};

// PUT /api/resources/:id/update-quantity - Update resource quantity and log to history
export const updateResourceQuantityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const result = await updateResourceQuantityService(Number(id), quantity);
    
    if (result === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (result === 'INVALID_QUANTITY') {
      return res.status(400).json({ message: 'Invalid quantity. Must be a positive number' });
    }
    
    // Enviar actualización por WebSocket a todos los clientes conectados
    if (global.io) {
      const allResources = await getAllResourcesService();
      global.io.emit('resources:update', {
        resources: allResources,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(200).json({ 
      message: 'Resource quantity updated successfully', 
      resource: result 
    });
  } catch (e) {
    errorHandler(res, 'Error updating resource quantity', e);
  }
};

// GET /api/resources/alerts - Get resources at or below critical levels
export const getCriticalResourcesController = async (req, res) => {
  try {
    const data = await getCriticalResourcesService();
    return res.status(200).json({ 
      message: 'Critical resources retrieved successfully', 
      resources: data,
      count: data.length
    });
  } catch (e) {
    errorHandler(res, 'Error getting critical resources', e);
  }
};

// POST /api/resources - Create a new resource
export const createResourceController = async (req, res) => {
  try {
    const { resourceDataId, quantity } = req.body;
    
    if (!resourceDataId) {
      return res.status(400).json({ message: 'resourceDataId is required' });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'quantity is required' });
    }
    
    const result = await createResourceService({ resourceDataId, quantity });
    
    if (result === 'RESOURCE_DATA_ID_REQUIRED') {
      return res.status(400).json({ message: 'resourceDataId is required' });
    }
    if (result === 'INVALID_QUANTITY') {
      return res.status(400).json({ message: 'Invalid quantity. Must be a positive number' });
    }
    if (result === 'RESOURCE_DATA_NOT_FOUND') {
      return res.status(404).json({ message: 'ResourceData not found' });
    }
    if (result === 'RESOURCE_ALREADY_EXISTS') {
      return res.status(409).json({ message: 'Resource already exists for this ResourceData' });
    }
    
    return res.status(201).json({ 
      message: 'Resource created successfully', 
      resource: result 
    });
  } catch (e) {
    errorHandler(res, 'Error creating resource', e);
  }
};

// GET /api/resources/data - Get all ResourceData (for dropdown/selection)
export const getAllResourceDataController = async (req, res) => {
  try {
    const data = await getAllResourceDataService();
    return res.status(200).json({ 
      message: 'ResourceData retrieved successfully', 
      data: data,
      count: data.length
    });
  } catch (e) {
    errorHandler(res, 'Error getting ResourceData', e);
  }
};

// GET /api/resources/:id/history - Get history for a specific resource
export const getResourceHistoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    
    const data = await getResourceHistoryService(Number(id), limit ? Number(limit) : 100);
    
    if (data === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource history retrieved successfully', 
      history: data,
      count: data.length
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource history', e);
  }
};

// GET /api/resources/history/recent - Get recent history for all resources
export const getRecentHistoryController = async (req, res) => {
  try {
    const { minutes } = req.query;
    const data = await getRecentHistoryService(minutes ? Number(minutes) : 60);
    
    return res.status(200).json({ 
      message: 'Recent history retrieved successfully', 
      history: data,
      count: data.length,
      timeRange: `${minutes || 60} minutes`
    });
  } catch (e) {
    errorHandler(res, 'Error getting recent history', e);
  }
};

// GET /api/resources/:id/stats - Get statistics for a resource
export const getHistoryStatsController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getHistoryStatsService(Number(id));
    
    if (data === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource statistics retrieved successfully', 
      data: data
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource statistics', e);
  }
};
