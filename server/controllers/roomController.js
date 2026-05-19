const Room = require('../models/Room');

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ ownerId: req.user._id }, { members: req.user._id }]
    }).sort({ updatedAt: -1 });

    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { name, type, category } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Name and type are required' });
    }

    const room = await Room.create({ name, type, category, ownerId: req.user._id });
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found or not owned by you' });
    }

    const { name, type, category, members } = req.body;
    if (name !== undefined) room.name = name;
    if (type !== undefined) room.type = type;
    if (category !== undefined) room.category = category;
    if (members !== undefined) room.members = members;
    await room.save();

    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found or not owned by you' });
    }

    res.json({ success: true, data: { message: 'Room deleted' } });
  } catch (err) {
    next(err);
  }
};
