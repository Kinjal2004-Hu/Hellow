const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  color: { type: String, default: '#1A1A1A' }
}, { timestamps: true });

eventSchema.index({ userId: 1, startAt: 1 });

module.exports = mongoose.model('Event', eventSchema);
