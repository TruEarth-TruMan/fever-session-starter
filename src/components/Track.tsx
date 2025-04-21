
import { useState } from 'react';
import { Track as TrackType } from '@/types';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import AudioMeter from './visualizations/AudioMeter';
import WaveformVisualizer from './visualizations/WaveformVisualizer';
import TrackHeader from './track/TrackHeader';
import TrackControls from './track/TrackControls';
import TrackExpanded from './track/TrackExpanded';

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
  
  const handleFXClick = () => {
    if (onFXDrawerOpen) {
      onFXDrawerOpen(track);
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
        <TrackHeader
          id={track.id}
          name={track.name}
          color={track.color}
          type={track.type}
          isRecording={track.isRecording || false}
          isEditing={isEditing}
          trackName={trackName}
          setIsEditing={setIsEditing}
          setTrackName={setTrackName}
          onNameChange={onNameChange || (() => {})}
          onFXClick={handleFXClick}
          onExpandClick={() => setExpanded(!expanded)}
        />
        
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
        
        <TrackControls
          trackId={track.id}
          volume={track.volume}
          muted={track.muted}
          soloed={track.soloed}
          onVolumeChange={onVolumeChange || (() => {})}
          onMuteToggle={onMuteToggle || (() => {})}
          onSoloToggle={onSoloToggle || (() => {})}
        />
        
        {expanded && (
          <TrackExpanded
            trackId={track.id}
            pan={track.pan}
            inputMonitor={track.inputMonitor}
            onPanChange={onPanChange || (() => {})}
            onInputMonitorToggle={onInputMonitorToggle || (() => {})}
          />
        )}
      </div>
    </div>
  );
};

export default Track;
