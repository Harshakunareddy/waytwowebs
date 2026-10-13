const { Project, User, ProjectMember } = require('../models');

const create = async (data) => {
  return Project.create(data);
};

const findById = async (id) => {
  return Project.findByPk(id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'role'], through: { attributes: ['joinedAt'] } },
    ],
  });
};

const findAll = async ({ offset, limit, where = {}, order = [['createdAt', 'DESC']] }) => {
  return Project.findAndCountAll({
    where,
    include: [
      { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });
};

const update = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  return project.update(data);
};

const remove = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  return project.update({ isArchived: true });
};

const findUserProjects = async (userId, { offset, limit, where = {}, order = [['createdAt', 'DESC']] }) => {
  const memberProjectIds = await ProjectMember.findAll({
    where: { userId },
    attributes: ['projectId'],
    raw: true,
  });
  const projectIds = memberProjectIds.map((m) => m.projectId);

  const { Op } = require('sequelize');
  const combinedWhere = {
    ...where,
    [Op.or]: [
      { id: { [Op.in]: projectIds } },
      { createdBy: userId },
    ],
  };

  return Project.findAndCountAll({
    where: combinedWhere,
    include: [
      { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });
};

const countByStatus = async (where = {}) => {
  const { fn, col } = require('sequelize');
  return Project.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  remove,
  findUserProjects,
  countByStatus,
};
