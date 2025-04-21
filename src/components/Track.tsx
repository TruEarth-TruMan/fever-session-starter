
import { useState } from 'react';
import { Track as TrackType } from '@/types';
import TrackHeader from './track/TrackHeader';
import TrackControls from './track/TrackControls';
import TrackExpanded from './track/TrackExpanded';
import TrackVisualizations from './visualizations/TrackVisualizations';
import { useTrackPlayback } from '@/hooks/useTrackPlayback';

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
  const { isPlaying, handlePlayback } = useTrackPlayback(audioUrl);
  
  const handleFXClick = () => {
    if (onFXDrawerOpen) {
      onFXDrawerOpen(track);
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
        
        <TrackVisualizations 
          track={track}
          onPlayClick={handlePlayback}
        />
        
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
