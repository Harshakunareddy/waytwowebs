const { User } = require('../models');

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const findById = async (id) => {
  return User.findByPk(id, {
    attributes: { exclude: ['password', 'refreshToken'] },
  });
};

const findByIdWithPassword = async (id) => {
  return User.findByPk(id);
};

const create = async (data) => {
  return User.create(data);
};

const update = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update(data);
};

const findAll = async ({ offset, limit, where = {}, order = [['createdAt', 'DESC']] }) => {
  return User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'refreshToken'] },
    offset,
    limit,
    order,
  });
};

const updateRefreshToken = async (id, refreshToken) => {
  return User.update({ refreshToken }, { where: { id } });
};

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  update,
  findAll,
  updateRefreshToken,
};
