
// Define the interface for the electron object exposed from preload
export interface ElectronAPI {
  // Audio interfaces
  detectAudioInterfaces: () => Promise<AudioDevice[]>;
  initializeAudio: (deviceId: string) => Promise<boolean>;
  startRecording: () => boolean;
  stopRecording: () => Promise<Blob>;
  getInputLevel: () => Promise<number>;
  cleanup: () => void;
  
  // App info and telemetry
  getAppVersion: () => Promise<string>;
  getEnvironment: () => string;
  logTelemetry: (data: Record<string, any>) => Promise<boolean>;
  
  // Update related methods
  checkForUpdates: (options?: { betaId?: string }) => Promise<{success: boolean, error?: string}>;
  setUpdateChannel: (channel: string) => Promise<{success: boolean, error?: string}>;
  onUpdateStatus: (callback: (status: any) => void) => () => void;
  quitAndInstall?: () => void; // Optional as it's only available after an update is downloaded
}

export interface AudioDevice {
  id: string;
  name: string;
  isInput: boolean;
  isOutput: boolean;
  type?: 'input' | 'output'; // Adding type property for compatibility
  isScarlettInterface?: boolean;
}

// Add the electron property to the Window interface
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
