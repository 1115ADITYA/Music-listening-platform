'use client';

import { useState } from 'react';
import { useSocket } from './SocketProvider';
import { useStore } from '@/store/useStore';
import { Plus, ListMusic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInput from './SearchInput';

export default function QueueFab() {
  const { socket } = useSocket();
  const { permissions, controllerId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const isController = socket?.id === controllerId;
  const canControl = isController || permissions === 'anyone';

  if (!canControl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden lg:hidden flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-80"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-purple-400" />
                Add to Queue
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <SearchInput
              placeholder="Search or paste URL..."
              buttonLabel="Add"
              buttonIcon={<Plus className="w-4 h-4 text-white" />}
              onSelect={(videoId, title) => {
                socket?.emit('add_to_queue', {
                  id: Math.random().toString(36).substr(2, 9),
                  videoId: videoId,
                  title: title || `YouTube Video (${videoId})`
                });
                setIsOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <ListMusic className="w-6 h-6" />}
      </button>
    </div>
  );
}
