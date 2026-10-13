const activityLogRepository = require('../repositories/activityLogRepository');

const log = async ({ action, entityType, entityId, userId, details = null }) => {
  return activityLogRepository.create({ action, entityType, entityId, userId, details });
};

const getEntityLogs = async (entityType, entityId, query) => {
  const { parsePagination, buildMeta } = require('../utils/pagination');
  const { page, limit, offset } = parsePagination(query);

  const { rows, count } = await activityLogRepository.findByEntity(entityType, entityId, { offset, limit });

  return {
    logs: rows,
    meta: buildMeta(page, limit, count),
  };
};

module.exports = { log, getEntityLogs };
