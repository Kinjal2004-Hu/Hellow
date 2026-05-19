const router = require('express').Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, profileController.getProfile);
router.patch('/', auth, profileController.updateProfile);
router.patch('/password', auth, profileController.changePassword);
router.post('/avatar', auth, upload.single('file'), profileController.uploadAvatar);

module.exports = router;
