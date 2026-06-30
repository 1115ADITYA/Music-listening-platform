'use client';

import { useState } from 'react';
import { useSocket } from './SocketProvider';
import { useStore } from '@/store/useStore';
import { Play, Plus, Clock } from 'lucide-react';
import SearchInput from './SearchInput';

export default function Queue() {
  const { socket } = useSocket();
  const { queue, permissions, controllerId } = useStore();
  
  const isController = socket?.id === controllerId;
  const canControl = isController || permissions === 'anyone';

  const playNow = (itemId: string) => {
    if (!canControl) return;
    socket?.emit('play_queue_item', itemId);
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {canControl && (
        <div className="p-4 border-b border-white/5 bg-zinc-900/50 shrink-0 flex">
          <SearchInput
            placeholder="Search or paste URL to queue..."
            buttonLabel="Add"
            buttonIcon={<Plus className="w-4 h-4 text-white" />}
            onSelect={(videoId, title) => {
              socket?.emit('add_to_queue', {
                id: Math.random().toString(36).substr(2, 9),
                videoId: videoId,
                title: title || `YouTube Video (${videoId})`
              });
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <Clock className="w-8 h-8 opacity-20" />
            <p className="text-sm">Queue is empty</p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-10 bg-black rounded overflow-hidden shrink-0 relative">
                <img
                  src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                  alt="thumbnail"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{item.title}</p>
                <p className="text-xs text-zinc-500 truncate">{item.videoId}</p>
              </div>
              {canControl && (
                <button
                  onClick={() => playNow(item.id)}
                  className="w-8 h-8 rounded-full bg-purple-600/20 hover:bg-purple-500 text-purple-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
