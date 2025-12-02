import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { sequelize } from './config/database.config.js';

import { router as resourceRoutes } from "./routes/resource.routes.js";
import { startResourceMonitoringCron, startHistoryCleanupCron } from './cron/resource.cron.js';

/**
 * Clase principal del servidor
 * Configura Express, base de datos, middlewares, rutas, WebSockets y cron jobs
 */
export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    // Crear servidor HTTP
    this.httpServer = createServer(this.app);
    
    // Configurar Socket.IO para tiempo real
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Hacer io accesible globalmente para los cron jobs
    global.io = this.io;

    // Definición de rutas base de la API
    this.paths = {
      resources: "/api/resources",
    };

    // Configurar middlewares y rutas PRIMERO
    this.middlewares();
    this.sockets();
    this.routes();
    
    // LUEGO iniciar servidor (listen PRIMERO, DB DESPUÉS)
    this.listen();
    this.databaseInit();
  }

  /**
   * Inicializa la conexión a la base de datos
   * y arranca los cron jobs una vez conectado
   */
  async databaseInit() {
    try {
      await sequelize.authenticate();
      console.log('[DB] Database connection successful');
      
      this.startCronJobs();
    } catch (error) {
      console.error('[DB] Error connecting to database', error);
      throw error;
    }
  }

  /**
   * Inicia las tareas programadas (cron jobs)
   * - Monitoreo cada minuto: registra estado de recursos
   * - Limpieza diaria: elimina registros antiguos
   */
  startCronJobs() {
    console.log('[CRON] Iniciando cron jobs...');
    
    startResourceMonitoringCron(this.io);
    startHistoryCleanupCron();
    
    console.log('[CRON] Todos los cron jobs iniciados correctamente');
  }

  /**
   * Configura eventos de WebSocket para tiempo real
   */
  sockets() {
    this.io.on('connection', async (socket) => {
      console.log('[WebSocket] Cliente conectado:', socket.id);
      
      // Enviar estado inicial al conectarse
      socket.emit('welcome', {
        message: 'Conectado al sistema de monitoreo en tiempo real',
        timestamp: new Date().toISOString()
      });
      
      // Enviar datos iniciales de recursos al conectarse
      try {
        const { getAllResourcesService } = await import('./services/resource.service.js');
        const resources = await getAllResourcesService();
        
        socket.emit('resources:initial', {
          resources: resources,
          count: resources.length,
          timestamp: new Date().toISOString()
        });
        
        console.log(`[WebSocket] Datos iniciales enviados a ${socket.id}: ${resources.length} recursos`);
      } catch (error) {
        console.error('[WebSocket] Error enviando datos iniciales:', error.message);
      }
      
      socket.on('disconnect', () => {
        console.log('[WebSocket] Cliente desconectado:', socket.id);
      });
    });
  }

  /**
   * Registra las rutas de la aplicación
   */
  routes() {
    // Ruta de prueba super simple
    this.app.get('/ping', (req, res) => {
      res.json({ message: 'pong', timestamp: new Date().toISOString() });
    });
    
    this.app.use(this.paths.resources, resourceRoutes);
  }

  /**
   * Configura middlewares de Express
   * - CORS: permite peticiones desde cualquier origen
   * - express.json(): parsea el body de las peticiones JSON
   * - express.static(): sirve archivos estáticos (dashboard HTML)
   */
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  /**
   * Inicia el servidor HTTP en el puerto configurado
   */
  listen() {
    try {
      this.httpServer.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
        console.log(`WebSocket server ready for real-time updates`);
      });
    } catch (error) {
      console.error(`[Server] Error starting server`, error);
      throw error;
    }
  }
}


