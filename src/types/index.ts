export type SessionType = 'voice' | 'guitar' | 'podcast' | 'keyboard' | 'band';

export interface SessionTemplate {
  id: string;
  name: string;
  type: SessionType;
  description?: string;
  tracks: Track[];
  iconName?: string;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  fx?: Effect[];
  loop_region?: any;
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
  audio?: AudioData;
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  active: boolean;
  params: Record<string, number>;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
}

export interface AudioData {
  url: string;
  duration: number;
  waveform: number[];
}
