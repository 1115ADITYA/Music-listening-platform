import { create } from 'zustand';

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

interface AppState {
  roomId: string | null;
  users: User[];
  controllerId: string | null;
  videoState: VideoState;
  queue: VideoItem[];
  setRoomId: (id: string | null) => void;
  setUsers: (users: User[]) => void;
  updateUserUsername: (userId: string, newUsername: string) => void;
  setControllerId: (id: string | null) => void;
  setVideoState: (state: VideoState) => void;
  setQueue: (queue: VideoItem[]) => void;
}

export const useStore = create<AppState>((set) => ({
  roomId: null,
  users: [],
  controllerId: null,
  videoState: {
    videoId: '',
    isPlaying: false,
    timestamp: 0,
    lastUpdate: 0
  },
  queue: [],
  setRoomId: (roomId) => set({ roomId }),
  setUsers: (users) => set({ users }),
  updateUserUsername: (userId, newUsername) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, username: newUsername } : u)
  })),
  setControllerId: (controllerId) => set({ controllerId }),
  setVideoState: (videoState) => set({ videoState }),
  setQueue: (queue) => set({ queue }),
}));
