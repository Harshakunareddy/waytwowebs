const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed'),
    defaultValue: 'planning',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'projects',
  indexes: [
    { fields: ['status'] },
    { fields: ['createdBy'] },
    { fields: ['isArchived'] },
  ],
});

module.exports = Project;
