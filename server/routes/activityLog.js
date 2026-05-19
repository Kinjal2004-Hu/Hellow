const router = require('express').Router();
const activityLogController = require('../controllers/activityLogController');
const auth = require('../middleware/auth');

router.get('/', auth, activityLogController.getActivityLog);

module.exports = router;
