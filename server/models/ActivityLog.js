const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: String, required: true },
  event: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
