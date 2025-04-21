import { useState } from 'react';
import { Track as TrackType } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, Maximize2, Music, SlidersHorizontal, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import AudioMeter from './AudioMeter';
import WaveformVisualizer from './WaveformVisualizer';

interface TrackProps {
  track: TrackType;
  onVolumeChange?: (trackId: string, volume: number) => void;
  onPanChange?: (trackId: string, pan: number) => void;
  onMuteToggle?: (trackId: string) => void;
  onSoloToggle?: (trackId: string) => void;
  onInputMonitorToggle?: (trackId: string) => void;
  onFXChange?: (trackId: string, fxId: string, param: string, value: number) => void;
  onFXToggle?: (trackId: string, fxId: string) => void;
  onNameChange?: (trackId: string, name: string) => void;
  onFXDrawerOpen?: (track: TrackType) => void;
  audioUrl?: string;
}

const Track = ({ 
  track,
  audioUrl,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onInputMonitorToggle,
  onFXChange,
  onFXToggle,
  onNameChange,
  onFXDrawerOpen
}: TrackProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [trackName, setTrackName] = useState(track.name);
  const { playAudio } = useAudioEngine(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
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

  const handleFXClick = () => {
    if (onFXDrawerOpen) {
      onFXDrawerOpen(track);
    }
  };

  const handleNameChange = () => {
    if (onNameChange && trackName.trim() !== '') {
      onNameChange(track.id, trackName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameChange();
    } else if (e.key === 'Escape') {
      setTrackName(track.name);
      setIsEditing(false);
    }
  };
  
  const getTrackIcon = () => {
    switch(track.type.toLowerCase()) {
      case 'drums':
      case 'percussion':
        return <Music className="h-4 w-4" style={{ color: track.color }} />;
      default:
        return <Music className="h-4 w-4" style={{ color: track.color }} />;
    }
  };
  
  const handlePlayback = async () => {
    if (!audioUrl) return;
    
    if (!isPlaying) {
      const source = await playAudio(audioUrl);
      if (source) {
        setIsPlaying(true);
        source.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  return (
    <div className="track-container" style={{ borderLeft: `4px solid ${track.color}` }}>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {getTrackIcon()}
            
            {isEditing ? (
              <Input
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={handleKeyDown}
                className="h-6 py-1 px-2 w-32 bg-fever-black/40 border-fever-light/20"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-space font-bold text-sm">{track.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 hover:bg-fever-dark" 
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {track.isRecording && (
              <span className="bg-fever-red rounded-full h-2 w-2 animate-pulse"></span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-fever-dark"
              onClick={handleFXClick}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-fever-dark" 
              onClick={() => setExpanded(!expanded)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex mb-4 h-20 items-end space-x-2">
          {track.inputMonitor && (
            <div className="h-full flex items-center">
              <AudioMeter level={track.isRecording ? 0.7 : 0} height={80} />
            </div>
          )}
          
          <div className="flex-1 cursor-pointer" onClick={handlePlayback}>
            <WaveformVisualizer
              data={waveformData}
              height={80}
              width={track.inputMonitor ? "calc(100% - 28px)" : "100%"}
              color={track.color}
            />
          </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
