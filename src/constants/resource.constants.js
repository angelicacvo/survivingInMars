/**
 * Niveles estándar para cada categoría de recurso
 * Define los umbrales de cantidad para determinar el estado del recurso
 * minimumLevel: nivel mínimo aceptable (alerta crítica si está por debajo)
 * criticalLevel: nivel que requiere atención
 * maximumLevel: capacidad máxima de almacenamiento
 */
export const RESOURCE_LEVELS = {
  oxygen: {
    minimumLevel: 3000,    // Reserva mínima para 3 días
    criticalLevel: 5000,   // Reserva para 5 días
    maximumLevel: 25000,   // Capacidad máxima del tanque
    unit: 'L'
  },
  water: {
    minimumLevel: 50,      // Reserva mínima para 3 días
    criticalLevel: 80,     // Reserva para 5 días
    maximumLevel: 500,     // Capacidad máxima del tanque
    unit: 'L'
  },
  spare_parts: {
    minimumLevel: 10,      // Mínimo de piezas de repuesto
    criticalLevel: 20,     // Nivel seguro de repuestos
    maximumLevel: 100,     // Capacidad máxima de almacenamiento
    unit: 'u'
  },
  food: {
    minimumLevel: 5,       // Reserva mínima de alimentos
    criticalLevel: 10,     // Nivel seguro de alimentos
    maximumLevel: 70,      // Capacidad máxima de almacenamiento
    unit: 'kg'
  }
};

// Obtiene los niveles estándar según la categoría del recurso
export const getLevelsByCategory = (category) => {
  return RESOURCE_LEVELS[category] || RESOURCE_LEVELS.food;
};

// Verifica si la cantidad de un recurso está en nivel crítico
export const isResourceCritical = (quantity, category) => {
  const levels = getLevelsByCategory(category);
  return quantity <= levels.criticalLevel;
};

// Verifica si la cantidad está por debajo del nivel mínimo aceptable
export const isResourceBelowMinimum = (quantity, category) => {
  const levels = getLevelsByCategory(category);
  return quantity < levels.minimumLevel;
};

// Verifica si la cantidad excede la capacidad máxima
export const isResourceAboveMaximum = (quantity, category) => {
  const levels = getLevelsByCategory(category);
  return quantity > levels.maximumLevel;
};
