const router = require('express').Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/', auth, eventController.getEvents);
router.post('/', auth, eventController.createEvent);
router.patch('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
