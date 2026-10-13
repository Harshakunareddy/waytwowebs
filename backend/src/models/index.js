const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const TaskComment = require('./TaskComment');
const ActivityLog = require('./ActivityLog');

User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', otherKey: 'projectId', as: 'projects' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', otherKey: 'userId', as: 'members' });

Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'taskCreator' });

Task.hasMany(TaskComment, { foreignKey: 'taskId', as: 'comments' });
TaskComment.belongsTo(Task, { foreignKey: 'taskId' });

User.hasMany(TaskComment, { foreignKey: 'userId', as: 'userComments' });
TaskComment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
  TaskComment,
  ActivityLog,
};
