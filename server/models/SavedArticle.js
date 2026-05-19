const mongoose = require('mongoose');

const savedArticleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleUrl: { type: String, required: true },
  title: { type: String, default: '' },
  source: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
});

savedArticleSchema.index({ userId: 1, savedAt: -1 });
savedArticleSchema.index({ articleUrl: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SavedArticle', savedArticleSchema);
