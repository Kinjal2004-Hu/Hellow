const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ roomId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model('Message', messageSchema);
