'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onSave: (username: string) => void;
}

export default function UsernameModal({ isOpen, onSave }: UsernameModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative flex flex-col items-center text-center gap-2 mb-8">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">What's your name?</h2>
              <p className="text-zinc-400 text-sm">Enter a nickname so your friends know who you are!</p>
            </div>

            <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your nickname..."
                className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-600 text-lg text-center"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-purple-600 shadow-lg shadow-purple-500/20"
              >
                Join Room
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
