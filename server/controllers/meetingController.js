const Meeting = require('../models/Meeting');

const generateCode = () => Math.random().toString(16).substring(2, 10).toUpperCase();

exports.createMeeting = async (req, res, next) => {
  try {
    let code;
    let exists = true;

    while (exists) {
      code = generateCode();
      exists = await Meeting.findOne({ code });
    }

    const meeting = await Meeting.create({ code, hostId: req.user._id, name: req.body.name || '' });
    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
};

exports.getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.code }).populate('hostId', 'username');
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    res.json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
};

exports.getRecentMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ hostId: req.user._id }, { participants: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('hostId', 'username');

    res.json({ success: true, data: meetings });
  } catch (err) {
    next(err);
  }
};
