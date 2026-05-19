const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userData = user.toObject();
    delete userData.passwordHash;

    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, avatarUrl, preferences } = req.body;
    const update = {};

    if (username !== undefined) update.username = username;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (preferences !== undefined) update.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userData = user.toObject();
    delete userData.passwordHash;

    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarUrl } },
      { new: true }
    );

    const userData = user.toObject();
    delete userData.passwordHash;

    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};
