const logger = require('../config/logger');

class ChatService {
  constructor(io) {
    this.io = io;
    this.typingUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        logger.info(`User ${socket.id} joined room: ${roomId}`);
      });

      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        logger.info(`User ${socket.id} left room: ${roomId}`);
      });

      socket.on('typing_start', ({ roomId, userId, username }) => {
        this.typingUsers.set(socket.id, { userId, username });
        socket.to(roomId).emit('user_typing', { userId, username });
      });

      socket.on('typing_stop', ({ roomId }) => {
        this.typingUsers.delete(socket.id);
        socket.to(roomId).emit('user_stop_typing', { userId: socket.id });
      });

      socket.on('send_message', async ({ roomId, message, userId, username }) => {
        const messageData = {
          id: Date.now().toString(),
          content: message,
          userId,
          username,
          timestamp: new Date(),
          status: 'sent'
        };

        // Broadcast to all users in the room
        this.io.to(roomId).emit('new_message', messageData);
        logger.info(`Message sent in room ${roomId} by ${username}`);
      });

      socket.on('message_delivered', ({ roomId, messageId }) => {
        this.io.to(roomId).emit('message_status_update', {
          messageId,
          status: 'delivered'
        });
      });

      socket.on('message_seen', ({ roomId, messageId }) => {
        this.io.to(roomId).emit('message_status_update', {
          messageId,
          status: 'seen'
        });
      });

      socket.on('disconnect', () => {
        const userData = this.typingUsers.get(socket.id);
        if (userData) {
          this.typingUsers.delete(socket.id);
          // Notify all rooms the user was in about typing stop
          socket.rooms.forEach(roomId => {
            if (roomId !== socket.id) {
              socket.to(roomId).emit('user_stop_typing', { userId: socket.id });
            }
          });
        }
        logger.info(`User disconnected: ${socket.id}`);
      });
    });
  }
}

module.exports = ChatService; 