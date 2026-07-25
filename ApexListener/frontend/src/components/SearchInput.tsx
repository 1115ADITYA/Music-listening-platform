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
      <form onSubmit={handleSearch} className="flex gap-2 w-full items-stretch">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-orange)' }} />
            ) : (
              <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
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
            className="field"
            style={{ height: 42, paddingLeft: 40, paddingRight: 14 }}
          />
        </div>
        {buttonLabel && (
          <button
            type="submit"
            disabled={!query.trim()}
            className="btn-primary-sm shrink-0"
            style={{ height: 42 }}
          >
            {buttonIcon}
            {buttonLabel}
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="search-dropdown absolute top-full left-0 right-0 mt-2 z-50 max-h-[360px] overflow-y-auto"
          >
            {results.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  onSelect(video.id, video.title);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="search-result"
              >
                <div className="relative w-20 h-[46px] rounded-md overflow-hidden shrink-0 bg-black">
                  <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full opacity-85" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {video.title}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
