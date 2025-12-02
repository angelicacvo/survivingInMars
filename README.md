# Ares Frontier - Sistema de Gestión de Recursos para Base en Marte 🚀

API REST completa para monitorear y gestionar recursos vitales en una base de Marte. Incluye monitoreo en tiempo real con WebSockets, registro automático cada minuto, alertas de recursos críticos, y análisis estadístico del historial.

---

## 📋 Descripción

Sistema backend robusto que monitorea recursos críticos (oxígeno, agua, comida, repuestos) con:
- ✅ API REST completa con CRUD
- ✅ WebSocket para actualizaciones en tiempo real
- ✅ Registro automático del estado cada minuto (cron job)
- ✅ Alertas de recursos críticos
- ✅ Historial completo de cambios
- ✅ Estadísticas y análisis de tendencias
- ✅ Niveles estándar configurables por categoría
- ✅ Limpieza automática de datos antiguos

---

## 🛠 Tecnologías

- **Backend**: Node.js + Express 5
- **Base de datos**: PostgreSQL
- **ORM**: Sequelize
- **WebSocket**: Socket.IO
- **Cron Jobs**: node-cron
- **CORS**: Habilitado para conexión con frontend

---

## 📦 Instalación

### 1. Clonar repositorio
```bash
git clone <repository-url>
cd aresFrontier
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ares_frontier
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Configurar base de datos
```bash
# Ejecutar migraciones
npm run db:migrate

# Poblar con datos iniciales
npm run db:seed

# Verificar conexión (opcional)
npm run db:verify
```

### 5. Iniciar servidor
```bash
npm start
```

Servidor disponible en: `http://localhost:3001`

---

## 🌐 API Endpoints

### **Recursos (Resources)**

#### `GET /api/resources`
Obtener todos los recursos con niveles aplicados
```json
{
  "message": "Resources retrieved successfully",
  "resources": [
    {
      "id": 1,
      "quantity": 15000,
      "resourceDataId": 1,
      "resourceData": {
        "id": 1,
        "name": "Main Oxygen Tank",
        "category": "oxygen"
      },
      "minimumLevel": 3000,
      "criticalLevel": 5000,
      "maximumLevel": 25000,
      "unit": "L",
      "status": "normal"
    }
  ]
}
```

#### `GET /api/resources/:id`
Obtener un recurso específico por ID

#### `GET /api/resources/category/:category`
Filtrar recursos por categoría
- Categorías válidas: `oxygen`, `water`, `food`, `spare_parts`

#### `GET /api/resources/alerts`
Obtener recursos en estado crítico
```json
{
  "message": "Critical resources retrieved successfully",
  "resources": [...],
  "count": 2
}
```

#### `POST /api/resources`
Crear un nuevo recurso
```bash
curl -X POST http://localhost:3001/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "resourceDataId": 1,
    "quantity": 10000
  }'
```

#### `PUT /api/resources/:id/update-quantity`
Actualizar cantidad de un recurso
```bash
curl -X PUT http://localhost:3001/api/resources/1/update-quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 20000}'
```

### **ResourceData (Catálogo de Recursos)**

#### `GET /api/resources/data`
Obtener todos los tipos de recursos disponibles (para dropdowns en frontend)
```json
{
  "message": "ResourceData retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Main Oxygen Tank",
      "category": "oxygen"
    }
  ],
  "count": 10
}
```

### **Historial (History)**

#### `GET /api/resources/:id/history?limit=100`
Obtener historial de un recurso específico
- Query params: `limit` (default: 100)

#### `GET /api/resources/history/recent?minutes=60`
Obtener historial reciente de todos los recursos
- Query params: `minutes` (default: 60)

#### `GET /api/resources/:id/stats`
Obtener estadísticas y tendencias de un recurso (últimas 24h)
```json
{
  "message": "Resource statistics retrieved successfully",
  "data": {
    "resourceData": {...},
    "stats": {
      "average": 15432,
      "min": 14000,
      "max": 17000,
      "current": 15000,
      "trend": "decreasing",
      "percentageChange": -2.85,
      "totalRecords": 1440,
      "timeRange": "24h"
    }
  }
}
```

---

## 🔌 WebSocket Events

### Eventos que el cliente puede escuchar:

#### `welcome`
Evento al conectarse
```javascript
socket.on('welcome', (data) => {
  console.log(data.message); // "Conectado al sistema de monitoreo en tiempo real"
});
```

#### `resources:initial`
Datos iniciales al conectarse
```javascript
socket.on('resources:initial', (data) => {
  console.log(data.resources); // Array de recursos
  console.log(data.count);     // Cantidad total
});
```

#### `resources:update`
Actualizaciones cada minuto (emitido por cron job)
```javascript
socket.on('resources:update', (data) => {
  console.log(data.resources); // Array actualizado de recursos
  console.log(data.timestamp); // ISO timestamp
});
```

