
import { contextBridge, ipcRenderer } from 'electron';
import type { AudioDevice } from './audioDevices';
import { audioEngine } from './audioEngine';

contextBridge.exposeInMainWorld('electron', {
  detectAudioInterfaces: () => ipcRenderer.invoke('detect-audio-interfaces') as Promise<AudioDevice[]>,
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
  // New functions for app updates and telemetry
  getAppVersion: () => ipcRenderer.invoke('get-app-version') as Promise<string>,
  logTelemetry: (data: Record<string, any>) => ipcRenderer.invoke('log-telemetry', data) as Promise<boolean>
});

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
      logTelemetry: (data: Record<string, any>) => Promise<boolean>;
    };
  }
}
