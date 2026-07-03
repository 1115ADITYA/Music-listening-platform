import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export const useVoiceChat = () => {
  const { socket } = useSocket();
  const { users } = useStore();
  const [isMicOn, setIsMicOn] = useState(false);
  const [audioStreams, setAudioStreams] = useState<Record<string, MediaStream>>({});
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const myIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (socket) {
      myIdRef.current = socket.id || null;
    }
  }, [socket]);

  // Clean up peer connections when a user leaves
  useEffect(() => {
    if (!socket || !users) return;

    const currentUsersIds = new Set(users.map(u => u.id));
    
    // Remove peer connections and audio streams for users who left
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      if (!currentUsersIds.has(peerId)) {
        peerConnectionsRef.current[peerId].close();
        delete peerConnectionsRef.current[peerId];
        
        setAudioStreams(prev => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      }
    });
  }, [users, socket]);

  const createPeerConnection = useCallback((targetUserId: string) => {
    if (!socket) return null;
    if (peerConnectionsRef.current[targetUserId]) {
      return peerConnectionsRef.current[targetUserId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    peerConnectionsRef.current[targetUserId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', { targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setAudioStreams(prev => ({
        ...prev,
        [targetUserId]: event.streams[0]
      }));
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ senderId, offer }: { senderId: string, offer: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(senderId);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc_answer', { targetUserId: senderId, answer });
    };

    const handleAnswer = async ({ senderId, answer }: { senderId: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ senderId, candidate }: { senderId: string, candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current[senderId];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      }
    };

    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);

    return () => {
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
    };
  }, [socket, createPeerConnection]);

  const toggleMic = async () => {
    if (!socket) return;

    if (isMicOn) {
      // Turn off mic
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setIsMicOn(false);
      socket.emit('update_mic', false);
      
      // We keep the peer connections alive but audio tracks are stopped, 
      // which sends silence/closes tracks to peers.
    } else {
      // Turn on mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMicOn(true);
        socket.emit('update_mic', true);

        // Add track to existing connections and renegotiate
        Object.keys(peerConnectionsRef.current).forEach(async (peerId) => {
          const pc = peerConnectionsRef.current[peerId];
          const senders = pc.getSenders();
          const audioTrack = stream.getAudioTracks()[0];
          
          const sender = senders.find(s => s.track?.kind === 'audio');
          if (sender) {
            sender.replaceTrack(audioTrack);
          } else {
            pc.addTrack(audioTrack, stream);
          }

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', { targetUserId: peerId, offer });
        });

        // Create connections to users we don't have connections with yet
        users.forEach(async (user) => {
          if (user.id !== socket.id && !peerConnectionsRef.current[user.id]) {
            const pc = createPeerConnection(user.id);
            if (pc) {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('webrtc_offer', { targetUserId: user.id, offer });
            }
          }
        });

      } catch (err) {
        console.error('Error accessing microphone', err);
        toast.error('Could not access microphone');
      }
    }
  };

  return {
    isMicOn,
    toggleMic,
    audioStreams
  };
};
