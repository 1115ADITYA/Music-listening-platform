'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSocket } from './SocketProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface SearchInputProps {
  onSelect: (videoId: string, title: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
}

export default function SearchInput({ onSelect, placeholder = "Search or paste YouTube URL...", buttonLabel, buttonIcon }: SearchInputProps) {
  const { socket } = useSocket();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check if it's a direct URL
    const id = extractVideoId(query);
    if (id) {
      onSelect(id, 'YouTube Video');
      setQuery('');
      setIsOpen(false);
      return;
    }

    // Otherwise, perform search
    setIsSearching(true);
    setIsOpen(true);
    socket?.emit('search_youtube', query, (res: SearchResult[]) => {
      setResults(res || []);
      setIsSearching(false);
    });
  };

  return (
    <div className="relative flex-1 w-full" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-zinc-900/50 border border-white/10 rounded-xl md:rounded-2xl focus:outline-none focus:border-purple-500/50 shadow-2xl text-sm md:text-base text-white"
          />
        </div>
        {buttonLabel && (
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 md:px-6 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 text-white text-sm md:text-base font-semibold rounded-xl md:rounded-2xl transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {buttonIcon}
            <span className={buttonIcon ? "hidden sm:inline" : ""}>{buttonLabel}</span>
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {results.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  onSelect(video.id, video.title);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-black">
                  <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full opacity-80" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{video.title}</h4>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
