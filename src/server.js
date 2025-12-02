import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { sequelize } from './config/database.config.js';

import { router as resourceRoutes } from "./routes/resource.routes.js";
import { startResourceMonitoringCron, startHistoryCleanupCron } from './cron/resource.cron.js';

/**
 * Main Server Class
 * Configures Express, database, middlewares, routes, WebSockets and cron jobs
 */
export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    // Create HTTP server
    this.httpServer = createServer(this.app);
    
    // Configure Socket.IO for real-time communication
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Make io globally accessible for cron jobs
    global.io = this.io;

    // Define API base paths
    this.paths = {
      resources: "/api/resources",
    };

    // Configure middlewares and routes FIRST
    this.middlewares();
    this.sockets();
    this.routes();
    
    // THEN start server (listen FIRST, DB initialization AFTER)
    this.listen();
    this.databaseInit();
  }

  /**
   * Initialize database connection and start cron jobs
   */
  async databaseInit() {
    try {
      await sequelize.authenticate();
      console.log('[DB] Database connection successful');
      
      this.startCronJobs();
    } catch (error) {
      console.error('[DB] Error connecting to database:', error);
      throw error;
    }
  }

  /**
   * Start scheduled tasks (cron jobs)
   * - Monitoring every minute: records resource state
   * - Daily cleanup: removes old records
   */
  startCronJobs() {
    console.log('[CRON] Starting cron jobs...');
    
    startResourceMonitoringCron(this.io);
    startHistoryCleanupCron();
    
    console.log('[CRON] All cron jobs started successfully');
  }

  /**
   * Configure WebSocket events for real-time communication
   */
  sockets() {
    this.io.on('connection', async (socket) => {
      console.log('[WebSocket] Client connected:', socket.id);
      
      // Send welcome message when client connects
      socket.emit('welcome', {
        message: 'Connected to real-time monitoring system',
        timestamp: new Date().toISOString()
      });
      
      // Send initial resource data on connection
      try {
        const { getAllResourcesService } = await import('./services/resource.service.js');
        const resources = await getAllResourcesService();
        
        socket.emit('resources:initial', {
          resources: resources,
          count: resources.length,
          timestamp: new Date().toISOString()
        });
        
        console.log(`[WebSocket] Initial data sent to ${socket.id}: ${resources.length} resources`);
      } catch (error) {
        console.error('[WebSocket] Error sending initial data:', error.message);
      }
      
      socket.on('disconnect', () => {
        console.log('[WebSocket] Client disconnected:', socket.id);
      });
    });
  }

  /**
   * Register application routes
   */
  routes() {
    // Simple health check endpoint
    this.app.get('/ping', (req, res) => {
      res.json({ message: 'pong', timestamp: new Date().toISOString() });
    });
    
    this.app.use(this.paths.resources, resourceRoutes);
  }

  /**
   * Configure Express middlewares
   * - CORS: allows requests from any origin
   * - express.json(): parses JSON request bodies
   * - express.static(): serves static files from public directory
   */
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  /**
   * Start HTTP server on configured port
   */
  listen() {
    try {
      this.httpServer.listen(this.port, () => {
        console.log(`[Server] Running on port ${this.port}`);
        console.log(`[WebSocket] Server ready for real-time updates`);
      });
    } catch (error) {
      console.error(`[Server] Error starting server:`, error);
      throw error;
    }
  }
}
