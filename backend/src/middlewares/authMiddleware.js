const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const ApiResponse = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Access token is required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.unauthorized(res, 'Invalid or expired access token');
  }
};

module.exports = { authenticate };
