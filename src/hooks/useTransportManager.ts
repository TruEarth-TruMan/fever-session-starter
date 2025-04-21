
import { useState, useEffect, useRef } from 'react';
import { Track as TrackType } from '@/types';

export const useTransportManager = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(30);
  const [isOverdubbing, setIsOverdubbing] = useState(false);
  const [totalDuration, setTotalDuration] = useState(120);
  const [currentPosition, setCurrentPosition] = useState(0);
  const playbackTimerRef = useRef<number | null>(null);

  // Clear the playback timer when component unmounts
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current !== null) {
        window.clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // Handle current position updates during playback
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = window.setInterval(() => {
        setCurrentPosition(prev => {
          const newPosition = prev + 0.1;
          
          // Handle loop if enabled
          if (loopEnabled && newPosition >= loopEnd) {
            return loopStart;
          }
          
          // Stop at the end if not looping
          if (newPosition >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          
          return newPosition;
        });
      }, 100); // Update position every 100ms (10 times per second)
    } else if (playbackTimerRef.current !== null) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    
    return () => {
      if (playbackTimerRef.current !== null) {
        window.clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, loopEnabled, loopEnd, loopStart, totalDuration]);

  const handleRecord = (tracks: TrackType[], setTracks: (tracks: TrackType[]) => void) => {
    if (isRecording) {
      setIsRecording(false);
      setIsPlaying(false);
      setCurrentPosition(0);
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
      setCurrentPosition(loopStart);
      console.log('Starting playback from loop start:', loopStart);
    }
    setIsPlaying(true);
  };
  
  const handleStop = (tracks: TrackType[], setTracks: (tracks: TrackType[]) => void) => {
    setIsPlaying(false);
    setIsRecording(false);
    setCurrentPosition(0);
    
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
      setCurrentPosition(loopStart);
    }
  };
  
  const handleSkipBackward = () => {
    setCurrentPosition(prev => {
      const newPosition = Math.max(0, prev - 5);
      
      if (loopEnabled) {
        return Math.max(loopStart, newPosition);
      }
      
      return newPosition;
    });
  };
  
  const handleSkipForward = () => {
    setCurrentPosition(prev => {
      const newPosition = prev + 10;
      
      if (loopEnabled && newPosition > loopEnd) {
        return loopEnd;
      }
      
      if (newPosition > totalDuration) {
        return totalDuration;
      }
      
      return newPosition;
    });
  };

  return {
    isRecording,
    isPlaying,
    loopEnabled,
    loopStart,
    loopEnd,
    isOverdubbing,
    totalDuration,
    currentPosition,
    setIsOverdubbing,
    handleRecord,
    handlePlay,
    handleStop,
    handleLoopRangeChange,
    handleToggleLoop,
    handleSkipBackward,
    handleSkipForward
  };
};
