import cron from 'node-cron';
import db from '../models/index.js';

const { Resource, ResourceData, ChangeHistory } = db;

/**
 * Cron job that monitors resources every minute
 * Creates a history record for each resource and emits updates via WebSocket
 */
export const startResourceMonitoringCron = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      const resources = await Resource.findAll({
        include: [{
          model: ResourceData,
          as: 'resourceData',
          attributes: ['id', 'name', 'category']
        }]
      });
      
      if (!resources || resources.length === 0) return;

      // Create history records for all resources
      const historyPromises = resources.map(resource => {
        return ChangeHistory.create({
          stock: resource.quantity,
          resourceId: resource.resourceDataId
        });
      });

      await Promise.all(historyPromises);

      const timestamp = new Date();
      console.log(`[CRON] ${resources.length} history records created - ${timestamp.toLocaleString('es-MX')}`);

      // Emit update to all connected WebSocket clients
      if (io) {
        const plainResources = resources.map(r => r.toJSON());

        io.emit('resources:update', {
          resources: plainResources,
          count: plainResources.length,
          timestamp: timestamp.toISOString()
        });

        console.log(`[WebSocket] Update sent to ${io.engine.clientsCount} connected clients`);
      }
    } catch (error) {
      console.error('[CRON] Error in resource monitoring:', error.message);
    }
  });

  console.log('[CRON] Resource monitoring started (runs every 1 minute)');
};

/**
 * Cron job that cleans up old history records
 * Runs daily at 3:00 AM to delete records older than 30 days
 */
export const startHistoryCleanupCron = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { Op } = await import('sequelize');
      const deleted = await ChangeHistory.destroy({
        where: { 
          createdAt: { 
            [Op.lt]: thirtyDaysAgo 
          } 
        }
      });
      
      console.log(`[CRON] ${deleted} old history records deleted (older than 30 days)`);
    } catch (error) {
      console.error('[CRON] Error in history cleanup:', error.message);
    }
  });
  
  console.log('[CRON] Automatic history cleanup started (runs daily at 3:00 AM)');
};

/**
 * Stop all running cron jobs
 */
export const stopAllCronJobs = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('[CRON] All cron jobs stopped');
};
