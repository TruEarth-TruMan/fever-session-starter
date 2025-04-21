
import { useState } from 'react';
import { Track as TrackType } from '@/types';

export const useTransportManager = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(30);
  const [isOverdubbing, setIsOverdubbing] = useState(false);
  const [totalDuration, setTotalDuration] = useState(120);

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
    if (loopEnabled) {
      setIsPlaying(false);
      console.log('Starting playback from loop start:', loopStart);
    }
    setIsPlaying(true);
  };
  
  const handleStop = (tracks: TrackType[], setTracks: (tracks: TrackType[]) => void) => {
    setIsPlaying(false);
    setIsRecording(false);
    if (loopEnabled) {
      console.log('Stopping and resetting to loop start:', loopStart);
    }
    
    setTracks(tracks.map(track => ({
      ...track,
      isRecording: false
    })));
  };

  const handleLoopRangeChange = (start: number, end: number) => {
    setLoopStart(start);
    setLoopEnd(end);
  };

  const handleToggleLoop = (enabled: boolean) => {
    setLoopEnabled(enabled);
    if (enabled) {
      setIsPlaying(false);
    }
  };

  return {
    isRecording,
    isPlaying,
    loopEnabled,
    loopStart,
    loopEnd,
    isOverdubbing,
    totalDuration,
    setIsOverdubbing,
    handleRecord,
    handlePlay,
    handleStop,
    handleLoopRangeChange,
    handleToggleLoop
  };
};
