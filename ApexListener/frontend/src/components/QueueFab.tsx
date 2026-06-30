'use client';

import { useState } from 'react';
import { useSocket } from './SocketProvider';
import { useStore } from '@/store/useStore';
import { Plus, ListMusic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueueFab() {
  const { socket } = useSocket();
  const { permissions, controllerId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  
  const isController = socket?.id === controllerId;
  const canControl = isController || permissions === 'anyone';

  if (!canControl) return null;

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const addToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canControl) return;

    const id = extractVideoId(inputUrl);
    if (id) {
      socket?.emit('add_to_queue', {
        id: Math.random().toString(36).substr(2, 9),
        videoId: id,
        title: `YouTube Video (${id})`
      });
      setInputUrl('');
      setIsOpen(false);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden lg:hidden flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-72"
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
            <form onSubmit={addToQueue} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste URL..."
                className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm w-full"
              />
              <button
                type="submit"
                disabled={!inputUrl.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </form>
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
