const router = require('express').Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.get('/', auth, roomController.getRooms);
router.post('/', auth, roomController.createRoom);
router.patch('/:id', auth, roomController.updateRoom);
router.delete('/:id', auth, roomController.deleteRoom);

module.exports = router;
