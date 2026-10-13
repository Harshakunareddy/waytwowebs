const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message}`, { stack: err.stack, url: req.originalUrl, method: req.method });

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
