const mongoose = require('mongoose');

const musicRoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  queue: [{ type: mongoose.Schema.Types.Mixed }],
  currentTrack: { type: mongoose.Schema.Types.Mixed, default: null },
  isPlaying: { type: Boolean, default: false },
  position: { type: Number, default: 0 },
  powerToAll: { type: Boolean, default: true }
}, { timestamps: true });

musicRoomSchema.index({ code: 1 });
musicRoomSchema.index({ hostId: 1 });

module.exports = mongoose.model('MusicRoom', musicRoomSchema);
