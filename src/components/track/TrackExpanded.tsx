
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface TrackExpandedProps {
  trackId: string;
  pan: number;
  inputMonitor: boolean;
  onPanChange: (trackId: string, pan: number) => void;
  onInputMonitorToggle: (trackId: string) => void;
}

const TrackExpanded = ({
  trackId,
  pan,
  inputMonitor,
  onPanChange,
  onInputMonitorToggle
}: TrackExpandedProps) => {
  const handlePanChange = (values: number[]) => {
    onPanChange(trackId, values[0]);
  };

  return (
    <div className="mt-4 border-t border-fever-light/10 pt-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Pan</span>
          <span className="text-xs font-space">
            {pan === 0 ? 'C' : pan < 0 ? `L${Math.abs(Math.round(pan * 100))}` : `R${Math.round(pan * 100)}`}
          </span>
        </div>
        
        <Slider
          value={[pan]}
          min={-1}
          max={1}
          step={0.01}
          onValueChange={handlePanChange}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Input Monitor</span>
          <Switch 
            checked={inputMonitor} 
            onCheckedChange={() => onInputMonitorToggle(trackId)} 
            className="data-[state=checked]:bg-fever-blue" 
          />
        </div>
      </div>
    </div>
  );
};

export default TrackExpanded;
