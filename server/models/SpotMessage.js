const mongoose = require('mongoose');

const spotMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  pinId: { type: mongoose.Schema.Types.ObjectId, ref: 'SpotPin', default: null },
  timestamp: { type: Date, default: Date.now }
});

spotMessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
spotMessageSchema.index({ receiverId: 1, timestamp: -1 });

module.exports = mongoose.model('SpotMessage', spotMessageSchema);
