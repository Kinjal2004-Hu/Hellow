const mongoose = require('mongoose');

const spotPinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  label: { type: String, default: '' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

spotPinSchema.index({ userId: 1 });
spotPinSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('SpotPin', spotPinSchema);
