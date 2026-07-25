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
    <div className="fixed bottom-6 right-6 z-40 lg:hidden flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="modal-card mb-4 w-80"
            style={{ padding: 16 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <ListMusic className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} />
                Add to Queue
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SearchInput
              placeholder="Search or paste URL..."
              buttonLabel="Add"
              buttonIcon={<Plus className="w-4 h-4" />}
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
        className="fab"
        aria-label="Toggle queue"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ListMusic className="w-5 h-5" />}
      </button>
    </div>
  );
}
