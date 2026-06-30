'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setUsers, setControllerId, setVideoState, setQueue, setPermissions } = useStore();

  useEffect(() => {
    // In production, use the actual backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const socketInstance = io(backendUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from server');
    });

    socketInstance.on('room_state', (state) => {
      setUsers(state.users);
      setControllerId(state.controllerId);
      setVideoState(state.videoState);
      setQueue(state.queue);
      if (state.messages) {
        useStore.getState().setChatMessages(state.messages);
      }
      if (state.permissions) {
        setPermissions(state.permissions);
      }
    });

    socketInstance.on('permissions_updated', (permissions) => {
      setPermissions(permissions);
      toast.success(permissions === 'anyone' ? 'Everyone can now control the video!' : 'Only the host can control the video.');
    });

    socketInstance.on('user_joined', (user) => {
      setUsers(useStore.getState().users.concat(user));
      toast(`${user.username} joined`, { icon: '👋' });
    });

    socketInstance.on('user_left', (userId) => {
      const users = useStore.getState().users;
      const user = users.find(u => u.id === userId);
      if (user) {
        toast(`${user.username} left`, { icon: '🚪' });
      }
      setUsers(users.filter(u => u.id !== userId));
    });

    socketInstance.on('new_controller', (controllerId) => {
      setControllerId(controllerId);
      const user = useStore.getState().users.find(u => u.id === controllerId);
      if (user) {
        toast(`👑 ${user.username} is now the host`);
      }
    });

    socketInstance.on('username_updated', ({ userId, newUsername }) => {
      useStore.getState().updateUserUsername(userId, newUsername);
    });

    socketInstance.on('video_sync', (state) => {
      setVideoState(state);
    });

    socketInstance.on('queue_update', (queue) => {
      setQueue(queue);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [setUsers, setControllerId, setVideoState, setQueue, setPermissions]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
