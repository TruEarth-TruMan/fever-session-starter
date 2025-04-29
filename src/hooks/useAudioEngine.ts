
import { useState, useEffect } from 'react';
import type { ElectronAPI } from '@/types/electron';

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
      if (!deviceId) return;

      try {
        // Initialize audio based on environment
        if (window.electron?.initializeAudio) {
          // Electron environment
          const success = await window.electron.initializeAudio(deviceId);
          if (success) {
            setIsInitialized(true);
            setError(null);
            
            // Set up audio context
            const ctx = new AudioContext({
              sampleRate: 48000,
              latencyHint: 'interactive'
            });
            setAudioContext(ctx);

            // Start monitoring input levels
            levelInterval = setInterval(async () => {
              if (window.electron) {
                const level = await window.electron.getInputLevel();
                setInputLevel(level);
              }
            }, 100);
          } else {
            setError('Failed to initialize audio engine');
          }
        } else {
          // Web environment fallback
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              audio: { deviceId: { exact: deviceId } } 
            });
            
            // Create web audio context
            const ctx = new AudioContext({
              sampleRate: 48000,
              latencyHint: 'interactive'
            });
            
            // Create analyzer for input level monitoring
            const source = ctx.createMediaStreamSource(stream);
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            
            setAudioContext(ctx);
            setIsInitialized(true);
            setError(null);
            
            // Monitor input levels
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            levelInterval = setInterval(() => {
              analyzer.getByteFrequencyData(dataArray);
              // Calculate average level
              const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
              // Normalize to 0-1 range
              setInputLevel(average / 255);
            }, 100);
          } catch (err) {
            setError('Failed to access microphone');
            console.error('Media device error:', err);
          }
        }
      } catch (err) {
        setError('Error initializing audio engine');
        console.error('Audio initialization error:', err);
      }
    };

    initialize();

    return () => {
      if (levelInterval) clearInterval(levelInterval);
      if (window.electron?.cleanup) {
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
