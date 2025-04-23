
import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// Randomized idle prompts as specified in the design 
const IDLE_PROMPTS = [
  "It's gettin' cold in here. Lay down another track before I freeze to death.",
  "You gonna mix or just stare at it all day?",
  "Back in my day we bounced to tape, uphill both ways.",
  "Don't overthink it. Slap some reverb on it and call it 'ethereal.'",
  "Pro tip: Reverb makes it sound expensive. Delay makes it sound smart.",
  "Not to rush you, but I've seen glaciers move faster than this session.",
  "That's not bad. I mean, it could be worse. I've heard worse.",
  "Remember: if you can't fix it in the mix, call it 'experimental'.",
  "I've heard elevator music with more edge. But you do you."
];

// Error prompts
const ERROR_PROMPTS = {
  noInput: "Uh-oh. No mic, no mojo. Check your input settings, champ.",
  clipping: "That's hotter than a vinyl in a parked car. Dial it back.",
  emptySession: "Silence is golden... but not that golden. Add a track already."
};

export const useHeatMizerPrompter = (isIdle = false) => {
  const [lastPromptTime, setLastPromptTime] = useState<number>(Date.now());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Load mute preference from localStorage
  useEffect(() => {
    const mutedPreference = localStorage.getItem('heatMizer_muted');
    setIsMuted(mutedPreference === 'true');
  }, []);
  
  // Helper to toggle mute state
  const toggleMute = useCallback(() => {
    const newMuteState = !isMuted;
    localStorage.setItem('heatMizer_muted', newMuteState.toString());
    setIsMuted(newMuteState);
    
    toast({
      title: newMuteState ? "Heat Mizer Muted" : "Heat Mizer Unmuted",
      description: newMuteState ? "He'll be quiet now" : "The heat is back on",
      duration: 3000,
    });
  }, [isMuted]);
  
  // Random idle prompts, shown every 5-10 minutes if user is idle
  useEffect(() => {
    if (isMuted || !isIdle) return;
    
    const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const MAX_INTERVAL = 10 * 60 * 1000; // 10 minutes
    
    const getRandomInterval = () => 
      Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
    
    const showRandomPrompt = () => {
      const now = Date.now();
      if (now - lastPromptTime >= MIN_INTERVAL) {
        const randomPrompt = IDLE_PROMPTS[Math.floor(Math.random() * IDLE_PROMPTS.length)];
        
        toast({
          title: "Heat Mizer Says",
          description: randomPrompt,
          duration: 8000,
          className: "bg-fever-dark border border-fever-amber text-fever-amber",
        });
        
        setLastPromptTime(now);
      }
    };
    
    const interval = setInterval(showRandomPrompt, getRandomInterval());
    return () => clearInterval(interval);
  }, [isIdle, isMuted, lastPromptTime]);
  
  // Error handling methods
  const showErrorPrompt = useCallback((errorType: keyof typeof ERROR_PROMPTS) => {
    if (isMuted) return;
    
    toast({
      title: "Heat Mizer Warning",
      description: ERROR_PROMPTS[errorType] || "Something's not right here.",
      duration: 8000,
      variant: "destructive",
      className: "bg-fever-dark border border-fever-red text-fever-red",
    });
  }, [isMuted]);

  return {
    isMuted,
    toggleMute,
    showErrorPrompt
  };
};
