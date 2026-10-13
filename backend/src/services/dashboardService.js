const dashboardRepository = require('../repositories/dashboardRepository');
const projectMemberRepository = require('../repositories/projectMemberRepository');
const { ProjectMember, Task } = require('../models');
const { Op } = require('sequelize');

const getSummary = async (user) => {
  let projectWhere = { isArchived: false };
  let taskWhere = {};

  if (user.role !== 'admin') {
    const memberEntries = await ProjectMember.findAll({
      where: { userId: user.id },
      attributes: ['projectId'],
      raw: true,
    });
    const projectIds = memberEntries.map((m) => m.projectId);

    const { Project } = require('../models');
    const createdProjects = await Project.findAll({
      where: { createdBy: user.id, isArchived: false },
      attributes: ['id'],
      raw: true,
    });
    const createdProjectIds = createdProjects.map((p) => p.id);

    const allProjectIds = [...new Set([...projectIds, ...createdProjectIds])];

    projectWhere = { ...projectWhere, id: { [Op.in]: allProjectIds } };
    taskWhere = { projectId: { [Op.in]: allProjectIds } };
  }

  const projectStats = await dashboardRepository.getProjectStats(projectWhere);
  const taskStats = await dashboardRepository.getTaskStats(taskWhere);
  const completionPercentages = await dashboardRepository.getProjectCompletionPercentages(projectWhere);

  let myTasks = null;
  if (user.role !== 'admin') {
    const myTaskCount = await Task.count({ where: { assigneeId: user.id } });
    const myOverdue = await Task.count({
      where: {
        assigneeId: user.id,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'done' },
      },
    });
    myTasks = { total: myTaskCount, overdue: myOverdue };
  }

  return {
    projects: projectStats,
    tasks: taskStats,
    projectCompletion: completionPercentages,
    myTasks,
  };
};

module.exports = { getSummary };
