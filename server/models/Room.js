const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['dm', 'channel'], required: true },
  category: { type: String, enum: ['saved', 'hooked', 'trash'], default: 'saved' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

roomSchema.index({ ownerId: 1 });
roomSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Room', roomSchema);
