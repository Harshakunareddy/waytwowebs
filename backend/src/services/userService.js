const userRepository = require('../repositories/userRepository');
const { parsePagination, buildMeta, parseSorting } = require('../utils/pagination');

const getAllUsers = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, sortOrder } = parseSorting(query, ['firstName', 'lastName', 'email', 'role', 'createdAt']);
  const where = {};
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  const { rows, count } = await userRepository.findAll({
    offset,
    limit,
    where,
    order: [[sortBy, sortOrder]],
  });

  return {
    users: rows,
    meta: buildMeta(page, limit, count),
  };
};

const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUser = async (id, data) => {
  const user = await userRepository.update(id, data);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};

const deleteUser = async (id) => {
  const user = await userRepository.update(id, { isActive: false });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
