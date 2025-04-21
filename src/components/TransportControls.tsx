
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, Record, Music } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransportControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
  onMetronome: () => void;
}

const TransportControls = ({ 
  isRecording, 
  isPlaying, 
  onRecord, 
  onPlay, 
  onStop, 
  onMetronome 
}: TransportControlsProps) => {
  const [metronomeActive, setMetronomeActive] = useState(false);
  
  const handleMetronomeToggle = () => {
    setMetronomeActive(!metronomeActive);
    onMetronome();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-fever-black to-transparent p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-center items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full border-fever-light/20 bg-fever-dark"
                  onClick={onStop}
                >
                  <SkipBack className="h-5 w-5 text-fever-light" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop & Return to Start</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-12 h-12 rounded-full ${
                    isPlaying 
                      ? 'bg-fever-amber text-fever-black hover:bg-fever-amber/80' 
                      : 'border-fever-light/20 bg-fever-dark text-fever-light'
                  }`}
                  onClick={isPlaying ? onStop : onPlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-1" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? 'Pause' : 'Play'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-20 h-20 rounded-full ${
                    isRecording 
                      ? 'bg-fever-red animate-pulse-recording' 
                      : 'bg-fever-red hover:bg-fever-red/80'
                  } text-white shadow-lg`}
                  onClick={onRecord}
                >
                  <Record className="h-8 w-8" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? 'Stop Recording' : 'Start Recording'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-12 h-12 rounded-full ${
                    metronomeActive 
                      ? 'bg-fever-blue text-fever-black hover:bg-fever-blue/80' 
                      : 'border-fever-light/20 bg-fever-dark text-fever-light'
                  }`}
                  onClick={handleMetronomeToggle}
                >
                  <Music className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Metronome</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
