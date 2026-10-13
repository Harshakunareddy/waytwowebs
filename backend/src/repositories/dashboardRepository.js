const { Project, Task } = require('../models');
const { fn, col, Op } = require('sequelize');

const getProjectStats = async (where = {}) => {
  const total = await Project.count({ where });
  const statusCounts = await Project.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  return { total, statusCounts };
};

const getTaskStats = async (where = {}) => {
  const total = await Task.count({ where });
  const statusCounts = await Task.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  const overdue = await Task.count({
    where: {
      ...where,
      dueDate: { [Op.lt]: new Date() },
      status: { [Op.ne]: 'done' },
    },
  });
  const priorityCounts = await Task.findAll({
    where,
    attributes: ['priority', [fn('COUNT', col('id')), 'count']],
    group: ['priority'],
    raw: true,
  });
  return { total, statusCounts, overdue, priorityCounts };
};

const getProjectCompletionPercentages = async (where = {}) => {
  const projects = await Project.findAll({
    where,
    attributes: ['id', 'name'],
    include: [{
      model: Task,
      as: 'tasks',
      attributes: ['status'],
    }],
  });
  return projects.map((project) => {
    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    return {
      projectId: project.id,
      projectName: project.name,
      totalTasks,
      doneTasks,
      completionPercentage: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  });
};

module.exports = {
  getProjectStats,
  getTaskStats,
  getProjectCompletionPercentages,
};
