const { Op } = require('sequelize');
const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');
const projectMemberRepository = require('../repositories/projectMemberRepository');
const activityLogService = require('./activityLogService');
const { parsePagination, buildMeta, parseSorting } = require('../utils/pagination');

const checkProjectAccess = async (projectId, user) => {
  const project = await projectRepository.findById(projectId);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin') {
    const isMember = await projectMemberRepository.isProjectMember(projectId, user.id);
    if (!isMember && project.createdBy !== user.id) {
      const error = new Error('Not authorized to access this project');
      error.statusCode = 403;
      throw error;
    }
  }

  return project;
};

const createTask = async (data, user) => {
  await checkProjectAccess(data.projectId, user);

  if (data.assigneeId) {
    const isMember = await projectMemberRepository.isProjectMember(data.projectId, data.assigneeId);
    if (!isMember) {
      const error = new Error('Assignee must be a project member');
      error.statusCode = 400;
      throw error;
    }
  }

  const task = await taskRepository.create({ ...data, createdBy: user.id });
  await activityLogService.log({
    action: 'task_created',
    entityType: 'task',
    entityId: task.id,
    userId: user.id,
    details: { title: task.title, projectId: task.projectId },
  });
  return taskRepository.findById(task.id);
};

const getTasks = async (query, user) => {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, sortOrder } = parseSorting(query, ['title', 'priority', 'status', 'dueDate', 'createdAt']);
  const where = {};

  if (query.projectId) {
    await checkProjectAccess(parseInt(query.projectId, 10), user);
    where.projectId = query.projectId;
  }
  if (query.assigneeId) where.assigneeId = query.assigneeId;
  if (query.priority) where.priority = query.priority;
  if (query.status) where.status = query.status;
  if (query.search) where.title = { [Op.like]: `%${query.search}%` };

  if (user.role === 'team_member' && !query.projectId) {
    where.assigneeId = user.id;
  }

  const { rows, count } = await taskRepository.findAll({
    offset,
    limit,
    where,
    order: [[sortBy, sortOrder]],
  });

  return {
    tasks: rows,
    meta: buildMeta(page, limit, count),
  };
};

const getTaskById = async (id, user) => {
  const task = await taskRepository.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await checkProjectAccess(task.projectId, user);
  return task;
};

const updateTask = async (id, data, user) => {
  const task = await taskRepository.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await checkProjectAccess(task.projectId, user);

  if (user.role === 'team_member' && task.assigneeId !== user.id) {
    const error = new Error('Not authorized to update this task');
    error.statusCode = 403;
    throw error;
  }

  if (data.assigneeId) {
    const isMember = await projectMemberRepository.isProjectMember(task.projectId, data.assigneeId);
    if (!isMember) {
      const error = new Error('Assignee must be a project member');
      error.statusCode = 400;
      throw error;
    }
  }

  const oldStatus = task.status;
  const updated = await taskRepository.update(id, data);

  const logDetails = { ...data };
  if (data.status && data.status !== oldStatus) {
    logDetails.previousStatus = oldStatus;
  }

  await activityLogService.log({
    action: data.status && data.status !== oldStatus ? 'task_status_changed' : 'task_updated',
    entityType: 'task',
    entityId: id,
    userId: user.id,
    details: logDetails,
  });

  return taskRepository.findById(updated.id);
};

const deleteTask = async (id, user) => {
  const task = await taskRepository.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await checkProjectAccess(task.projectId, user);

  await taskRepository.remove(id);
  await activityLogService.log({
    action: 'task_deleted',
    entityType: 'task',
    entityId: id,
    userId: user.id,
    details: { title: task.title },
  });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
