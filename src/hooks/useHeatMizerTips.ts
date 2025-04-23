
import { useCallback, useEffect, useState } from 'react';
import { Track } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useHeatMizerPrompter } from './useHeatMizerPrompter';

const tips = [
  {
    condition: (track: Track) => track.type === 'vocals' && (!track.fx || track.fx.length === 0),
    message: "Psst... LoFi vocals love some warm tape saturation.",
    errorType: "dryVocals"
  },
  {
    condition: (track: Track) => track.volume > 6,
    message: "That track's hot—but your output volume's iced out.",
    errorType: "clipping"
  },
  {
    condition: (track: Track) => 
      track.type === 'drums' && (!track.fx || !track.fx.some(fx => fx.type === 'compressor')),
    message: "Don't sleep on compression, chief.",
    errorType: "missingFX"
  },
  {
    condition: (track: Track) => track.volume < -10,
    message: "I'm gonna need a hearing aid to catch that track. Bring it up.",
    errorType: "lowVolume"
  }
];

export const useHeatMizerTips = (tracks: Track[]) => {
  const [lastTipTime, setLastTipTime] = useState<number>(Date.now());
  const COOLDOWN = 30000; // 30 seconds between tips
  const { isMuted, showErrorPrompt } = useHeatMizerPrompter();

  const showTip = useCallback((message: string) => {
    if (isMuted) return; // Don't show tips if muted
    
    const now = Date.now();
    if (now - lastTipTime > COOLDOWN) {
      toast({
        title: "Heat Mizer Says",
        description: message,
        duration: 5000,
        className: "bg-fever-dark border border-fever-amber text-fever-amber",
      });
      setLastTipTime(now);
    }
  }, [lastTipTime, isMuted]);

  // Check for empty session
  useEffect(() => {
    if (tracks.length === 0 && !isMuted) {
      // Only show this tip once when tracks are empty
      const hasShownEmptyTip = localStorage.getItem('heatMizer_emptyTipShown');
      
      if (!hasShownEmptyTip) {
        const timer = setTimeout(() => {
          showErrorPrompt('emptySession');
          localStorage.setItem('heatMizer_emptyTipShown', 'true');
        }, 8000); // Show after 8 seconds if session stays empty
        
        return () => clearTimeout(timer);
      }
    } else {
      // Reset the flag when tracks exist
      localStorage.removeItem('heatMizer_emptyTipShown');
    }
  }, [tracks.length, isMuted, showErrorPrompt]);

  useEffect(() => {
    const checkTracks = () => {
      for (const track of tracks) {
        const applicableTip = tips.find(tip => tip.condition(track));
        if (applicableTip) {
          showTip(applicableTip.message);
          break;
        }
      }
    };

    const interval = setInterval(checkTracks, 10000);
    return () => clearInterval(interval);
  }, [tracks, showTip]);

  return null;
};
