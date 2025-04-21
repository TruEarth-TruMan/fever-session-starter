
import { useState } from 'react';
import { Track as TrackType, SessionTemplate } from '@/types';
import Track from './Track';
import FXDrawer from './FXDrawer';
import TransportControls from './TransportControls';
import LoopControls from './LoopControls';
import TrackHeader from './track/TrackHeader';
import { useTransportManager } from '@/hooks/useTransportManager';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { useSessionState } from '@/hooks/useSessionState';
import { useSuggestions } from '@/hooks/useSuggestions';

interface TrackViewProps {
  sessionTemplate: SessionTemplate;
  onBack: () => void;
}

const TrackView = ({ sessionTemplate, onBack }: TrackViewProps) => {
  const [sessionName, setSessionName] = useState(sessionTemplate.name);
  const [isEditingSession, setIsEditingSession] = useState(false);
  
  const { updateTrack, updateTrackFX } = useSessionState(sessionTemplate);
  const transport = useTransportManager();
  const trackOps = useTrackOperations(sessionTemplate.tracks);
  
  const { dismissSuggestion } = useSuggestions(
    trackOps.tracks,
    transport.isPlaying,
    transport.isRecording,
    transport.loopEnabled,
    updateTrackFX,
    updateTrack
  );

  const handleSessionNameChange = () => {
    setIsEditingSession(false);
  };

  return (
    <div className="pb-32">
      <div className="container max-w-4xl mx-auto pt-4 px-4">
        <TrackHeader 
          sessionName={sessionName}
          isEditingSession={isEditingSession}
          sessionTemplate={sessionTemplate}
          onBack={onBack}
          onSessionNameChange={handleSessionNameChange}
          setSessionName={setSessionName}
          setIsEditingSession={setIsEditingSession}
        />
        
        <div className="mb-4">
          <LoopControls
            isEnabled={transport.loopEnabled}
            onToggleLoop={transport.handleToggleLoop}
            loopStart={transport.loopStart}
            loopEnd={transport.loopEnd}
            onLoopRangeChange={transport.handleLoopRangeChange}
            totalDuration={transport.totalDuration}
            isOverdubbing={transport.isOverdubbing}
            onToggleOverdub={transport.setIsOverdubbing}
          />
        </div>

        <div className="space-y-4">
          {trackOps.tracks.map((track) => (
            <Track 
              key={track.id}
              track={track}
              onVolumeChange={trackOps.handleVolumeChange}
              onPanChange={trackOps.handlePanChange}
              onMuteToggle={trackOps.handleMuteToggle}
              onSoloToggle={trackOps.handleSoloToggle}
              onInputMonitorToggle={trackOps.handleInputMonitorToggle}
              onFXChange={(trackId, fxId, param, value) => updateTrackFX(trackId, fxId, { param, value })}
              onFXToggle={(trackId, fxId) => updateTrackFX(trackId, fxId, { active: true })}
              onNameChange={trackOps.handleNameChange}
              onFXDrawerOpen={trackOps.handleFXDrawerOpen}
            />
          ))}
        </div>
      </div>
      
      <TransportControls 
        isRecording={transport.isRecording}
        isPlaying={transport.isPlaying}
        onRecord={() => transport.handleRecord(trackOps.tracks, trackOps.setTracks)}
        onPlay={transport.handlePlay}
        onStop={() => transport.handleStop(trackOps.tracks, trackOps.setTracks)}
        onMetronome={() => console.log('Metronome toggled')}
      />

      <FXDrawer
        track={trackOps.selectedTrack}
        open={trackOps.fxDrawerOpen}
        onOpenChange={trackOps.setFxDrawerOpen}
        onFXChange={(trackId, fxId, param, value) => updateTrackFX(trackId, fxId, { param, value })}
        onFXToggle={(trackId, fxId) => updateTrackFX(trackId, fxId, { active: true })}
      />
    </div>
  );
};

export default TrackView;
