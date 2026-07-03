import { Mic, MicOff } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useEffect, useRef } from 'react';

export const MicToggle = () => {
  const { isMicOn, toggleMic, audioStreams } = useVoiceChat();

  return (
    <>
      <button
        onClick={toggleMic}
        className={`p-3 rounded-full transition-all shadow-lg flex items-center justify-center ${
          isMicOn 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
        }`}
        title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
      >
        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Render invisible audio elements for incoming streams */}
      {Object.entries(audioStreams).map(([peerId, stream]) => (
        <AudioPlayer key={peerId} stream={stream} />
      ))}
    </>
  );
};

// Helper component to play MediaStream
const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline className="hidden" />;
};
