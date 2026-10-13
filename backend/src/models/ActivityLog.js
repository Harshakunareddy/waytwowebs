const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  updatedAt: false,
  indexes: [
    { fields: ['entityType', 'entityId'] },
    { fields: ['userId'] },
  ],
});

module.exports = ActivityLog;
