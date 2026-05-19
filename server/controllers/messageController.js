const Message = require('../models/Message');

exports.getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .populate('senderId', 'username');

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content, type } = req.body;

    if (!content && type !== 'image') {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const message = await Message.create({
      roomId,
      senderId: req.user._id,
      content: content || '',
      type: type || 'text'
    });

    const populated = await message.populate('senderId', 'username');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
