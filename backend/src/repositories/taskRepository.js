const { Task, User, Project } = require('../models');

const create = async (data) => {
  return Task.create(data);
};

const findById = async (id) => {
  return Task.findByPk(id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'taskCreator', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
    ],
  });
};

const findAll = async ({ offset, limit, where = {}, order = [['createdAt', 'DESC']] }) => {
  return Task.findAndCountAll({
    where,
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });
};

const update = async (id, data) => {
  const task = await Task.findByPk(id);
  if (!task) return null;
  return task.update(data);
};

const remove = async (id) => {
  return Task.destroy({ where: { id } });
};

const countByStatus = async (where = {}) => {
  const { fn, col } = require('sequelize');
  return Task.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
};

const countOverdue = async (where = {}) => {
  const { Op } = require('sequelize');
  return Task.count({
    where: {
      ...where,
      dueDate: { [Op.lt]: new Date() },
      status: { [Op.ne]: 'done' },
    },
  });
};

const findByAssignee = async (assigneeId, { offset, limit, where = {}, order = [['createdAt', 'DESC']] }) => {
  return Task.findAndCountAll({
    where: { ...where, assigneeId },
    include: [
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  remove,
  countByStatus,
  countOverdue,
  findByAssignee,
};
