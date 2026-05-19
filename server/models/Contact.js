const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  notes: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

contactSchema.index({ userId: 1, isFavorite: -1 });
contactSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Contact', contactSchema);
