
import { contextBridge, ipcRenderer } from 'electron';
import type { AudioDevice } from './audioDevices';

// Define the audio engine type based on its usage
interface AudioEngine {
  initialize: (deviceId: string) => Promise<boolean>;
  startRecording: () => boolean;
  stopRecording: () => Promise<Blob>;
  getInputLevel: () => Promise<number>;
  cleanup: () => void;
}

// Import in a way that works in both ESM and CommonJS contexts
let audioEngine: AudioEngine;

try {
  // First try dynamic import (ESM style)
  import('./audioEngine').then(module => {
    audioEngine = module.audioEngine;
  }).catch(() => {
    // Fallback to require (CommonJS style)
    const engineModule = require('./audioEngine');
    audioEngine = engineModule.audioEngine;
  });
} catch (e) {
  console.error('Failed to load audioEngine:', e);
  // Create a stub implementation if loading fails
  audioEngine = {
    initialize: async () => false,
    startRecording: () => false,
    stopRecording: async () => new Blob(),
    getInputLevel: async () => 0,
    cleanup: () => {}
  };
}

// Safely expose APIs to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Audio interfaces
  detectAudioInterfaces: () => ipcRenderer.invoke('detect-audio-interfaces') as Promise<AudioDevice[]>,
  
  // Audio engine
  initializeAudio: async (deviceId: string) => {
    return await audioEngine.initialize(deviceId);
  },
  startRecording: () => {
    return audioEngine.startRecording();
  },
  stopRecording: async () => {
    const blob = await audioEngine.stopRecording();
    return blob;
  },
  getInputLevel: async () => {
    return await audioEngine.getInputLevel();
  },
  cleanup: () => {
    audioEngine.cleanup();
  },
  
  // App info and telemetry
  getAppVersion: () => ipcRenderer.invoke('get-app-version') as Promise<string>,
  getEnvironment: () => process.env.NODE_ENV || 'production',
  logTelemetry: (data: Record<string, any>) => ipcRenderer.invoke('log-telemetry', data) as Promise<boolean>,
  
  // Update related methods
  checkForUpdates: (options?: { betaId?: string }) => 
    ipcRenderer.invoke('check-for-updates', options) as Promise<{success: boolean, error?: string}>,
  setUpdateChannel: (channel: string) => 
    ipcRenderer.invoke('set-update-channel', channel) as Promise<{success: boolean, error?: string}>,
  onUpdateStatus: (callback: (status: any) => void) => {
    const listener = (_event: any, status: any) => callback(status);
    ipcRenderer.on('update-status', listener);
    return () => {
      ipcRenderer.removeListener('update-status', listener);
    };
  },
  quitAndInstall: () => {
    ipcRenderer.invoke('quit-and-install');
  }
});

// Define the window interface for TypeScript
declare global {
  interface Window {
    electron: {
      detectAudioInterfaces: () => Promise<AudioDevice[]>;
      initializeAudio: (deviceId: string) => Promise<boolean>;
      startRecording: () => boolean;
      stopRecording: () => Promise<Blob>;
      getInputLevel: () => Promise<number>;
      cleanup: () => void;
      getAppVersion: () => Promise<string>;
      getEnvironment: () => string;
      logTelemetry: (data: Record<string, any>) => Promise<boolean>;
      checkForUpdates: (options?: { betaId?: string }) => Promise<{success: boolean, error?: string}>;
      setUpdateChannel: (channel: string) => Promise<{success: boolean, error?: string}>;
      onUpdateStatus: (callback: (status: any) => void) => () => void;
      quitAndInstall?: () => void;
    };
  }
}
