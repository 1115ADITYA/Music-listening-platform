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
            className="modal-card"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: 'rgba(255,77,45,0.1)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ background: 'rgba(45,212,191,0.08)' }} />

            <div className="relative flex flex-col items-center text-center gap-2 mb-7">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(255,77,45,0.12)', border: '1px solid rgba(255,77,45,0.25)' }}
              >
                <User className="w-7 h-7" style={{ color: 'var(--accent-orange)' }} />
              </div>
              <p className="eyebrow" style={{ marginBottom: 0 }}>One Last Thing</p>
              <h2 className="heading-font text-3xl" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
                What&apos;s your name?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Pick a nickname so your friends know who you are.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your nickname…"
                className="field text-center"
                style={{ padding: '13px 16px', fontSize: '0.95rem' }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-primary w-full justify-center"
              >
                Join Room
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
