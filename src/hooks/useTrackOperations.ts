
import { useState } from 'react';
import { Track as TrackType } from '@/types';

export const useTrackOperations = (initialTracks: TrackType[]) => {
  const [tracks, setTracks] = useState<TrackType[]>(initialTracks);
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [fxDrawerOpen, setFxDrawerOpen] = useState(false);

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
  
  const handleNameChange = (trackId: string, name: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, name } : track
    ));
  };

  const handleFXDrawerOpen = (track: TrackType) => {
    setSelectedTrack(track);
    setFxDrawerOpen(true);
  };

  return {
    tracks,
    setTracks,
    selectedTrack,
    setSelectedTrack,
    fxDrawerOpen,
    setFxDrawerOpen,
    handleVolumeChange,
    handlePanChange,
    handleMuteToggle,
    handleSoloToggle,
    handleInputMonitorToggle,
    handleNameChange,
    handleFXDrawerOpen
  };
};
