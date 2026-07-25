'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';
import { useStore, ChatMessage } from '@/store/useStore';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const { socket } = useSocket();
  const { chatMessages: messages, addChatMessage } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (msg: ChatMessage) => {
      addChatMessage(msg);
    };

    socket.on('chat_message', handleMessage);

    return () => {
      socket.off('chat_message', handleMessage);
    };
  }, [socket, addChatMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('chat_message', input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.length === 0 && (
          <div className="panel-empty">
            <MessageSquare className="w-7 h-7 opacity-25" />
            <p>No messages yet — say hi</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex flex-col gap-1.5"
            >
              <div className="chat-meta">
                <span className="font-semibold" style={{ color: msg.color }}>
                  {msg.username}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="chat-bubble">{msg.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="panel-bar bottom">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="field"
            style={{ padding: '11px 46px 11px 14px' }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="field-submit"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
