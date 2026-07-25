'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSocket } from './SocketProvider';
import { Crown, Pencil, Check, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserList() {
  const { users, controllerId } = useStore();
  const { socket } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const handleSaveName = () => {
    if (editName.trim() && socket) {
      socket.emit('update_username', editName.trim());
      localStorage.setItem('syncplay_username', editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="absolute inset-0 p-3.5 overflow-y-auto">
      <div className="space-y-2">
        <AnimatePresence>
          {users.map((user) => {
            const isMe = socket?.id === user.id;
            const isController = user.id === controllerId;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="room-row"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0 uppercase"
                  style={{ backgroundColor: `${user.color}33`, color: user.color, border: `2px solid ${user.color}` }}
                >
                  {user.username.charAt(0)}
                </div>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {isMe && isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="field"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="shrink-0"
                        style={{ color: 'var(--accent-teal)' }}
                        aria-label="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-[0.82rem] truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.username}
                      </span>
                      {isMe && (
                        <button
                          onClick={() => {
                            setEditName(user.username);
                            setIsEditing(true);
                          }}
                          className="shrink-0 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label="Edit name"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}

                  {isMe && !isEditing && <span className="tag shrink-0">You</span>}

                  {user.micOn ? (
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full ml-auto shrink-0"
                      style={{ background: 'rgba(45,212,191,0.14)', color: 'var(--accent-teal)' }}
                      title="Mic On"
                    >
                      <Mic className="w-3 h-3" />
                    </div>
                  ) : (
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full ml-auto shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      title="Mic Off"
                    >
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {isController && (
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-full shrink-0"
                    style={{ background: 'rgba(240,180,41,0.14)', color: 'var(--accent-gold)' }}
                    title="Room Host"
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
