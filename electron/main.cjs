const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Use full resolved path — avoids "Cannot find module" in production
const { getAudioDevices } = require(path.join(__dirname, 'dist-electron', 'audioDevices.cjs'));
const { setupAutoUpdater } = require(path.join(__dirname, 'dist-electron', 'updater.cjs'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'build', 'icons', 'icon.ico'),
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  if (!isDev) {
    setupAutoUpdater(win);
  }

  return win;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  if (process.platform === 'darwin') {
    try {
      const iconPath = path.join(__dirname, 'build', 'icons', 'icon.icns');
      app.dock.setIcon(iconPath);
    } catch (err) {
      console.error('Failed to set macOS dock icon:', err);
    }
  }

  ipcMain.handle('detect-audio-interfaces', async () => {
    try {
      return await getAudioDevices();
    } catch (err) {
      console.error('Audio detection error:', err);
      return [];
    }
  });

  ipcMain.handle('get-app-version', () => app.getVersion());

  ipcMain.handle('log-telemetry', async (_event, data) => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Telemetry:', data);
    }
    return true;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
