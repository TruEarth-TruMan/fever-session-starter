
import { useState } from 'react';
import { Track as TrackType, SessionTemplate } from '@/types';

export const useSessionState = (sessionTemplate: SessionTemplate) => {
  const [sessionName, setSessionName] = useState(sessionTemplate.name);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [tracks, setTracks] = useState<TrackType[]>(sessionTemplate.tracks);

  const handleSessionNameChange = () => {
    setIsEditingSession(false);
  };

  const updateTrack = (trackId: string, updates: Partial<TrackType>) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const updateTrackFX = (trackId: string, fxId: string, updates: { param?: string; value?: number; active?: boolean }) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          fx: track.fx.map(fx => {
            if (fx.id === fxId) {
              if (updates.param && updates.value !== undefined) {
                return {
                  ...fx,
                  params: {
                    ...fx.params,
                    [updates.param]: updates.value
                  }
                };
              }
              if (updates.active !== undefined) {
                return {
                  ...fx,
                  active: updates.active
                };
              }
              return fx;
            }
            return fx;
          })
        };
      }
      return track;
    }));
  };

  return {
    sessionName,
    setSessionName,
    isEditingSession,
    setIsEditingSession,
    tracks,
    setTracks,
    handleSessionNameChange,
    updateTrack,
    updateTrackFX
  };
};
