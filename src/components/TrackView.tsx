import { useState, useEffect } from 'react';
import { Track as TrackType, SessionTemplate } from '@/types';
import Track from './Track';
import FXDrawer from './FXDrawer';
import TransportControls from './TransportControls';
import LoopControls from './LoopControls';
import SessionHeader from './SessionHeader';
import { useTransportManager } from '@/hooks/useTransportManager';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { useSessionState } from '@/hooks/useSessionState';
import { useSuggestions } from '@/hooks/useSuggestions';
import { AlertProvider, useAlerts } from '@/providers/AlertProvider';
import AlertBanner from '@/components/ui/AlertBanner';
import { useExportState } from '@/hooks/useExportState';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AudioDeviceConfig from './AudioDeviceConfig';
import { Settings } from 'lucide-react';
import { useHeatMizerTips } from '@/hooks/useHeatMizerTips';

interface TrackViewProps {
  sessionTemplate: SessionTemplate;
  onBack: () => void;
}

const TrackViewContent = ({ sessionTemplate, onBack }: TrackViewProps) => {
  const [sessionName, setSessionName] = useState(sessionTemplate.name);
  const [isEditingSession, setIsEditingSession] = useState(false);
  
  const { updateTrack, updateTrackFX } = useSessionState(sessionTemplate);
  const transport = useTransportManager();
  const trackOps = useTrackOperations(sessionTemplate.tracks);
  const { alerts, addAlert } = useAlerts();
  
  const exportState = useExportState();
  
  const { dismissSuggestion } = useSuggestions(
    trackOps.tracks,
    transport.isPlaying,
    transport.isRecording,
    transport.loopEnabled,
    updateTrackFX,
    updateTrack
  );

  useEffect(() => {
    const handleDeviceChange = () => {
      addAlert(
        'warning', 
        'Audio Device Changed', 
        'Your audio device configuration has changed. This may affect recording quality.',
        8000
      );
    };
    
    const timer = setTimeout(() => {
      handleDeviceChange();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [addAlert]);

  useHeatMizerTips(trackOps.tracks);

  const handleSessionNameChange = () => {
    setIsEditingSession(false);
  };

  useEffect(() => {
    if (!sessionName || sessionName === sessionTemplate.name) {
      const today = new Date();
      const formattedDate = `${today.toLocaleString('default', { month: 'short' })} ${today.getDate()}`;
      
      const autoName = `${sessionTemplate.type.charAt(0).toUpperCase() + sessionTemplate.type.slice(1)} Session – ${formattedDate}`;
      setSessionName(autoName);
    }
  }, [sessionName, sessionTemplate.name, sessionTemplate.type]);

  return (
    <div className="pb-32">
      <div className="container max-w-4xl mx-auto pt-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <SessionHeader
            sessionName={sessionName}
            setSessionName={setSessionName}
            isEditingSession={isEditingSession}
            setIsEditingSession={setIsEditingSession}
            handleSessionNameChange={handleSessionNameChange}
            onBack={onBack}
            exportProps={{
              exportFormat: exportState.exportFormat,
              setExportFormat: exportState.setExportFormat,
              exportQuality: exportState.exportQuality,
              setExportQuality: exportState.setExportQuality,
              exportRange: exportState.exportRange,
              setExportRange: exportState.setExportRange,
              exportName: exportState.exportName,
              setExportName: exportState.setExportName,
              isExporting: exportState.isExporting,
              handleExport: exportState.handleExport,
              getExportPreset: exportState.getExportPreset
            }}
          />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Audio Settings</SheetTitle>
              </SheetHeader>
              <AudioDeviceConfig />
            </SheetContent>
          </Sheet>
        </div>

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
        onSkipBackward={transport.handleSkipBackward}
        onSkipForward={transport.handleSkipForward}
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

const TrackView = (props: TrackViewProps) => {
  return (
    <AlertProvider>
      <TrackViewContent {...props} />
    </AlertProvider>
  );
};

export default TrackView;
