module.exports = (io, socket) => {
  socket.on('room:join', (data) => {
    const { musicCode } = data;
    socket.join(musicCode);
    const room = io.sockets.adapter.rooms.get(musicCode);
    const count = room ? room.size : 0;
    io.to(musicCode).emit('room:listeners', { count, listeners: Array.from(room || []) });
  });

  socket.on('room:play', (data) => {
    const { musicCode, timestamp } = data;
    socket.to(musicCode).emit('room:play', { userId: socket.userId, timestamp, socketId: socket.id });
  });

  socket.on('room:pause', (data) => {
    const { musicCode, timestamp } = data;
    socket.to(musicCode).emit('room:pause', { userId: socket.userId, timestamp, socketId: socket.id });
  });

  socket.on('room:seek', (data) => {
    const { musicCode, position } = data;
    socket.to(musicCode).emit('room:seek', { userId: socket.userId, position, socketId: socket.id });
  });

  socket.on('room:next', (data) => {
    const { musicCode } = data;
    socket.to(musicCode).emit('room:next', { userId: socket.userId, socketId: socket.id });
  });

  socket.on('room:prev', (data) => {
    const { musicCode } = data;
    socket.to(musicCode).emit('room:prev', { userId: socket.userId, socketId: socket.id });
  });

  socket.on('room:volume', (data) => {
    const { musicCode, volume } = data;
    socket.to(musicCode).emit('room:volume', { userId: socket.userId, volume, socketId: socket.id });
  });

  socket.on('room:power_toggle', (data) => {
    const { musicCode } = data;
    socket.to(musicCode).emit('room:power_toggle', { userId: socket.userId, socketId: socket.id });
  });
};
