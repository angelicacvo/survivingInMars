/**
 * Centralized error handler for API responses
 * @param {Object} res - Express response object
 * @param {String} message - User-friendly error message
 * @param {Error} error - Original error object
 */
export const errorHandler = (res, message = 'Server error', error) => {
  console.error(`[ERROR] ${message}:`, error);
  
  // Determine status code based on error type
  let statusCode = 500;
  
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error: ' + error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  } else if (error.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error occurred';
  }
  
  res.status(statusCode).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
};
