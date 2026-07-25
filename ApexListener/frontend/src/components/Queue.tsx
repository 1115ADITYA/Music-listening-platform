'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { useStore } from '@/store/useStore';
import { Play, Plus, Clock, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import SearchInput from './SearchInput';

export default function Queue() {
  const { socket } = useSocket();
  const { queue, permissions, controllerId } = useStore();
  
  const isController = socket?.id === controllerId;
  const canControl = isController || permissions === 'anyone';

  const [localQueue, setLocalQueue] = useState(queue);

  useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

  const playNow = (itemId: string) => {
    if (!canControl) return;
    socket?.emit('play_queue_item', itemId);
  };

  const handleReorder = (newQueue: typeof queue) => {
    setLocalQueue(newQueue);
    if (canControl) {
      socket?.emit('reorder_queue', newQueue);
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {canControl && (
        <div className="panel-bar top flex">
          <SearchInput
            placeholder="Search or paste URL to queue..."
            buttonLabel="Add"
            buttonIcon={<Plus className="w-4 h-4" />}
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

      {localQueue.length === 0 ? (
        <div className="panel-empty">
          <Clock className="w-7 h-7 opacity-25" />
          <p>Queue is empty</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={localQueue}
          onReorder={handleReorder}
          className="flex-1 overflow-y-auto p-3.5 space-y-2"
        >
          {localQueue.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="room-row group relative"
            >
              {canControl ? (
                <div
                  className="cursor-grab active:cursor-grabbing shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              ) : (
                <span
                  className="text-[0.7rem] font-semibold shrink-0 w-4 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {index + 1}
                </span>
              )}

              <div className="w-14 h-9 bg-black rounded-md overflow-hidden shrink-0 relative pointer-events-none">
                <img
                  src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                  alt="thumbnail"
                  className="w-full h-full object-cover opacity-85"
                />
              </div>
              <div className="flex-1 min-w-0 pointer-events-none">
                <p className="text-[0.82rem] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </p>
                <p className="text-[0.65rem] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.videoId}
                </p>
              </div>
              {canControl && (
                <button
                  onClick={() => playNow(item.id)}
                  className="row-action opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Play now"
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
