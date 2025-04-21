
import { useState } from 'react';
import { useAudioEngine } from './useAudioEngine';

export const useTrackPlayback = (audioUrl: string | undefined) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { playAudio } = useAudioEngine(null);

  const handlePlayback = async () => {
    if (!audioUrl) return;
    
    if (!isPlaying) {
      const source = await playAudio(audioUrl);
      if (source) {
        setIsPlaying(true);
        source.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  return {
    isPlaying,
    handlePlayback
  };
};
