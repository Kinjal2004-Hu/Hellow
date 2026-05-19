const router = require('express').Router();
const driveController = require('../controllers/driveController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/files', auth, driveController.getFiles);
router.post('/files', auth, upload.single('file'), driveController.uploadFile);
router.delete('/files/:id', auth, driveController.deleteFile);
router.patch('/files/:id', auth, driveController.updateFile);
router.get('/folders', auth, driveController.getFolders);
router.post('/folders', auth, driveController.createFolder);
router.delete('/folders/:id', auth, driveController.deleteFolder);

module.exports = router;
