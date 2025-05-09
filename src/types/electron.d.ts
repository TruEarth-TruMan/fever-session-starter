
// Type definitions for Electron APIs
// These interfaces help provide TypeScript typings for Electron-only APIs

// Audio device info
export interface AudioDevice {
  id: string;
  name: string;
  isInput: boolean;
  isOutput: boolean;
  sampleRates?: number[];
  channelCounts?: number[];
  isDefault?: boolean;
}

// Export API interface for use in other files
export interface ElectronAPI {
  // Main functionality
  getAppVersion: () => Promise<string>;
  getEnvironment: () => string;
  
  // Window management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // OS integrations
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (path: string) => Promise<void>;
  
  // Dialog APIs
  showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
  showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>;
  
  // File system operations
  readFile: (path: string, encoding?: string) => Promise<string>;
  writeFile: (path: string, contents: string) => Promise<void>;
  
  // App paths
  getPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos') => Promise<string>;
  
  // App events
  onAppEvent: (callback: (event: AppEvent) => void) => (() => void); 
  
  // Audio device management
  getAudioDevices: () => Promise<AudioDevice[]>;
  detectAudioInterfaces: () => Promise<AudioDevice[]>;
  initializeAudio: (deviceId: string) => Promise<boolean>;
  onAudioDeviceChange: (callback: (devices: AudioDevice[]) => void) => (() => void);
  
  // Audio recording
  startRecording: () => boolean;
  stopRecording: () => Promise<Blob>;
  getInputLevel: () => Promise<number>;
  cleanup: () => void;
  
  // Update related methods
  checkForUpdates: (options?: { betaId?: string }) => Promise<{ success: boolean; error?: string }>;
  setUpdateChannel: (channel: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => (() => void);
  quitAndInstall: () => void;
  
  // Telemetry
  logTelemetry: (data: Record<string, any>) => Promise<boolean>;
}

// Open dialog options
interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >;
  message?: string;
}

interface FileFilter {
  name: string;
  extensions: string[];
}

interface OpenDialogReturnValue {
  canceled: boolean;
  filePaths: string[];
}

// Save dialog options
interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  message?: string;
  nameFieldLabel?: string;
  showsTagField?: boolean;
}

interface SaveDialogReturnValue {
  canceled: boolean;
  filePath?: string;
}

// App events
interface AppEvent {
  type: 'focus' | 'blur' | 'before-quit';
}

// Update status
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

// Augment the Window interface to include our electron property
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