### Ejemplo de conexión desde frontend:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('resources:update', (data) => {
  // Actualizar UI con nuevos datos
  updateResourcesUI(data.resources);
});
```

---

## ⚙️ Funcionalidades

### 1. Niveles Estándar por Categoría

Los niveles se aplican automáticamente según la categoría del recurso:

| Categoría | Mínimo | Crítico | Máximo | Unidad |
|-----------|--------|---------|--------|--------|
| Oxygen | 3000 L | 5000 L | 25000 L | L |
| Water | 50 L | 80 L | 500 L | L |
| Spare Parts | 10 u | 20 u | 100 u | u |
| Food | 5 kg | 10 kg | 70 kg | kg |

**Status del recurso:**
- `critical`: Cantidad <= nivel crítico (requiere atención inmediata)
- `low`: Cantidad <= nivel mínimo
- `normal`: Cantidad > nivel crítico

### 2. Monitoreo Automático (Cron Jobs)

#### Monitoreo de Recursos (Cada minuto)
- Registra el estado actual de todos los recursos en `change_history`
- Emite actualizaciones via WebSocket a todos los clientes conectados
- Permite análisis histórico y gráficas

#### Limpieza de Historial (Diario a las 3:00 AM)
- Elimina registros de `change_history` más antiguos de 30 días
- Mantiene la base de datos optimizada

### 3. Arquitectura del Proyecto

```
aresFrontier/
├── app.js                          # Entry point
├── src/
│   ├── server.js                   # Configuración Express + WebSocket
│   ├── config/
│   │   ├── database.config.js      # Conexión Sequelize
│   │   └── database.cjs            # Config para CLI
│   ├── constants/
│   │   └── resource.constants.js   # Niveles por categoría
│   ├── controllers/
│   │   └── resource.controller.js  # Lógica de endpoints
│   ├── services/
│   │   └── resource.service.js     # Lógica de negocio
│   ├── routes/
│   │   └── resource.routes.js      # Definición de rutas
│   ├── models/
│   │   ├── index.js                # Inicialización de modelos
│   │   ├── resource.js             # Modelo Resource
│   │   ├── resources.model.js      # Modelo ResourceData
│   │   └── changeHistory.js        # Modelo ChangeHistory
│   ├── cron/
│   │   └── resource.cron.js        # Tareas programadas
│   ├── utils/
│   │   └── error.handle.js         # Manejo de errores
│   ├── migrations/                 # Migraciones de BD
│   └── seeders/                    # Datos iniciales
├── .env                            # Variables de entorno
├── .env.example                    # Plantilla de variables
├── package.json
└── README.md
```

---

## 🗄️ Modelos de Base de Datos

### ResourceData
Catálogo de tipos de recursos disponibles
```javascript
{
  id: INTEGER,
  name: STRING,          // "Main Oxygen Tank"
  category: STRING       // "oxygen", "water", "food", "spare_parts"
}
```

### Resource
Recursos actuales siendo monitoreados
```javascript
{
  id: INTEGER,
  quantity: INTEGER,
  resourceDataId: INTEGER  // FK a ResourceData
}
```

### ChangeHistory
Historial de cambios de cantidad
```javascript
{
  id: INTEGER,
  stock: INTEGER,
  resourceId: INTEGER,     // FK a ResourceData
  createdAt: DATE
}
```

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start                  # Inicia servidor con nodemon

# Base de datos
npm run db:migrate         # Ejecuta migraciones
npm run db:migrate:undo    # Revierte todas las migraciones
npm run db:seed            # Ejecuta seeders (datos iniciales)
npm run db:seed:undo       # Revierte seeders
npm run db:verify          # Verifica conexión y datos
```

---

## 🔧 Configuración de CORS

Por defecto, CORS está habilitado para todos los orígenes (`*`). Para producción, configura orígenes específicos en `src/server.js`:

```javascript
this.app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## 📊 Ejemplos de Uso

### Obtener recursos críticos y mostrar alertas
```javascript
fetch('http://localhost:3001/api/resources/alerts')
  .then(res => res.json())
  .then(data => {
    data.resources.forEach(resource => {
      console.log(`⚠️ ${resource.resourceData.name}: ${resource.quantity}${resource.unit}`);
    });
  });
```

### Actualizar recurso y registrar cambio
```javascript
fetch('http://localhost:3001/api/resources/1/update-quantity', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ quantity: 18000 })
})
  .then(res => res.json())
  .then(data => {
    console.log('Resource updated:', data.resource);
  });
```

### Obtener estadísticas para gráfica
```javascript
fetch('http://localhost:3001/api/resources/1/stats')
  .then(res => res.json())
  .then(data => {
    const { average, min, max, trend } = data.data.stats;
    console.log(`Promedio: ${average}, Tendencia: ${trend}`);
  });
```

---

## 🐛 Debugging

### Verificar WebSocket
Abre la consola del navegador:
```javascript
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!'));
socket.on('resources:update', data => console.log('Update:', data));
```

### Ver logs del servidor
```bash
npm start
# Busca:
# [CRON] Resource monitoring started
# [WebSocket] Cliente conectado
# [CRON] X history records created
```

---

## 📝 Notas Importantes

1. **Crear recursos**: Usa `POST /api/resources` solo para agregar nuevos recursos al sistema. Los recursos iniciales se crean con seeders.

2. **WebSocket**: El evento correcto es `resources:update` (no `connection`). Escucha este evento en tu frontend.

3. **Historial**: Se genera automáticamente cada minuto. No es necesario crearlo manualmente.

4. **Niveles**: Están definidos en `src/constants/resource.constants.js` y se aplican automáticamente según la categoría.

5. **Transacciones**: La actualización de cantidad usa transacciones de Sequelize para garantizar consistencia entre `resources` y `change_history`.

---

## 🤝 Contribución

Este es un proyecto educativo para gestión de recursos en una misión espacial a Marte. Las mejoras son bienvenidas.

---

## 📄 Licencia

ISC

---

## 👨‍💻 Autor

Desarrollado como proyecto de backend para simulación de base en Marte.

