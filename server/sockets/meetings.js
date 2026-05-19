module.exports = (io, socket) => {
  socket.on('meeting:join', (data) => {
    const { meetingCode, userName } = data;
    socket.join(meetingCode);
    socket.to(meetingCode).emit('meeting:user-joined', {
      userId: socket.userId,
      userName,
      socketId: socket.id,
    });
  });

  socket.on('meeting:answer', (data) => {
    const { meetingCode, answer, targetSocketId } = data;
    io.to(targetSocketId).emit('meeting:answer', {
      answer,
      userId: socket.userId,
      socketId: socket.id,
    });
  });

  socket.on('meeting:ice', (data) => {
    const { meetingCode, candidate, targetSocketId } = data;
    io.to(targetSocketId).emit('meeting:ice', {
      candidate,
      userId: socket.userId,
      socketId: socket.id,
    });
  });

  socket.on('meeting:leave', async (data) => {
    const { meetingCode } = data;
    socket.to(meetingCode).emit('meeting:user-left', {
      userId: socket.userId,
      socketId: socket.id,
    });
    socket.leave(meetingCode);
  });
};
