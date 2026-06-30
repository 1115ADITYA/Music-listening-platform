'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Users, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert([{ code }])
        .select()
        .single();

      if (error) throw error;
      
      router.push(`/room/${code}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    router.push(`/room/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ApexListener</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Watch YouTube <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Together.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience perfectly synchronized playback with friends. No login required. 
            Just create a room, share the link, and start watching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Create Room
            </button>
            
            <form onSubmit={handleJoinRoom} className="w-full sm:w-auto relative group">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono uppercase text-center sm:text-left"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={!joinCode.trim() || isJoining}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full"
          id="features"
        >
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Sync</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sub-second synchronization ensures everyone watches exactly the same frame at the same time.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Sign Up</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Jump straight into the action. Anonymous, instantly generated profiles for everyone.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4 text-pink-400">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shared Queue</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Collaboratively build a playlist. Anyone can add, reorder, or skip videos in real-time.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 text-center text-zinc-500 text-sm glass mt-auto border-t-0">
        <p>Built with Next.js, Socket.IO, and Supabase.</p>
      </footer>
    </div>
  );
}
