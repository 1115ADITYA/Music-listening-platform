'use client';

import { useEffect, useState, use } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Copy, Link, Users, MessageSquare, PlaySquare, ArrowLeft, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import Player from '@/components/Player';
import Chat from '@/components/Chat';
import Queue from '@/components/Queue';
import UserList from '@/components/UserList';
import UsernameModal from '@/components/UsernameModal';
import { MicToggle } from '@/components/MicToggle';
import { LogoIcon } from '@/components/LogoIcon';

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

  const tabs = [
    { id: 'chat'  as const, icon: MessageSquare, label: 'Chat' },
    { id: 'users' as const, icon: Users,         label: `${users.length} Users` },
    { id: 'queue' as const, icon: PlaySquare,    label: 'Queue' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* ── HEADER — mirrors the landing navbar (72px, glass, same gutter) ── */}
      <header className="room-header room-gutter z-30">
        {/* Left: back · logo · room code */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/')} className="icon-btn" aria-label="Go back">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <LogoIcon className="h-7 w-auto shrink-0" />
          <span
            className="hidden sm:block font-bold text-base tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            ApexListener
          </span>

          <span className="hidden sm:block h-5 w-px shrink-0" style={{ background: 'var(--border-card)' }} />

          <button onClick={copyRoomCode} className="room-code min-w-0" aria-label="Copy room code">
            <span className="truncate">{roomId}</span>
            <Copy className="w-3 h-3 shrink-0" />
          </button>
        </div>

        {/* Right: every control on the same 36px baseline */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="https://ko-fi.com/aditya69939"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-support-sm hidden lg:inline-flex"
          >
            <Coffee className="w-3.5 h-3.5" />
            Support me
          </a>

          {isController && (
            <div className="room-pill hidden md:inline-flex">
              <span>Anyone can play</span>
              <button
                onClick={togglePermissions}
                className={`perm-switch ${permissions === 'anyone' ? 'on' : ''}`}
                aria-label="Toggle permissions"
                aria-pressed={permissions === 'anyone'}
              >
                <span className="knob" />
              </button>
            </div>
          )}

          <div className="room-pill hidden sm:inline-flex">
            <span className={`status-dot ${isConnected ? '' : 'offline'}`} />
            {isConnected ? 'CONNECTED' : 'CONNECTING'}
          </div>

          <MicToggle />

          <button onClick={copyInviteLink} className="btn-primary-sm">
            <Link className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite Friends</span>
          </button>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: player */}
        <div className="flex-1 overflow-y-auto room-gutter py-5 lg:py-6">
          <Player />
        </div>

        {/* Right: sidebar */}
        <div className="room-sidebar w-full lg:w-[380px] flex flex-col shrink-0 lg:h-full h-[48vh]">
          <div className="room-tabs">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`room-tab ${activeTab === id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'chat'  && <Chat />}
            {activeTab === 'users' && <UserList />}
            {activeTab === 'queue' && <Queue />}
          </div>
        </div>

        {/* No floating queue button: the sidebar's Queue tab is reachable at
            every breakpoint, and the FAB sat on top of the chat composer. */}
      </main>

      <UsernameModal
        isOpen={showUsernameModal}
        onSave={(name) => {
          localStorage.setItem('syncplay_username', name);
          setShowUsernameModal(false);
          // If already connected, emit update_username to change the randomly assigned name
          if (socket && isConnected) {
            socket.emit('update_username', name);
          }
        }}
      />
    </div>
  );
}
