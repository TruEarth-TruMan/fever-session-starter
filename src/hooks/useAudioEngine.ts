
import { useState, useEffect } from 'react';

export interface AudioBlob {
  blob: Blob;
  url: string;
}

export const useAudioEngine = (deviceId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let levelInterval: NodeJS.Timeout;

    const initialize = async () => {
      if (!deviceId || !window.electron) return;

      try {
        const success = await window.electron.initializeAudio(deviceId);
        if (success) {
          setIsInitialized(true);
          setError(null);
          const ctx = new AudioContext({
            sampleRate: 48000,
            latencyHint: 'interactive'
          });
          setAudioContext(ctx);

          // Start monitoring input levels
          levelInterval = setInterval(async () => {
            const level = await window.electron.getInputLevel();
            setInputLevel(level);
          }, 100);
        } else {
          setError('Failed to initialize audio engine');
        }
      } catch (err) {
        setError('Error initializing audio engine');
        console.error('Audio initialization error:', err);
      }
    };

    initialize();

    return () => {
      if (levelInterval) clearInterval(levelInterval);
      if (window.electron) {
        window.electron.cleanup();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [deviceId]);

  const startRecording = async () => {
    if (!window.electron || !isInitialized) return false;
    const success = window.electron.startRecording();
    if (success) {
      setIsRecording(true);
    }
    return success;
  };

  const stopRecording = async () => {
    if (!window.electron || !isInitialized || !isRecording) return null;

    try {
      const audioBlob = await window.electron.stopRecording();
      setIsRecording(false);
      return {
        blob: audioBlob,
        url: URL.createObjectURL(audioBlob)
      } as AudioBlob;
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error stopping recording');
      return null;
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (!audioContext) return;
    
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      return source;
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Error playing audio');
      return null;
    }
  };

  return {
    isInitialized,
    isRecording,
    inputLevel,
    error,
    startRecording,
    stopRecording,
    playAudio
  };
};
