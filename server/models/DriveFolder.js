const mongoose = require('mongoose');

const driveFolderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriveFolder', default: null }
}, { timestamps: true });

driveFolderSchema.index({ userId: 1, parentId: 1 });
driveFolderSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('DriveFolder', driveFolderSchema);
