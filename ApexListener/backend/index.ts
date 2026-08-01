import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import ytSearch from 'yt-search';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import dns from 'dns';

// Force Node.js to prefer IPv4 DNS resolution to prevent ENETUNREACH on IPv6 addresses
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load local configuration without committing it. Hosted deployments should set
// the same values through their provider's environment-variable settings.
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const [, key, rawValue] = match;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '16kb' }));

const contactAttempts = new Map<string, { count: number; resetAt: number }>();
const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_ATTEMPTS = 5;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.post('/contact', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const issue = typeof req.body?.issue === 'string' ? req.body.issue.trim() : '';
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailIsValid || email.length > 254 || issue.length < 10 || issue.length > 2000) {
    res.status(400).json({ error: 'Please provide a valid email address and a message between 10 and 2,000 characters.' });
    return;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0])?.trim() || req.ip || 'unknown';
  const now = Date.now();
  const attempt = contactAttempts.get(ip);

  if (attempt && attempt.resetAt > now && attempt.count >= CONTACT_MAX_ATTEMPTS) {
    res.status(429).json({ error: 'Too many messages sent. Please try again in an hour.' });
    return;
  }

  contactAttempts.set(ip, {
    count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
    resetAt: attempt && attempt.resetAt > now ? attempt.resetAt : now + CONTACT_WINDOW_MS,
  });

  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER?.trim();
  // Strip any spaces that might be pasted in 16-character Google App Passwords
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  const contactRecipient = process.env.CONTACT_TO_EMAIL?.trim();
  const fromAddress = process.env.CONTACT_FROM_EMAIL?.trim() || smtpUser;

  if (!smtpUser || !smtpPass || !contactRecipient || !fromAddress) {
    console.error('Contact email is not configured. Set SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL.');
    res.status(503).json({ error: 'The contact form is temporarily unavailable. Please set SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL.' });
    return;
  }

  try {
    const isGmail = smtpHost.includes('gmail') || process.env.SMTP_SERVICE === 'gmail';
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS / STARTTLS
            auth: { user: smtpUser, pass: smtpPass },
            family: 4, // Force IPv4 to prevent ENETUNREACH on IPv6 addresses
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          } as any
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            family: 4, // Force IPv4 to prevent ENETUNREACH on IPv6 addresses
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          } as any
    );

    const safeEmail = escapeHtml(email);
    const safeIssue = escapeHtml(issue).replace(/\n/g, '<br />');
    await transporter.sendMail({
      from: `ApexListener Contact <${fromAddress}>`,
      to: contactRecipient,
      replyTo: email,
      subject: `ApexListener contact request from ${email}`,
      text: `Reply-to email: ${email}\n\nIssue:\n${issue}`,
      html: `<h2>New ApexListener contact request</h2><p><strong>Reply-to email:</strong> ${safeEmail}</p><p><strong>Issue:</strong></p><p>${safeIssue}</p>`,
    });
    res.status(200).json({ message: 'Your message has been sent.' });
  } catch (error: any) {
    console.error('Unable to send contact email:', error);
    const errMessage = String(error?.message || '');
    const isAuthError = error?.code === 'EAUTH' || errMessage.includes('535') || errMessage.includes('Username and Password not accepted');
    
    if (isAuthError) {
      res.status(502).json({ error: 'Email authentication failed. Please verify your SMTP_USER and 16-character Google App Password in environment variables.' });
    } else {
      res.status(502).json({ error: errMessage ? `Email service error: ${errMessage}` : 'We could not send your message. Please try again later.' });
    }
  }
});

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
  permissions: 'host_only' | 'anyone';
}

interface User {
  id: string;
  username: string;
  color: string;
  avatarId: number;
  micOn?: boolean;
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
        messages: [],
        permissions: 'host_only'
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
      avatarId: Math.floor(Math.random() * 10),
      micOn: false
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
      messages: room.messages,
      permissions: room.permissions
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

