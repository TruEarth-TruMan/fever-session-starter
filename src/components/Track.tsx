
import { useState } from 'react';
import { Track as TrackType } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, Maximize2 } from 'lucide-react';
import FXChain from './FXChain';

interface TrackProps {
  track: TrackType;
  onVolumeChange?: (trackId: string, volume: number) => void;
  onPanChange?: (trackId: string, pan: number) => void;
  onMuteToggle?: (trackId: string) => void;
  onSoloToggle?: (trackId: string) => void;
  onInputMonitorToggle?: (trackId: string) => void;
  onFXChange?: (trackId: string, fxId: string, param: string, value: number) => void;
  onFXToggle?: (trackId: string, fxId: string) => void;
}

const Track = ({ 
  track,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onInputMonitorToggle,
  onFXChange,
  onFXToggle
}: TrackProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Generate some random waveform data if none exists
  const waveformData = track.waveform && track.waveform.length > 0 
    ? track.waveform 
    : Array.from({ length: 50 }, () => Math.random() * 0.8);
  
  const handleVolumeChange = (values: number[]) => {
    if (onVolumeChange) {
      onVolumeChange(track.id, values[0]);
    }
  };
  
  const handlePanChange = (values: number[]) => {
    if (onPanChange) {
      onPanChange(track.id, values[0]);
    }
  };
  
  const handleMuteToggle = () => {
    if (onMuteToggle) {
      onMuteToggle(track.id);
    }
  };
  
  const handleSoloToggle = () => {
    if (onSoloToggle) {
      onSoloToggle(track.id);
    }
  };
  
  const handleInputMonitorToggle = () => {
    if (onInputMonitorToggle) {
      onInputMonitorToggle(track.id);
    }
  };
  
  const handleFXChange = (fxId: string, param: string, value: number) => {
    if (onFXChange) {
      onFXChange(track.id, fxId, param, value);
    }
  };
  
  const handleFXToggle = (fxId: string) => {
    if (onFXToggle) {
      onFXToggle(track.id, fxId);
    }
  };
  
  return (
    <div className="track-container" style={{ borderLeft: `4px solid ${track.color}` }}>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="font-space font-bold text-sm">{track.name}</span>
            {track.isRecording && (
              <span className="bg-fever-red rounded-full h-2 w-2 animate-pulse"></span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex mb-4 h-20 items-end space-x-[1px]">
          {waveformData.map((height, i) => (
            <div 
              key={`${track.id}-wave-${i}`}
              className="waveform-bar" 
              style={{ 
                height: `${Math.max(5, height * 100)}%`,
                backgroundColor: track.isRecording ? track.color : undefined,
              }}
            />
          ))}
        </div>
        
        <div className="track-controls">
          <Button
            variant="ghost"
            size="sm"
            className={`px-1 hover:bg-fever-dark ${track.muted ? 'text-fever-red' : 'text-fever-light'}`}
            onClick={handleMuteToggle}
          >
            <VolumeX className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`px-1 hover:bg-fever-dark ${track.soloed ? 'text-fever-amber' : 'text-fever-light'}`}
            onClick={handleSoloToggle}
          >
            S
          </Button>
          
          <div className="flex-grow">
            <Slider
              value={[track.volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center ml-2 space-x-1">
            <span className="text-xs font-space">{Math.round(track.volume * 100)}</span>
            <Volume2 className="h-4 w-4" />
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 border-t border-fever-light/10 pt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pan</span>
                <span className="text-xs font-space">{track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}</span>
              </div>
              
              <Slider
                value={[track.pan]}
                min={-1}
                max={1}
                step={0.01}
                onValueChange={handlePanChange}
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Input Monitor</span>
                <Switch 
                  checked={track.inputMonitor} 
                  onCheckedChange={handleInputMonitorToggle} 
                  className="data-[state=checked]:bg-fever-blue" 
                />
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Effects</h4>
                <FXChain 
                  fx={track.fx} 
                  onFXChange={handleFXChange} 
                  onFXToggle={handleFXToggle} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
