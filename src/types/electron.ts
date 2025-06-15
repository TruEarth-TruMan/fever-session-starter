
export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isInput?: boolean;
  isScarlettInterface?: boolean;
  // New universal interface detection properties
  isProfessionalInterface?: boolean;
  deviceScore?: number;
  deviceBrand?: string;
  deviceCategory?: 'professional' | 'prosumer' | 'consumer' | 'builtin';
  deviceFeatures?: string[];
}

// Update status for app updates
export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  info?: {
    version?: string;
    notes?: string;
    date?: string;
    percent?: number;
    bytesPerSecond?: number;
    total?: number;
    transferred?: number;
  };
  error?: string;
}

// Complete Electron API interface
export interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;
  getEnvironment: () => string;
  getAppPath?: () => string;
  
  // Audio interfaces
  detectAudioInterfaces?: () => Promise<AudioDevice[]>;
  initializeAudio?: (deviceId: string) => Promise<boolean>;
  getInputLevel?: () => Promise<number>;
  
  // Audio recording
  startRecording?: () => boolean;
  stopRecording?: () => Promise<Blob>;
  cleanup?: () => void;
  
  // Update functionality
  checkForUpdates?: (options?: { betaId?: string }) => Promise<{success: boolean, error?: string}>;
  setUpdateChannel?: (channel: string) => Promise<{success: boolean, error?: string}>;
  onUpdateStatus?: (callback: (status: UpdateStatus) => void) => () => void;
  quitAndInstall?: () => void;
  
  // Telemetry
  logTelemetry?: (data: Record<string, any>) => Promise<boolean>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
