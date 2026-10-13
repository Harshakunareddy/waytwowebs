const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validate');
const { updateUserSchema } = require('../validators/userValidator');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.patch('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
