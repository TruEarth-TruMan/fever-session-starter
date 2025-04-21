
import { useState } from 'react';
import { Track as TrackType, SessionTemplate } from '@/types';
import Track from './Track';
import TransportControls from './TransportControls';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ArrowLeft 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TrackViewProps {
  sessionTemplate: SessionTemplate;
  onBack: () => void;
}

const TrackView = ({ sessionTemplate, onBack }: TrackViewProps) => {
  const [tracks, setTracks] = useState<TrackType[]>(sessionTemplate.tracks);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleVolumeChange = (trackId: string, volume: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };
  
  const handlePanChange = (trackId: string, pan: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, pan } : track
    ));
  };
  
  const handleMuteToggle = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };
  
  const handleSoloToggle = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, soloed: !track.soloed } : track
    ));
  };
  
  const handleInputMonitorToggle = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, inputMonitor: !track.inputMonitor } : track
    ));
  };
  
  const handleFXChange = (trackId: string, fxId: string, param: string, value: number) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          fx: track.fx.map(fx => {
            if (fx.id === fxId) {
              return {
                ...fx,
                params: {
                  ...fx.params,
                  [param]: value
                }
              };
            }
            return fx;
          })
        };
      }
      return track;
    }));
  };
  
  const handleFXToggle = (trackId: string, fxId: string) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          fx: track.fx.map(fx => {
            if (fx.id === fxId) {
              return {
                ...fx,
                active: !fx.active
              };
            }
            return fx;
          })
        };
      }
      return track;
    }));
  };
  
  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsPlaying(false);
    } else {
      // Start recording with count-in simulation
      setIsRecording(true);
      setIsPlaying(true);
      
      // Update tracks to show recording state
      setTracks(tracks.map(track => {
        if (track.inputMonitor) {
          return {
            ...track,
            isRecording: true,
            waveform: Array.from({ length: 50 }, () => Math.random() * 0.8)
          };
        }
        return track;
      }));
    }
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    setIsRecording(false);
    
    // Reset recording state on tracks
    setTracks(tracks.map(track => ({
      ...track,
      isRecording: false
    })));
  };
  
  const handleMetronome = () => {
    // Metronome toggle functionality would be implemented here
    console.log('Metronome toggled');
  };
  
  return (
    <div className="pb-32">
      <div className="container max-w-4xl mx-auto pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-fever-red">
              {sessionTemplate.name} Session
            </h1>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-fever-light/20 bg-fever-dark flex gap-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-fever-dark border-fever-light/20 w-56">
              <div className="space-y-2">
                <h3 className="font-bold mb-2 text-fever-red">Export Options</h3>
                <Button variant="outline" className="w-full justify-start border-fever-light/20 hover:bg-fever-black">
                  Export as MP3
                </Button>
                <Button variant="outline" className="w-full justify-start border-fever-light/20 hover:bg-fever-black">
                  Export as WAV
                </Button>
                <Button variant="outline" className="w-full justify-start border-fever-light/20 hover:bg-fever-black">
                  Export as STEMS
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-4">
          {tracks.map((track) => (
            <Track 
              key={track.id}
              track={track}
              onVolumeChange={handleVolumeChange}
              onPanChange={handlePanChange}
              onMuteToggle={handleMuteToggle}
              onSoloToggle={handleSoloToggle}
              onInputMonitorToggle={handleInputMonitorToggle}
              onFXChange={handleFXChange}
              onFXToggle={handleFXToggle}
            />
          ))}
        </div>
      </div>
      
      <TransportControls 
        isRecording={isRecording}
        isPlaying={isPlaying}
        onRecord={handleRecord}
        onPlay={handlePlay}
        onStop={handleStop}
        onMetronome={handleMetronome}
      />
    </div>
  );
};

export default TrackView;
