const projectService = require('../services/projectService');
const activityLogService = require('../services/activityLogService');
const ApiResponse = require('../utils/apiResponse');

const create = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return ApiResponse.created(res, project, 'Project created');
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.query, req.user);
    return ApiResponse.success(res, result.projects, 'Projects retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(parseInt(req.params.id, 10), req.user);
    return ApiResponse.success(res, project);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(parseInt(req.params.id, 10), req.body, req.user);
    return ApiResponse.success(res, project, 'Project updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await projectService.deleteProject(parseInt(req.params.id, 10), req.user.id);
    return ApiResponse.success(res, null, 'Project archived');
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const members = await projectService.addMember(parseInt(req.params.id, 10), req.body.userId, req.user);
    return ApiResponse.created(res, members, 'Member added');
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(parseInt(req.params.id, 10), parseInt(req.params.userId, 10), req.user);
    return ApiResponse.success(res, null, 'Member removed');
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await projectService.getProjectMembers(parseInt(req.params.id, 10), req.user);
    return ApiResponse.success(res, members);
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const result = await activityLogService.getEntityLogs('project', parseInt(req.params.id, 10), req.query);
    return ApiResponse.success(res, result.logs, 'Activity logs retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getById, update, remove, addMember, removeMember, getMembers, getActivityLogs };
