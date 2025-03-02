/**
 * Custom error handler for database operations
 */
export class DatabaseError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Handle database connection errors
 * @param {Error} error - The error object
 * @throws {DatabaseError} - Custom error with appropriate status code
 */
export function handleConnectionError(error) {
  console.error('Database connection error:', error);
  throw new DatabaseError('Failed to connect to database', 503);
}

/**
 * Handle database query errors
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed
 * @throws {DatabaseError} - Custom error with appropriate status code
 */
export function handleQueryError(error, operation) {
  console.error(`Database ${operation} error:`, error);
  
  // Handle specific MongoDB errors
  if (error.name === 'ValidationError') {
    return new DatabaseError('Validation error', 400, error.errors);
  }
  
  if (error.code === 11000) {
    return new DatabaseError('Duplicate key error', 409);
  }
  
  return new DatabaseError(`Database ${operation} failed`, 500);
}

/**
 * Format error response for client
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error response
 */
export function formatErrorResponse(error) {
  if (error instanceof DatabaseError) {
    return {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      }
    };
  }
  
  return {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500
    }
  };
}