const { Op } = require('sequelize');
const projectRepository = require('../repositories/projectRepository');
const projectMemberRepository = require('../repositories/projectMemberRepository');
const activityLogService = require('./activityLogService');
const { parsePagination, buildMeta, parseSorting } = require('../utils/pagination');

const createProject = async (data, userId) => {
  const project = await projectRepository.create({ ...data, createdBy: userId });
  await projectMemberRepository.addMember(project.id, userId);
  await activityLogService.log({
    action: 'project_created',
    entityType: 'project',
    entityId: project.id,
    userId,
    details: { name: project.name },
  });
  return projectRepository.findById(project.id);
};

const getProjects = async (query, user) => {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, sortOrder } = parseSorting(query, ['name', 'status', 'startDate', 'deadline', 'createdAt']);
  const where = { isArchived: false };
  if (query.status) where.status = query.status;
  if (query.search) where.name = { [Op.like]: `%${query.search}%` };

  let result;
  if (user.role === 'admin') {
    result = await projectRepository.findAll({ offset, limit, where, order: [[sortBy, sortOrder]] });
  } else {
    result = await projectRepository.findUserProjects(user.id, { offset, limit, where, order: [[sortBy, sortOrder]] });
  }

  return {
    projects: result.rows,
    meta: buildMeta(page, limit, result.count),
  };
};

const getProjectById = async (id, user) => {
  const project = await projectRepository.findById(id);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin') {
    const isMember = await projectMemberRepository.isProjectMember(id, user.id);
    if (!isMember && project.createdBy !== user.id) {
      const error = new Error('Not authorized to access this project');
      error.statusCode = 403;
      throw error;
    }
  }

  return project;
};

const updateProject = async (id, data, user) => {
  const project = await projectRepository.findById(id);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin' && project.createdBy !== user.id) {
    const error = new Error('Not authorized to update this project');
    error.statusCode = 403;
    throw error;
  }

  const updated = await projectRepository.update(id, data);
  await activityLogService.log({
    action: 'project_updated',
    entityType: 'project',
    entityId: id,
    userId: user.id,
    details: data,
  });
  return projectRepository.findById(updated.id);
};

const deleteProject = async (id, userId) => {
  const project = await projectRepository.findById(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await projectRepository.remove(id);
  await activityLogService.log({
    action: 'project_archived',
    entityType: 'project',
    entityId: id,
    userId,
    details: { name: project.name },
  });
};

const addMember = async (projectId, userId, currentUser) => {
  const project = await projectRepository.findById(projectId);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role !== 'admin' && project.createdBy !== currentUser.id) {
    const error = new Error('Not authorized to add members');
    error.statusCode = 403;
    throw error;
  }

  const existing = await projectMemberRepository.findMember(projectId, userId);
  if (existing) {
    const error = new Error('User is already a member of this project');
    error.statusCode = 409;
    throw error;
  }

  await projectMemberRepository.addMember(projectId, userId);
  await activityLogService.log({
    action: 'member_added',
    entityType: 'project',
    entityId: projectId,
    userId: currentUser.id,
    details: { addedUserId: userId },
  });

  return projectMemberRepository.findProjectMembers(projectId);
};

const removeMember = async (projectId, userId, currentUser) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role !== 'admin' && project.createdBy !== currentUser.id) {
    const error = new Error('Not authorized to remove members');
    error.statusCode = 403;
    throw error;
  }

  const removed = await projectMemberRepository.removeMember(projectId, userId);
  if (!removed) {
    const error = new Error('User is not a member of this project');
    error.statusCode = 404;
    throw error;
  }

  await activityLogService.log({
    action: 'member_removed',
    entityType: 'project',
    entityId: projectId,
    userId: currentUser.id,
    details: { removedUserId: userId },
  });
};

const getProjectMembers = async (projectId, user) => {
  const project = await projectRepository.findById(projectId);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin') {
    const isMember = await projectMemberRepository.isProjectMember(projectId, user.id);
    if (!isMember && project.createdBy !== user.id) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
  }

  return projectMemberRepository.findProjectMembers(projectId);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
};
