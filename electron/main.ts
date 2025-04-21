
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getAudioDevices } from './audioDevices';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from dev server. In production, load from dist
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Handle audio device detection request from renderer
  ipcMain.handle('detect-audio-interfaces', async () => {
    try {
      const devices = await getAudioDevices();
      return devices;
    } catch (error) {
      console.error('Error detecting audio interfaces:', error);
      return [];
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

