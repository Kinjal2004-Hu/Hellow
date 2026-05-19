const router = require('express').Router();
const microLearningController = require('../controllers/microLearningController');
const auth = require('../middleware/auth');

router.get('/today', auth, microLearningController.getToday);

module.exports = router;
