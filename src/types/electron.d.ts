
export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isScarlettInterface: boolean;
}

// Define the interface for Electron's contextBridge API
export interface ElectronAPI {
  // Audio interfaces
  detectAudioInterfaces: () => Promise<AudioDevice[]>;
  
  // Audio engine
  initializeAudio: (deviceId: string) => Promise<boolean>;
  startRecording: () => boolean;
  stopRecording: () => Promise<Blob>;
  getInputLevel: () => Promise<number>;
  cleanup: () => void;
  
  // App info and telemetry
  getAppVersion: () => Promise<string>;
  logTelemetry: (data: Record<string, any>) => Promise<boolean>;
}

// Extend the Window interface
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