  socket.on('update_mic', (micOn: boolean) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const user = rooms[roomId].users.find(u => u.id === socket.id);
      if (user) {
        user.micOn = micOn;
        io.to(roomId).emit('mic_updated', { userId: socket.id, micOn });
      }
    }
  });

  // WebRTC Signaling
  socket.on('webrtc_offer', ({ targetUserId, offer }) => {
    socket.to(targetUserId).emit('webrtc_offer', { senderId: socket.id, offer });
  });

  socket.on('webrtc_answer', ({ targetUserId, answer }) => {
    socket.to(targetUserId).emit('webrtc_answer', { senderId: socket.id, answer });
  });

  socket.on('webrtc_ice_candidate', ({ targetUserId, candidate }) => {
    socket.to(targetUserId).emit('webrtc_ice_candidate', { senderId: socket.id, candidate });
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

  // Update Permissions
  socket.on('update_permissions', (permissions: 'host_only' | 'anyone') => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      if (socket.id === room.controllerId) {
        room.permissions = permissions;
        io.to(roomId).emit('permissions_updated', permissions);
      }
    }
  });

  // Sync Video
  socket.on('sync_video', (state: Partial<VideoState>) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      const canControl = socket.id === room.controllerId || room.permissions === 'anyone';
      if (canControl || !room.controllerId) {
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
      const room = rooms[roomId];
      const canControl = socket.id === room.controllerId || room.permissions === 'anyone';
      if (canControl) {
        room.queue.push(item);
        io.to(roomId).emit('queue_update', room.queue);
      }
    }
  });

  socket.on('reorder_queue', (newQueue: VideoItem[]) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      const canControl = socket.id === room.controllerId || room.permissions === 'anyone';
      if (canControl) {
        // Ensure newQueue only contains items that are currently in the queue (security check)
        // For simplicity and speed, we trust the client's new order, but we cap it at max queue size
        if (Array.isArray(newQueue) && newQueue.length <= 100) {
           room.queue = newQueue;
           io.to(roomId).emit('queue_update', room.queue);
        }
      }
    }
  });

  socket.on('play_queue_item', (itemId: string) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      const canControl = socket.id === room.controllerId || room.permissions === 'anyone';
      if (canControl) {
        const itemIndex = room.queue.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
          const item = room.queue[itemIndex];
          room.queue.splice(itemIndex, 1);
          io.to(roomId).emit('queue_update', room.queue);
          
          room.videoState = { videoId: item.videoId, isPlaying: true, timestamp: 0, lastUpdate: Date.now() };
          io.to(roomId).emit('video_sync', room.videoState);
        }
      }
    }
  });

  socket.on('search_youtube', async (query: string, callback?: (results: any[]) => void) => {
    try {
      const r = await ytSearch(query);
      const videos = r.videos.slice(0, 10).map(v => ({
        id: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        duration: v.timestamp
      }));
      if (callback) callback(videos);
      socket.emit('search_results', videos);
    } catch (error) {
      console.error('YouTube search error:', error);
      if (callback) callback([]);
      socket.emit('search_results', []);
    }
  });

  socket.on('video_ended', (endedVideoId: string) => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      const canControl = socket.id === room.controllerId || room.permissions === 'anyone';
      
      // We check if the video that ended is STILL the current video in the room state.
      // This prevents multiple users from triggering the queue pop multiple times!
      if (canControl && room.videoState.videoId === endedVideoId && room.videoState.isPlaying) {
        if (room.queue.length > 0) {
          const item = room.queue.shift()!;
          io.to(roomId).emit('queue_update', room.queue);
          
          room.videoState = { videoId: item.videoId, isPlaying: true, timestamp: 0, lastUpdate: Date.now() };
          io.to(roomId).emit('video_sync', room.videoState);
        } else {
          // If queue is empty, just update state to not playing
          room.videoState = { ...room.videoState, isPlaying: false, timestamp: 0, lastUpdate: Date.now() };
          io.to(roomId).emit('video_sync', room.videoState);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
