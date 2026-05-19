const Message = require('../models/Message');

module.exports = (io, socket) => {
  socket.on('room:join', (roomId) => {
    socket.join(roomId);
  });

  socket.on('message:send', async (data) => {
    try {
      const { roomId, content, type = 'text' } = data;
      const message = await Message.create({
        roomId,
        senderId: socket.userId,
        content,
        type,
      });
      const populated = await message.populate('senderId', 'username avatarUrl');
      io.to(roomId).emit('message:receive', populated);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing:start', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('typing:start', { userId: socket.userId, roomId });
  });

  socket.on('typing:stop', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('typing:stop', { userId: socket.userId, roomId });
  });
};
