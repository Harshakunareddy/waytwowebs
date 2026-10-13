const taskService = require('../services/taskService');
const activityLogService = require('../services/activityLogService');
const ApiResponse = require('../utils/apiResponse');

const create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    return ApiResponse.created(res, task, 'Task created');
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await taskService.getTasks(req.query, req.user);
    return ApiResponse.success(res, result.tasks, 'Tasks retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(parseInt(req.params.id, 10), req.user);
    return ApiResponse.success(res, task);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(parseInt(req.params.id, 10), req.body, req.user);
    return ApiResponse.success(res, task, 'Task updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await taskService.deleteTask(parseInt(req.params.id, 10), req.user);
    return ApiResponse.success(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const result = await activityLogService.getEntityLogs('task', parseInt(req.params.id, 10), req.query);
    return ApiResponse.success(res, result.logs, 'Activity logs retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getById, update, remove, getActivityLogs };
