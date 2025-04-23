
import { useCallback, useEffect, useState } from 'react';
import { Track } from '@/types';
import { toast } from '@/hooks/use-toast';

const tips = [
  {
    condition: (track: Track) => track.type === 'vocals' && (!track.fx || track.fx.length === 0),
    message: "Psst... LoFi vocals love some warm tape saturation.",
  },
  {
    condition: (track: Track) => track.volume > 6,
    message: "That track's hot—but your output volume's iced out.",
  },
  {
    condition: (track: Track) => 
      track.type === 'drums' && (!track.fx || !track.fx.some(fx => fx.type === 'compressor')),
    message: "Don't sleep on compression, chief.",
  }
];

export const useHeatMizerTips = (tracks: Track[]) => {
  const [lastTipTime, setLastTipTime] = useState<number>(Date.now());
  const COOLDOWN = 30000; // 30 seconds between tips

  const showTip = useCallback((message: string) => {
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
  }, [lastTipTime]);

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
