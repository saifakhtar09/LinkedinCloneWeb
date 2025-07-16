import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socket = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      socket.current = io(SOCKET_URL, {
        transports: ['websocket'],
        upgrade: true,
      });

      // Join user room
      socket.current.emit('join', user.id);

      // Connection event handlers
      socket.current.on('connect', () => {
        console.log('Connected to server');
      });

      socket.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socket.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Connection error. Please check your internet connection.');
      });

      // Message event handlers
      socket.current.on('receive-message', (message) => {
        // Handle incoming message
        console.log('Received message:', message);
        // You can dispatch to Redux store or handle locally
      });

      socket.current.on('user-online', (userId) => {
        console.log(`User ${userId} is online`);
      });

      socket.current.on('user-offline', (userId) => {
        console.log(`User ${userId} is offline`);
      });

      socket.current.on('user-typing', ({ userId }) => {
        console.log(`User ${userId} is typing`);
      });

      socket.current.on('user-stopped-typing', ({ userId }) => {
        console.log(`User ${userId} stopped typing`);
      });

      // Notification handlers
      socket.current.on('notification', (notification) => {
        toast.success(notification.message);
      });

      // Call handlers
      socket.current.on('call-incoming', ({ signal, from, name }) => {
        // Handle incoming call
        console.log('Incoming call from:', name);
      });

      socket.current.on('call-accepted', (signal) => {
        console.log('Call accepted');
      });

      socket.current.on('call-ended', () => {
        console.log('Call ended');
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [isAuthenticated, user]);

  // Socket utility functions
  const sendMessage = (receiverId, content, type = 'text') => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('send-message', {
        senderId: user.id,
        receiverId,
        content,
        type,
      });
    }
  };

  const startTyping = (receiverId) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('typing-start', {
        senderId: user.id,
        receiverId,
      });
    }
  };

  const stopTyping = (receiverId) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('typing-stop', {
        senderId: user.id,
        receiverId,
      });
    }
  };

  const joinNotifications = () => {
    if (socket.current && socket.current.connected && user) {
      socket.current.emit('join-notifications', user.id);
    }
  };

  const callUser = (userToCall, signalData, name) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('call-user', {
        userToCall,
        signalData,
        from: user.id,
        name: `${user.firstName} ${user.lastName}`,
      });
    }
  };

  const answerCall = (to, signal) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('answer-call', { to, signal });
    }
  };

  const endCall = (to) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('end-call', { to });
    }
  };

  return {
    socket: socket.current,
    sendMessage,
    startTyping,
    stopTyping,
    joinNotifications,
    callUser,
    answerCall,
    endCall,
  };
};