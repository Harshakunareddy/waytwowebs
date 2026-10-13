const { TaskComment, User } = require('../models');

const create = async (data) => {
  return TaskComment.create(data);
};

const findByTaskId = async (taskId, { offset, limit }) => {
  return TaskComment.findAndCountAll({
    where: { taskId },
    include: [
      { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });
};

module.exports = {
  create,
  findByTaskId,
};
