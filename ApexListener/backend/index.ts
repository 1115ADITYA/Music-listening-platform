import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface Room {
  id: string;
  users: User[];
  controllerId: string | null;
  videoState: VideoState;
  queue: VideoItem[];
  messages: any[];
}

interface User {
  id: string;
  username: string;
  color: string;
  avatarId: number;
}

interface VideoState {
  videoId: string;
  isPlaying: boolean;
  timestamp: number;
  lastUpdate: number;
}

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
}

const rooms: Record<string, Room> = {};

// Helper to get random user details
const generateUsername = () => {
  const adjs = ['Blue', 'Silver', 'Golden', 'Crimson', 'Shadow', 'Neon'];
  const nouns = ['Tiger', 'Fox', 'Panda', 'Wolf', 'Dragon', 'Eagle'];
  return `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};
const generateColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        users: [],
        controllerId: null,
        videoState: {
          videoId: '',
          isPlaying: false,
          timestamp: 0,
          lastUpdate: Date.now()
        },
        queue: [],
        messages: []
      };
    }

    const room = rooms[roomId];
    
    // Assign controller if first user
    if (room.users.length === 0) {
      room.controllerId = socket.id;
    }

    const newUser: User = {
      id: socket.id,
      username: username || generateUsername(),
      color: generateColor(),
      avatarId: Math.floor(Math.random() * 10)
    };

    room.users.push(newUser);

    // Notify room of new user (except sender)
    socket.to(roomId).emit('user_joined', newUser);
    
    // Send current state to new user
    socket.emit('room_state', {
      users: room.users,
      controllerId: room.controllerId,
      videoState: room.videoState,
      queue: room.queue,
      messages: room.messages
    });
    
    socket.data.roomId = roomId;
  });

  socket.on('update_username', (newUsername: string) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const user = rooms[roomId].users.find(u => u.id === socket.id);
      if (user) {
        user.username = newUsername;
        io.to(roomId).emit('username_updated', { userId: socket.id, newUsername });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      room.users = room.users.filter(u => u.id !== socket.id);
      
      io.to(roomId).emit('user_left', socket.id);

      if (room.users.length === 0) {
        delete rooms[roomId];
      } else if (room.controllerId === socket.id) {
        room.controllerId = room.users[0].id;
        io.to(roomId).emit('new_controller', room.controllerId);
      }
    }
  });

  // Sync Video
  socket.on('sync_video', (state: Partial<VideoState>) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      if (socket.id === room.controllerId || !room.controllerId) {
        room.videoState = { ...room.videoState, ...state, lastUpdate: Date.now() };
        // Broadcast to everyone including sender
        io.to(roomId).emit('video_sync', room.videoState);
      }
    }
  });

  // Chat Message
  socket.on('chat_message', (text: string) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const user = rooms[roomId].users.find(u => u.id === socket.id);
      if (user) {
        const message = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          username: user.username,
          color: user.color,
          text,
          timestamp: Date.now()
        };
        rooms[roomId].messages.push(message);
        // keep only last 100 messages to avoid memory leak
        if (rooms[roomId].messages.length > 100) {
          rooms[roomId].messages.shift();
        }
        io.to(roomId).emit('chat_message', message);
      }
    }
  });

  // Queue Management
  socket.on('add_to_queue', (item: VideoItem) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].queue.push(item);
      io.to(roomId).emit('queue_update', rooms[roomId].queue);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
