const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  type: { type: String, enum: ['incoming', 'outgoing', 'missed'], required: true },
  duration: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

callLogSchema.index({ userId: 1, timestamp: -1 });
callLogSchema.index({ contactId: 1 });

module.exports = mongoose.model('CallLog', callLogSchema);
