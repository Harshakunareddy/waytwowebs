const taskCommentRepository = require('../repositories/taskCommentRepository');
const taskRepository = require('../repositories/taskRepository');
const projectMemberRepository = require('../repositories/projectMemberRepository');
const projectRepository = require('../repositories/projectRepository');
const activityLogService = require('./activityLogService');
const { parsePagination, buildMeta } = require('../utils/pagination');

const addComment = async (taskId, userId, content) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await projectRepository.findById(task.projectId);
  if (!project || project.isArchived) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isMember = await projectMemberRepository.isProjectMember(task.projectId, userId);
  if (!isMember && project.createdBy !== userId) {
    const error = new Error('Not authorized to comment on this task');
    error.statusCode = 403;
    throw error;
  }

  const comment = await taskCommentRepository.create({ taskId, userId, content });
  await activityLogService.log({
    action: 'comment_added',
    entityType: 'task',
    entityId: taskId,
    userId,
    details: { commentId: comment.id },
  });

  return comment;
};

const getComments = async (taskId, query, user) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin') {
    const isMember = await projectMemberRepository.isProjectMember(task.projectId, user.id);
    const project = await projectRepository.findById(task.projectId);
    if (!isMember && project.createdBy !== user.id) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
  }

  const { page, limit, offset } = parsePagination(query);
  const { rows, count } = await taskCommentRepository.findByTaskId(taskId, { offset, limit });

  return {
    comments: rows,
    meta: buildMeta(page, limit, count),
  };
};

module.exports = { addComment, getComments };
