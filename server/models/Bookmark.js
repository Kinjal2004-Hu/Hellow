const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
