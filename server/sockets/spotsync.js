const SpotMessage = require('../models/SpotMessage');
const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('location:update', (data) => {
    const { latitude, longitude } = data;
    socket.join('spotsync');
    socket.to('spotsync').emit('location:update', {
      userId: socket.userId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('location:stop', () => {
    socket.leave('spotsync');
    socket.to('spotsync').emit('location:stop', {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('spot:message', async (data) => {
    try {
      const { content, receiverId } = data;
      const message = await SpotMessage.create({
        senderId: socket.userId,
        receiverId: receiverId || socket.userId,
        content,
      });
      const populated = await message.populate('senderId', 'username avatarUrl');
      io.to('spotsync').emit('spot:message', populated);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send spot message' });
    }
  });
};
