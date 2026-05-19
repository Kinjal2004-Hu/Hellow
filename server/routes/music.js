const router = require('express').Router();
const musicController = require('../controllers/musicController');
const auth = require('../middleware/auth');

router.post('/rooms', auth, musicController.createRoom);
router.get('/rooms/:code', auth, musicController.getRoom);
router.patch('/rooms/:code', auth, musicController.updateRoomState);

module.exports = router;
