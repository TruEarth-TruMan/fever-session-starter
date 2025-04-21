
export type SessionType = 'voice' | 'guitar' | 'podcast' | 'keyboard' | 'band';

export interface SessionTemplate {
  id: string;
  name: string;
  type: SessionType;
  description: string;
  tracks: Track[];
  iconName: string;
}

export interface Track {
  id: string;
  name: string;
  type: string;
  color: string;
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;
  inputMonitor: boolean;
  fx: Effect[];
  waveform?: number[];
  isRecording?: boolean;
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  active: boolean;
  params: Record<string, number>;
}
