const router = require('express').Router();
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');

router.get('/', auth, newsController.getNews);
router.get('/headlines', auth, newsController.getHeadlines);

module.exports = router;
