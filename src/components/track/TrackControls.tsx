
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface TrackControlsProps {
  trackId: string;
  volume: number;
  muted: boolean;
  soloed: boolean;
  onVolumeChange: (trackId: string, volume: number) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
}

const TrackControls = ({
  trackId,
  volume,
  muted,
  soloed,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle
}: TrackControlsProps) => {
  const handleVolumeChange = (values: number[]) => {
    onVolumeChange(trackId, values[0]);
  };

  return (
    <div className="track-controls">
      <Button
        variant="ghost"
        size="sm"
        className={`px-1 hover:bg-fever-dark ${muted ? 'text-fever-red' : 'text-fever-light'}`}
        onClick={() => onMuteToggle(trackId)}
      >
        <VolumeX className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`px-1 hover:bg-fever-dark ${soloed ? 'text-fever-amber' : 'text-fever-light'}`}
        onClick={() => onSoloToggle(trackId)}
      >
        S
      </Button>
      
      <div className="flex-grow">
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
      
      <div className="flex items-center ml-2 space-x-1">
        <span className="text-xs font-space">{Math.round(volume * 100)}</span>
        <Volume2 className="h-4 w-4" />
      </div>
    </div>
  );
};

export default TrackControls;
