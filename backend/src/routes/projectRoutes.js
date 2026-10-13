const router = require('express').Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validators/projectValidator');

router.use(authenticate);

router.get('/', projectController.getAll);
router.post('/', authorize('admin', 'project_manager'), validate(createProjectSchema), projectController.create);
router.get('/:id', projectController.getById);
router.patch('/:id', authorize('admin', 'project_manager'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', authorize('admin'), projectController.remove);

router.get('/:id/members', projectController.getMembers);
router.post('/:id/members', authorize('admin', 'project_manager'), validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', authorize('admin', 'project_manager'), projectController.removeMember);

router.get('/:id/activities', projectController.getActivityLogs);

module.exports = router;
