const router = require('express').Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/generate-note', auth, aiController.generateNote);
router.post('/summarize', auth, aiController.summarize);

module.exports = router;
