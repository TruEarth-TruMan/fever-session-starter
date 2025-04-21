
import { contextBridge, ipcRenderer } from 'electron';
import type { AudioDevice } from './audioDevices';

contextBridge.exposeInMainWorld('electron', {
  detectAudioInterfaces: () => ipcRenderer.invoke('detect-audio-interfaces') as Promise<AudioDevice[]>
});

