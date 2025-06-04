import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'seen';
}

interface TypingUser {
  userId: string;
  username: string;
}

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.VITE_API_URL || 'http://localhost:3000');

    // Join room
    socketRef.current.emit('join_room', roomId);

    // Set up event listeners
    socketRef.current.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Emit message delivered event
      socketRef.current?.emit('message_delivered', { roomId, messageId: message.id });
    });

    socketRef.current.on('user_typing', (typingUser: TypingUser) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === typingUser.userId)) {
          return [...prev, typingUser];
        }
        return prev;
      });
    });

    socketRef.current.on('user_stop_typing', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socketRef.current.on('message_status_update', ({ messageId, status }: { messageId: string; status: Message['status'] }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    });

    return () => {
      socketRef.current?.emit('leave_room', roomId);
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !user) return;

    socketRef.current.emit('send_message', {
      roomId,
      message: content,
      userId: user.id,
      username: user.username
    });
  }, [roomId, user]);

  const handleTyping = useCallback(() => {
    if (!socketRef.current || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socketRef.current.emit('typing_start', {
      roomId,
      userId: user.id,
      username: user.username
    });

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { roomId });
    }, 2000);
  }, [roomId, user]);

  const markMessageAsSeen = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('message_seen', { roomId, messageId });
  }, [roomId]);

  return {
    messages,
    typingUsers,
    sendMessage,
    handleTyping,
    markMessageAsSeen
  };
}; 