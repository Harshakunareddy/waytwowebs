const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);

module.exports = router;
