const router = require('express').Router();
const spotSyncController = require('../controllers/spotSyncController');
const auth = require('../middleware/auth');

router.get('/friends', auth, spotSyncController.getFriendsLocations);

module.exports = router;
