const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/authValidator');
const { authenticate } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
