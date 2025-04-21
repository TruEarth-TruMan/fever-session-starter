
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Repeat } from 'lucide-react';

interface LoopControlsProps {
  isEnabled: boolean;
  onToggleLoop: (enabled: boolean) => void;
  loopStart: number;
  loopEnd: number;
  onLoopRangeChange: (start: number, end: number) => void;
  totalDuration: number;
  isOverdubbing: boolean;
  onToggleOverdub: (enabled: boolean) => void;
}

const LoopControls = ({
  isEnabled,
  onToggleLoop,
  loopStart,
  loopEnd,
  onLoopRangeChange,
  totalDuration,
  isOverdubbing,
  onToggleOverdub
}: LoopControlsProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleRangeChange = (values: number[]) => {
    onLoopRangeChange(values[0], values[1]);
  };

  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-fever-dark/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggleLoop}
          className="data-[state=checked]:bg-fever-blue"
        />
        <Label className="text-sm font-medium">
          <div className="flex items-center space-x-1">
            <Repeat className="h-4 w-4" />
            <span>Loop Mode</span>
          </div>
        </Label>
      </div>

      {isEnabled && (
        <>
          <div className="flex-1">
            <Slider
              value={[loopStart, loopEnd]}
              min={0}
              max={totalDuration}
              step={0.1}
              onValueChange={handleRangeChange}
              className="w-full"
              disabled={!isEnabled}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label 
              htmlFor="overdub" 
              className="text-sm font-medium cursor-pointer"
            >
              Overdub
            </Label>
            <Switch
              id="overdub"
              checked={isOverdubbing}
              onCheckedChange={onToggleOverdub}
              className="data-[state=checked]:bg-fever-red"
              disabled={!isEnabled}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LoopControls;
