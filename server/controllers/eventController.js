const Event = require('../models/Event');

exports.getEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.startAt = { $gte: start, $lte: end };
    }

    const events = await Event.find(filter).sort({ startAt: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, startAt, endAt } = req.body;
    if (!title || !startAt || !endAt) {
      return res.status(400).json({ success: false, error: 'Title, startAt, and endAt are required' });
    }

    const event = await Event.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: { message: 'Event deleted' } });
  } catch (err) {
    next(err);
  }
};
