
import { useState } from 'react';
import { Track as TrackType } from '@/types';

export const useTransportState = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRecord = (tracks: TrackType[], setTracks: (tracks: TrackType[]) => void) => {
    if (isRecording) {
      setIsRecording(false);
      setIsPlaying(false);
    } else {
      setIsRecording(true);
      setIsPlaying(true);
      
      setTracks(tracks.map(track => {
        if (track.inputMonitor) {
          return {
            ...track,
            isRecording: true,
            waveform: Array.from({ length: 50 }, () => Math.random() * 0.8)
          };
        }
        return track;
      }));
    }
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handleStop = (tracks: TrackType[], setTracks: (tracks: TrackType[]) => void) => {
    setIsPlaying(false);
    setIsRecording(false);
    
    setTracks(tracks.map(track => ({
      ...track,
      isRecording: false
    })));
  };

  return {
    isRecording,
    isPlaying,
    handleRecord,
    handlePlay,
    handleStop
  };
};
