'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { useSocket } from './SocketProvider';
import { useStore } from '@/store/useStore';
import { PlaySquare, Loader2 } from 'lucide-react';
import SearchInput from './SearchInput';

export default function Player() {
  const { socket } = useSocket();
  const { videoState, controllerId, permissions } = useStore();
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  const isController = socket?.id === controllerId;
  const canControl = isController || permissions === 'anyone';

  // Sync logic
  useEffect(() => {
    if (videoState.videoId) {
      setIsLoadingVideo(true);
    }
  }, [videoState.videoId]);

  useEffect(() => {
    if (!playerRef.current) return;
    const player = playerRef.current;
    
    // We calculate the actual server time by adding elapsed time since last update if playing
    let currentServerTime = videoState.timestamp;
    if (videoState.isPlaying) {
      currentServerTime += (Date.now() - videoState.lastUpdate) / 1000;
    }
    
    if (videoState.videoId && player.getVideoData().video_id !== videoState.videoId) {
      // ID changed handled by component prop, but seek needs handling
    }

    if (videoState.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
    
    const currentTime = player.getCurrentTime();
    if (Math.abs(currentTime - currentServerTime) > 1.0) { // Increased threshold slightly to avoid jitter
      player.seekTo(currentServerTime, true);
    }
  }, [videoState]);

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    // Just in case it's already cued/paused
    const state = event.target.getPlayerState();
    if ([1, 2, 5].includes(state)) {
      setIsLoadingVideo(false);
    }

    // Force initial sync when player is ready
    const currentVideoState = useStore.getState().videoState;
    let expectedServerTime = currentVideoState.timestamp;
    if (currentVideoState.isPlaying) {
      expectedServerTime += (Date.now() - currentVideoState.lastUpdate) / 1000;
    }
    
    if (expectedServerTime > 1.0) {
      event.target.seekTo(expectedServerTime, true);
    }
  };

  const handleStateChange = (event: YouTubeEvent) => {
    const playerState = event.data;
    
    // Hide loader when video is playing, paused, or cued
    if ([YouTube.PlayerState.PLAYING, YouTube.PlayerState.PAUSED, YouTube.PlayerState.CUED].includes(playerState)) {
      setIsLoadingVideo(false);
    }

    const currentVideoState = useStore.getState().videoState;

    if (!canControl) {
      // Force non-controllers to adhere to the server state immediately
      if (playerState === YouTube.PlayerState.PLAYING && !currentVideoState.isPlaying) {
        event.target.pauseVideo();
      } else if (playerState === YouTube.PlayerState.PAUSED && currentVideoState.isPlaying) {
        event.target.playVideo();
      }
      return;
    }
    
    const currentTime = event.target.getCurrentTime();
    
    let expectedServerTime = currentVideoState.timestamp;
    if (currentVideoState.isPlaying) {
      expectedServerTime += (Date.now() - currentVideoState.lastUpdate) / 1000;
    }

    const isSeek = Math.abs(currentTime - expectedServerTime) > 2.0;

    if (playerState === YouTube.PlayerState.PLAYING) {
      if (!currentVideoState.isPlaying || isSeek) {
        socket?.emit('sync_video', { isPlaying: true, timestamp: currentTime });
      }
    } else if (playerState === YouTube.PlayerState.PAUSED) {
      if (currentVideoState.isPlaying || isSeek) {
        socket?.emit('sync_video', { isPlaying: false, timestamp: currentTime });
      }
    } else if (playerState === YouTube.PlayerState.ENDED) {
      if (isController) {
        socket?.emit('video_ended');
      }
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: videoState.isPlaying ? 1 : 0,
      controls: 1, // Only controller should probably use controls, but let's allow everyone to see them and we enforce via state reset
      disablekb: isController ? 0 : 1, // disable keyboard controls for non-hosts
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full max-w-5xl mx-auto">
      {/* Controller Toolbar */}
      {canControl && (
        <div className="w-full flex">
          <SearchInput 
            buttonLabel="Load Video"
            onSelect={(id, title) => {
              setIsLoadingVideo(true);
              socket?.emit('sync_video', { videoId: id, isPlaying: true, timestamp: 0 });
            }}
          />
        </div>
      )}

      {/* Video Container */}
      <div className="w-full flex-1 min-h-[300px] aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
        {videoState.videoId ? (
          <div className="absolute inset-0 pointer-events-auto">
            {isLoadingVideo && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-purple-400 font-medium animate-pulse">Syncing Video...</p>
              </div>
            )}
            {!canControl && <div className="absolute inset-0 z-10" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }} />}
            <YouTube
              videoId={videoState.videoId}
              opts={opts}
              onReady={handleReady}
              onStateChange={handleStateChange}
              className="w-full h-full"
              iframeClassName="w-full h-full"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 flex-col gap-4">
            <PlaySquare className="w-16 h-16 opacity-20" />
            <p>No video playing</p>
          </div>
        )}
      </div>
    </div>
  );
}
