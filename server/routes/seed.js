const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const seedController = require('../controllers/seedController');

router.post('/seed', authMiddleware, seedController.seedData);

module.exports = router;
