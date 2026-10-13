const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildMeta = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

const parseSorting = (query, allowedFields = []) => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
  return { sortBy, sortOrder };
};

module.exports = { parsePagination, buildMeta, parseSorting };
