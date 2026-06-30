'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSocket } from './SocketProvider';
import { Crown, Pencil, Check } from 'lucide-react';
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
    <div className="absolute inset-0 p-4 overflow-y-auto">
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
                className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-white/5"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: `${user.color}40`, color: user.color, border: `2px solid ${user.color}` }}
                >
                  {user.username.charAt(0)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {isMe && isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="bg-zinc-900 border border-purple-500/50 rounded-lg px-2 py-1 text-sm text-white w-full focus:outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveName} className="text-green-400 hover:text-green-300">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-sm">
                        {user.username}
                      </span>
                      {isMe && (
                        <button 
                          onClick={() => {
                            setEditName(user.username);
                            setIsEditing(true);
                          }}
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                  
                  {isMe && !isEditing && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/10 rounded-full text-zinc-400">
                      You
                    </span>
                  )}
                </div>
                {isController && (
                  <div className="w-8 h-8 flex items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-full" title="Room Host">
                    <Crown className="w-4 h-4" />
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
