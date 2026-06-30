'use client';

import { useEffect, useState, use } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, Link, Users, MessageSquare, PlaySquare, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Player from '@/components/Player';
import Chat from '@/components/Chat';
import Queue from '@/components/Queue';
import UserList from '@/components/UserList';
import UsernameModal from '@/components/UsernameModal';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;
  
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { setRoomId, users, controllerId, permissions } = useStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'users' | 'queue'>('chat');
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const isController = socket?.id === controllerId;

  useEffect(() => {
    if (!socket || !isConnected) return;
    
    setRoomId(roomId);
    
    // Retrieve saved username if it exists
    const savedUsername = localStorage.getItem('syncplay_username');
    if (!savedUsername) {
      setShowUsernameModal(true);
    }
    
    socket.emit('join_room', { roomId, username: savedUsername || undefined });

  }, [socket, isConnected, roomId, setRoomId]);

  const copyInviteLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room code copied!');
  };

  const togglePermissions = () => {
    if (!isController) return;
    const newPerms = permissions === 'host_only' ? 'anyone' : 'host_only';
    socket?.emit('update_permissions', newPerms);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="glass px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ApexListener Room</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>Code: {roomId}</span>
              <button onClick={copyRoomCode} className="hover:text-white"><Copy className="w-3 h-3" /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isController && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 rounded-xl border border-white/5 mr-2">
              <span className="text-xs font-medium text-zinc-300">Anyone can play:</span>
              <button
                onClick={togglePermissions}
                className={`w-10 h-5 rounded-full relative transition-colors ${permissions === 'anyone' ? 'bg-purple-500' : 'bg-zinc-700'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${permissions === 'anyone' ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-xs font-medium text-zinc-300">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          
          <button 
            onClick={copyInviteLink}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
          >
            <Link className="w-4 h-4" />
            Invite Friends
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Player Area */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
          <Player />
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-96 bg-zinc-900/50 border-l border-white/5 flex flex-col shrink-0 lg:h-full h-[50vh]">
          {/* Tabs */}
          <div className="flex p-2 gap-2 border-b border-white/5 shrink-0">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
            >
              <Users className="w-4 h-4" /> {users.length} Users
            </button>
            <button 
              onClick={() => setActiveTab('queue')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'queue' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
            >
              <PlaySquare className="w-4 h-4" /> Queue
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'users' && <UserList />}
            {activeTab === 'queue' && <Queue />}
          </div>
        </div>
      </main>

      <UsernameModal
        isOpen={showUsernameModal}
        onSave={(name) => {
          localStorage.setItem('syncplay_username', name);
          setShowUsernameModal(false);
          // If already connected, we can emit a rename event, or just rely on reconnect
          // Since we emit join_room on mount, if we don't have a name, we joined with undefined.
          // Let's re-emit join_room with the new name to update the backend.
          if (socket && isConnected) {
            socket.emit('join_room', { roomId, username: name });
          }
        }}
      />
    </div>
  );
}
