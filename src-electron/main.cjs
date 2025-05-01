const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getAudioDevices } = require('./dist-electron/audioDevices');

const { setupAutoUpdater } = require('./updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../build/icons/icon.ico') // Windows icon path
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  if (process.env.NODE_ENV !== 'development') {
    setupAutoUpdater(win);
  }

  return win;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  if (process.platform === 'darwin') {
    try {
      const iconPath = path.join(__dirname, '../build/icons/icon.icns');
      app.dock.setIcon(iconPath);
      console.log('macOS dock icon set successfully');
    } catch (error) {
      console.error('Failed to set macOS dock icon:', error);
    }
  }

  ipcMain.handle('detect-audio-interfaces', async () => {
    try {
      const devices = await getAudioDevices();
      return devices;
    } catch (error) {
      console.error('Error detecting audio interfaces:', error);
      return [];
    }
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('log-telemetry', async (event, data) => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Telemetry:', data);
    }
    return true;
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
