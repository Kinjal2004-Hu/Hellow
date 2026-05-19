module.exports = (io, socket) => {
  socket.on('yt:play', (data) => {
    const { roomId, currentTime } = data;
    socket.to(roomId).emit('yt:play', { userId: socket.userId, currentTime });
  });

  socket.on('yt:pause', (data) => {
    const { roomId, currentTime } = data;
    socket.to(roomId).emit('yt:pause', { userId: socket.userId, currentTime });
  });

  socket.on('yt:seek', (data) => {
    const { roomId, currentTime } = data;
    socket.to(roomId).emit('yt:seek', { userId: socket.userId, currentTime });
  });

  socket.on('yt:load_video', (data) => {
    const { roomId, videoId } = data;
    socket.to(roomId).emit('yt:load_video', { userId: socket.userId, videoId });
  });

  socket.on('yt:chat_message', (data) => {
    const { roomId, message } = data;
    const msgData = {
      userId: socket.userId,
      message,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit('yt:chat_message', msgData);
  });
};
