const Note = require('../models/Note');

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const note = await Note.create({ userId: req.user._id, title, content: content || '' });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, data: { message: 'Note deleted' } });
  } catch (err) {
    next(err);
  }
};
