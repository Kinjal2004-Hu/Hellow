const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, default: '' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  endedAt: { type: Date, default: null }
}, { timestamps: true });

meetingSchema.index({ code: 1 });
meetingSchema.index({ hostId: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
