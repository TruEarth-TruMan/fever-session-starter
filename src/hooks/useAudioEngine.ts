
import { useState, useEffect } from 'react';

export const useAudioEngine = (deviceId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
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
    };
  }, [deviceId]);

  const startRecording = async () => {
    if (!window.electron || !isInitialized) return;

    const success = window.electron.startRecording();
    if (success) {
      setIsRecording(true);
    }
  };

  const stopRecording = async () => {
    if (!window.electron || !isInitialized || !isRecording) return null;

    try {
      const audioBlob = await window.electron.stopRecording();
      setIsRecording(false);
      return audioBlob;
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error stopping recording');
      return null;
    }
  };

  return {
    isInitialized,
    isRecording,
    inputLevel,
    error,
    startRecording,
    stopRecording
  };
};
