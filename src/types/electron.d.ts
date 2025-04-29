
// Type definitions for Electron APIs
// These interfaces help provide TypeScript typings for Electron-only APIs

interface Window {
  electron?: {
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
    getAudioDevices: () => Promise<AudioDeviceInfo[]>;
    onAudioDeviceChange: (callback: (devices: AudioDeviceInfo[]) => void) => (() => void);
    
    // Update related methods
    checkForUpdates: (options?: { betaId?: string }) => Promise<{ success: boolean; error?: string }>;
    setUpdateChannel: (channel: string) => Promise<{ success: boolean; error?: string }>;
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => (() => void);
    quitAndInstall: () => void;
    
    // Telemetry
    logTelemetry: (data: Record<string, any>) => Promise<boolean>;
  };
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

// Audio device info
interface AudioDeviceInfo {
  id: string;
  name: string;
  isInput: boolean;
  isOutput: boolean;
  sampleRates?: number[];
  channelCounts?: number[];
  isDefault?: boolean;
}

// Update status
interface UpdateStatus {
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

// Make TypeScript recognize this as a module
export {};
