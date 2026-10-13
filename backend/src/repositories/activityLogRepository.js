const { ActivityLog, User } = require('../models');

const create = async (data) => {
  return ActivityLog.create(data);
};

const findByEntity = async (entityType, entityId, { offset, limit }) => {
  return ActivityLog.findAndCountAll({
    where: { entityType, entityId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });
};

const findByUser = async (userId, { offset, limit }) => {
  return ActivityLog.findAndCountAll({
    where: { userId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });
};

module.exports = {
  create,
  findByEntity,
  findByUser,
};
