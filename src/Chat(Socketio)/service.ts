/* eslint-disable */
import { Server } from 'socket.io';

const connectedUsers = new Map(); // Para rastrear usuarios conectados

const socketService = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Manejar conexión de un usuario
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      connectedUsers.set(socket.id, { room: roomName });
      console.log(`Usuario ${socket.id} se unió a la sala ${roomName}`);
      io.to(roomName).emit('room-joined', { room: roomName, userId: socket.id });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        const { room } = user;
        io.to(room).emit('user-disconnected', { userId: socket.id });
      }
      connectedUsers.delete(socket.id);
      console.log('Usuario desconectado:', socket.id);
    });

    // Enviar mensaje
    socket.on('sendMessage', async (data) => {
      if (data && typeof data.text === 'string' && typeof data.username === 'string') {
        data.timestamp = data.timestamp || new Date().toISOString();
        console.log('Emitiendo mensaje:', data); // Verifica los datos emitidos
        const user = connectedUsers.get(socket.id);
        const room = user?.room || "general";
        io.to(room).emit('message-receive', data);
      } else {
        console.error('Mensaje inválido:', data);
      }
    });
  });
};

export default socketService;
