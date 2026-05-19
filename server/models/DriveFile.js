const mongoose = require('mongoose');

const driveFileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  mimeType: { type: String, default: '' },
  size: { type: Number, default: 0 },
  url: { type: String, default: '' },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriveFolder', default: null },
  isStarred: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  source: { type: String, enum: ['user', 'app'], default: 'user' }
}, { timestamps: true });

driveFileSchema.index({ userId: 1, folderId: 1 });
driveFileSchema.index({ userId: 1, isTrashed: 1 });
driveFileSchema.index({ userId: 1, isStarred: 1 });

module.exports = mongoose.model('DriveFile', driveFileSchema);
