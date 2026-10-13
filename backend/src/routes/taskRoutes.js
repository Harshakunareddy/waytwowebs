const router = require('express').Router();
const taskController = require('../controllers/taskController');
const taskCommentController = require('../controllers/taskCommentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema, commentSchema } = require('../validators/taskValidator');

router.use(authenticate);

router.get('/', taskController.getAll);
router.post('/', authorize('admin', 'project_manager'), validate(createTaskSchema), taskController.create);
router.get('/:id', taskController.getById);
router.patch('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', authorize('admin', 'project_manager'), taskController.remove);

router.get('/:id/comments', taskCommentController.getComments);
router.post('/:id/comments', validate(commentSchema), taskCommentController.addComment);

router.get('/:id/activities', taskController.getActivityLogs);

module.exports = router;
