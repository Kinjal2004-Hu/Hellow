const MusicRoom = require('../models/MusicRoom');

const generateCode = () => Math.random().toString(16).substring(2, 8).toUpperCase();

exports.createRoom = async (req, res, next) => {
  try {
    let code;
    let exists = true;

    while (exists) {
      code = generateCode();
      exists = await MusicRoom.findOne({ code });
    }

    const room = await MusicRoom.create({ code, hostId: req.user._id });
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await MusicRoom.findOne({ code: req.params.code }).populate('hostId', 'username');
    if (!room) {
      return res.status(404).json({ success: false, error: 'Music room not found' });
    }

    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.updateRoomState = async (req, res, next) => {
  try {
    const room = await MusicRoom.findOne({ code: req.params.code, hostId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Music room not found or not the host' });
    }

    const { isPlaying, currentTrack, position, queue, powerToAll } = req.body;
    if (isPlaying !== undefined) room.isPlaying = isPlaying;
    if (currentTrack !== undefined) room.currentTrack = currentTrack;
    if (position !== undefined) room.position = position;
    if (queue !== undefined) room.queue = queue;
    if (powerToAll !== undefined) room.powerToAll = powerToAll;
    await room.save();

    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};
