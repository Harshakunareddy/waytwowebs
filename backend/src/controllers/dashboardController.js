const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary(req.user);
    return ApiResponse.success(res, summary, 'Dashboard summary retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
