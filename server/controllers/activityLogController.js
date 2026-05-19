const ActivityLog = require('../models/ActivityLog');

exports.getActivityLog = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
