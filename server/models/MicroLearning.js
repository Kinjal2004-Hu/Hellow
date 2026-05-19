const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  body: { type: String, default: '' }
}, { _id: false });

const microLearningSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true, trim: true },
  author: { type: String, default: '' },
  category: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  readTime: { type: String, default: '' },
  ideas: [ideaSchema],
  date: { type: Date, default: Date.now }
});

microLearningSchema.index({ category: 1 });
microLearningSchema.index({ date: -1 });

module.exports = mongoose.model('MicroLearning', microLearningSchema);
