const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  googleId: { type: String, default: null },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true }
  },
  profileComplete: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);
