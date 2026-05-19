const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
};

exports.createBookmark = async (req, res, next) => {
  try {
    const { title, url, notes } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, error: 'Title and url are required' });
    }

    const bookmark = await Bookmark.create({ userId: req.user._id, title, url, notes: notes || '' });
    res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    next(err);
  }
};

exports.deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!bookmark) {
      return res.status(404).json({ success: false, error: 'Bookmark not found' });
    }

    res.json({ success: true, data: { message: 'Bookmark deleted' } });
  } catch (err) {
    next(err);
  }
};
