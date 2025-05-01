import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: async () => ipcRenderer.invoke('get-app-version'),
});
