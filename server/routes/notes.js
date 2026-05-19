const router = require('express').Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.get('/', auth, noteController.getNotes);
router.post('/', auth, noteController.createNote);
router.patch('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;
