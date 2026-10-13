const { ProjectMember, User } = require('../models');

const addMember = async (projectId, userId) => {
  return ProjectMember.create({ projectId, userId });
};

const removeMember = async (projectId, userId) => {
  return ProjectMember.destroy({ where: { projectId, userId } });
};

const findMember = async (projectId, userId) => {
  return ProjectMember.findOne({ where: { projectId, userId } });
};

const findProjectMembers = async (projectId) => {
  return ProjectMember.findAll({
    where: { projectId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
    ],
  });
};

const isProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  return !!member;
};

module.exports = {
  addMember,
  removeMember,
  findMember,
  findProjectMembers,
  isProjectMember,
};
