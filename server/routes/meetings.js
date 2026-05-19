const router = require('express').Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth');

router.post('/', auth, meetingController.createMeeting);
router.get('/recent', auth, meetingController.getRecentMeetings);
router.get('/:code', auth, meetingController.getMeeting);

module.exports = router;
