import { Mic, MicOff } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useEffect, useRef } from 'react';

export const MicToggle = () => {
  const { isMicOn, toggleMic, audioStreams } = useVoiceChat();

  return (
    <>
      <button
        onClick={toggleMic}
        className={`mic-btn ${isMicOn ? 'on' : ''}`}
        title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
        aria-label="Toggle microphone"
        aria-pressed={isMicOn}
      >
        {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
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
