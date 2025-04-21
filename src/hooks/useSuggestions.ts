
import { useState, useEffect } from 'react';
import { Track } from '@/types';
import { Suggestion, SuggestionType } from '@/types/suggestions';
import { useToast } from '@/hooks/use-toast';

const VOLUME_THRESHOLD = 8; // ±8dB difference threshold
const MIN_LOOP_TAKES = 3;
const DISMISS_THRESHOLD = 3;

export const useSuggestions = (
  tracks: Track[],
  isPlaying: boolean,
  isRecording: boolean,
  loopEnabled: boolean,
  updateTrackFX: (trackId: string, fxId: string, updates: any) => void,
  updateTrack: (trackId: string, updates: Partial<Track>) => void
) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Record<SuggestionType, number>>({
    volume: 0,
    clipping: 0,
    dryVocals: 0,
    loopFatigue: 0
  });
  const [activeLoopTakes, setActiveLoopTakes] = useState(0);
  const { toast } = useToast();

  // Helper function to check if we should show a suggestion
  const shouldShowSuggestion = (type: SuggestionType) => {
    return dismissedSuggestions[type] < DISMISS_THRESHOLD;
  };

  // Check for significant volume differences between tracks
  const checkVolumeLevels = () => {
    if (!shouldShowSuggestion('volume')) return;

    const volumes = tracks.map(t => t.volume);
    const maxDiff = Math.max(...volumes) - Math.min(...volumes);
    
    if (maxDiff >= VOLUME_THRESHOLD) {
      const quietTrack = tracks.find(t => 
        t.volume === Math.min(...volumes)
      );
      
      if (quietTrack) {
        toast({
          title: "Volume Suggestion",
          description: `${quietTrack.name} is quite quiet. Want to balance it with the other tracks?`,
          action: (
            <button
              onClick={() => {
                updateTrack(quietTrack.id, { volume: quietTrack.volume + 6 });
                setDismissedSuggestions(prev => ({
                  ...prev,
                  volume: prev.volume + 1
                }));
              }}
              className="bg-fever-amber text-fever-black px-3 py-1 rounded hover:bg-fever-amber/80"
            >
              Fix It
            </button>
          ),
          duration: 8000,
        });
      }
    }
  };

  // Check for tracks that might need FX
  const checkDryVocals = () => {
    if (!shouldShowSuggestion('dryVocals')) return;

    const dryVocalTrack = tracks.find(t => 
      t.type.toLowerCase() === 'vocals' && 
      (!t.fx.length || t.fx.every(fx => !fx.active))
    );

    if (dryVocalTrack) {
      toast({
        title: "FX Suggestion",
        description: "Your vocals sound dry. Want to add some reverb and compression?",
        action: (
          <button
            onClick={() => {
              // Add basic FX chain
              const reverbId = 'reverb-' + Date.now();
              const compressorId = 'compressor-' + Date.now();
              
              updateTrack(dryVocalTrack.id, {
                fx: [
                  {
                    id: reverbId,
                    name: 'Reverb',
                    type: 'reverb',
                    active: true,
                    params: { mix: 0.2, decay: 1.5 }
                  },
                  {
                    id: compressorId,
                    name: 'Compressor',
                    type: 'compressor',
                    active: true,
                    params: { threshold: -18, ratio: 2.5 }
                  }
                ]
              });
              setDismissedSuggestions(prev => ({
                ...prev,
                dryVocals: prev.dryVocals + 1
              }));
            }}
            className="bg-fever-amber text-fever-black px-3 py-1 rounded hover:bg-fever-amber/80"
          >
            Add FX
          </button>
        ),
        duration: 8000,
      });
    }
  };

  // Track loop takes and check for fatigue
  useEffect(() => {
    if (loopEnabled && isRecording) {
      setActiveLoopTakes(prev => prev + 1);
    }

    if (activeLoopTakes >= MIN_LOOP_TAKES && shouldShowSuggestion('loopFatigue')) {
      toast({
        title: "Loop Suggestion",
        description: "Want to flatten these takes into a single track?",
        action: (
          <button
            onClick={() => {
              // Logic to flatten loop takes would go here
              console.log('Flattening loop takes...');
              setActiveLoopTakes(0);
              setDismissedSuggestions(prev => ({
                ...prev,
                loopFatigue: prev.loopFatigue + 1
              }));
            }}
            className="bg-fever-amber text-fever-black px-3 py-1 rounded hover:bg-fever-amber/80"
          >
            Flatten
          </button>
        ),
        duration: 8000,
      });
    }
  }, [isRecording, loopEnabled]);

  // Check suggestions when playback starts
  useEffect(() => {
    if (isPlaying && !isRecording) {
      checkVolumeLevels();
      checkDryVocals();
    }
  }, [isPlaying, tracks]);

  // Increment dismiss count for a suggestion type
  const dismissSuggestion = (type: SuggestionType) => {
    setDismissedSuggestions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  return {
    dismissSuggestion
  };
};
