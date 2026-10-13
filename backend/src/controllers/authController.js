const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    if (err.statusCode === 403 || err.message?.toLowerCase().includes('deactivated')) {
      return ApiResponse.forbidden(res, err.message || 'Your account has been deactivated. Please contact an administrator.');
    }
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return ApiResponse.success(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const userRepository = require('../repositories/userRepository');
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }
    return ApiResponse.success(res, user.toSafeObject());
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };
