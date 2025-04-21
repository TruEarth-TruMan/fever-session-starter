
import { useState } from 'react';
import { Track as TrackType, SessionTemplate } from '@/types';
import Track from './Track';
import FXDrawer from './FXDrawer';
import TransportControls from './TransportControls';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ArrowLeft,
  Save,
  Pencil
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrackViewProps {
  sessionTemplate: SessionTemplate;
  onBack: () => void;
}

const TrackView = ({ sessionTemplate, onBack }: TrackViewProps) => {
  const [sessionName, setSessionName] = useState(sessionTemplate.name);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [tracks, setTracks] = useState<TrackType[]>(sessionTemplate.tracks);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [fxDrawerOpen, setFxDrawerOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("mp3");
  const [exportQuality, setExportQuality] = useState("320");
  
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

  const handleNameChange = (trackId: string, name: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, name } : track
    ));
  };

  const handleFXDrawerOpen = (track: TrackType) => {
    setSelectedTrack(track);
    setFxDrawerOpen(true);
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

  const handleSessionNameChange = () => {
    setIsEditingSession(false);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log(`Exporting as ${exportFormat} with quality ${exportQuality}`);
  };

  const getExportPreset = () => {
    if (exportFormat === "wav") {
      return "YouTube Ready (WAV, 44.1kHz)";
    } else if (exportFormat === "mp3" && exportQuality === "320") {
      return "Streaming Optimized (MP3, 320kbps)";
    }
    return "Custom";
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
            
            {isEditingSession ? (
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={handleSessionNameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSessionNameChange();
                  if (e.key === 'Escape') {
                    setSessionName(sessionTemplate.name);
                    setIsEditingSession(false);
                  }
                }}
                className="h-8 py-1 px-2 w-48 bg-fever-black/40 border-fever-light/20"
                autoFocus
              />
            ) : (
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-fever-red">
                  {sessionName} Session
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 w-6 p-0" 
                  onClick={() => setIsEditingSession(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-fever-light/20 bg-fever-dark flex gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-fever-dark border-fever-light/20">
                <DialogHeader>
                  <DialogTitle className="text-fever-light">Save Session</DialogTitle>
                  <DialogDescription className="text-fever-light/70">
                    Save your current session progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="session-name" className="text-fever-light mb-2 block">
                    Session Name
                  </Label>
                  <Input
                    id="session-name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="bg-fever-black/40 border-fever-light/20 text-fever-light"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-fever-light/20 text-fever-light">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    className="bg-fever-red text-white hover:bg-fever-red/80"
                    onClick={() => console.log('Saving session:', sessionName)}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-fever-light/20 bg-fever-dark flex gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-fever-dark border-fever-light/20">
                <DialogHeader>
                  <DialogTitle className="text-fever-light">Export Options</DialogTitle>
                  <DialogDescription className="text-fever-light/70">
                    Choose your preferred export format and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="format" className="text-fever-light">
                      Format
                    </Label>
                    <Select 
                      value={exportFormat} 
                      onValueChange={setExportFormat}
                    >
                      <SelectTrigger id="format" className="bg-fever-black/40 border-fever-light/20 text-fever-light">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-fever-dark border-fever-light/20">
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="wav">WAV</SelectItem>
                        <SelectItem value="stems">STEMS (Individual tracks)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {exportFormat === "mp3" && (
                    <div className="space-y-2">
                      <Label htmlFor="quality" className="text-fever-light">
                        Bitrate
                      </Label>
                      <Select 
                        value={exportQuality} 
                        onValueChange={setExportQuality}
                      >
                        <SelectTrigger id="quality" className="bg-fever-black/40 border-fever-light/20 text-fever-light">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent className="bg-fever-dark border-fever-light/20">
                          <SelectItem value="128">128 kbps</SelectItem>
                          <SelectItem value="256">256 kbps</SelectItem>
                          <SelectItem value="320">320 kbps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="preset" className="text-fever-light">
                      Preset
                    </Label>
                    <div className="px-3 py-2 bg-fever-black/40 border border-fever-light/20 rounded-md text-fever-light">
                      {getExportPreset()}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-fever-light/20 text-fever-light">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    className="bg-fever-amber text-fever-black hover:bg-fever-amber/80"
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
              onNameChange={handleNameChange}
              onFXDrawerOpen={handleFXDrawerOpen}
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

      <FXDrawer
        track={selectedTrack}
        open={fxDrawerOpen}
        onOpenChange={setFxDrawerOpen}
        onFXChange={handleFXChange}
        onFXToggle={handleFXToggle}
      />
    </div>
  );
};

export default TrackView;
