const router = require('express').Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/:roomId', auth, messageController.getMessages);
router.post('/:roomId', auth, messageController.createMessage);

module.exports = router;
