const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('to_do', 'in_progress', 'in_review', 'done'),
    defaultValue: 'to_do',
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tasks',
  indexes: [
    { fields: ['projectId'] },
    { fields: ['assigneeId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['dueDate'] },
  ],
});

module.exports = Task;
