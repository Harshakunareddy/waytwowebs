const taskCommentService = require('../services/taskCommentService');
const ApiResponse = require('../utils/apiResponse');

const addComment = async (req, res, next) => {
  try {
    const comment = await taskCommentService.addComment(
      parseInt(req.params.id, 10),
      req.user.id,
      req.body.content
    );
    return ApiResponse.created(res, comment, 'Comment added');
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const result = await taskCommentService.getComments(
      parseInt(req.params.id, 10),
      req.query,
      req.user
    );
    return ApiResponse.success(res, result.comments, 'Comments retrieved', 200, result.meta);
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getComments };
