import { Router } from 'express';
import {
  getAllResourcesController,
  getResourcesByCategoryController,
  getResourceByIdController,
  updateResourceQuantityController,
  getCriticalResourcesController,
  createResourceController,
  getAllResourceDataController,
  getResourceHistoryController,
  getRecentHistoryController,
  getHistoryStatsController
} from '../controllers/resource.controller.js';

export const router = Router();

/**
 * Resource API Routes
 * Order is important: more specific routes first to avoid conflicts
 */

// Get all ResourceData (for dropdown/selection in frontend)
router.get('/data', getAllResourceDataController);

// Get resources in critical state (alerts)
router.get('/alerts', getCriticalResourcesController);

// Get recent history for all resources
router.get('/history/recent', getRecentHistoryController);

// Filter resources by category (oxygen/water/food/spare_parts)
router.get('/category/:category', getResourcesByCategoryController);

// Get statistics for a specific resource
router.get('/:id/stats', getHistoryStatsController);

// Get history for a specific resource
router.get('/:id/history', getResourceHistoryController);

// Get a specific resource by ID
router.get('/:id', getResourceByIdController);

// Get all resources with applied levels
router.get('/', getAllResourcesController);

// Create a new resource (body: {resourceDataId: number, quantity: number})
router.post('/', createResourceController);

// Update resource quantity (body: {quantity: number})
router.put('/:id/update-quantity', updateResourceQuantityController);
