const userService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return ApiResponse.success(res, result.users, 'Users retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id, 10));
    return ApiResponse.success(res, user);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(parseInt(req.params.id, 10), req.body);
    return ApiResponse.success(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await userService.deleteUser(parseInt(req.params.id, 10));
    return ApiResponse.success(res, null, 'User deactivated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, update, remove };
