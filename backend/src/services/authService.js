const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
  return { accessToken, refreshToken };
};

const register = async ({ firstName, lastName, email, password, role }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await userRepository.create({ firstName, lastName, email, password, role: role || 'team_member' });
  const tokens = generateTokens(user);
  await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
  logger.info(`User registered: ${email}`);

  return {
    user: user.toSafeObject(),
    ...tokens,
  };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user);
  await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
  logger.info(`User logged in: ${email}`);

  return {
    user: user.toSafeObject(),
    ...tokens,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findByIdWithPassword(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const tokens = generateTokens(user);
  await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

  return tokens;
};

const logout = async (userId) => {
  await userRepository.updateRefreshToken(userId, null);
  logger.info(`User logged out: ${userId}`);
};

module.exports = { register, login, refreshAccessToken, logout };
