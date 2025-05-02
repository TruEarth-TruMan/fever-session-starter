
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Disable sandbox for better Windows compatibility
    },
    // Use a standard Windows frame in case exotic frames cause issues
    frame: true,
    // Ensure compatibility with Windows display scaling
    autoHideMenuBar: false,
    show: false, // Don't show until ready-to-show
  });

  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  console.log(`Loading app from: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle Squirrel events for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.fever.audioapp');
}

app.whenReady().then(() => {
  createWindow();
  
  // Check if running on Windows and log platform details
  if (process.platform === 'win32') {
    console.log(`Running on Windows: ${process.arch}`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
