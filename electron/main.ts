
import { app, BrowserWindow, ipcMain, autoUpdater } from 'electron';
import path from 'path';
import fs from 'fs';
import { getAudioDevices } from './audioDevices';
import { setupAutoUpdater } from './updater';

// Define a function to get the correct path to resources based on environment
function getResourcePath() {
  // In development, resources are in the project root
  // In production, resources are in the app.getAppPath() directory
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? process.cwd() : app.getAppPath();
}

// Function to ensure that the preload script path is correctly resolved
function getPreloadPath() {
  // First, log the directory paths for debugging
  console.log(`__dirname: ${__dirname}`);
  console.log(`App path: ${app.getAppPath()}`);
  
  // Check multiple potential paths for the preload script
  const possiblePaths = [
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, '..', 'dist-electron', 'preload.js'),
    path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
    path.join(process.resourcesPath as string, 'app', 'dist-electron', 'preload.js'),
    path.join(process.resourcesPath as string, 'dist-electron', 'preload.js')
  ];
  
  console.log('Searching for preload.js in these locations:');
  possiblePaths.forEach(p => {
    const exists = fs.existsSync(p);
    console.log(` - ${p} (${exists ? 'EXISTS' : 'NOT FOUND'})`);
    if (exists) {
      return p;
    }
  });
  
  // Return the first path that exists, or fallback to the standard one
  const existingPath = possiblePaths.find(p => fs.existsSync(p));
  if (existingPath) {
    console.log(`Using preload path: ${existingPath}`);
    return existingPath;
  }
  
  console.log(`Falling back to default preload path: ${path.join(__dirname, 'preload.js')}`);
  return path.join(__dirname, 'preload.js');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      preload: getPreloadPath()
    },
    icon: path.join(getResourcePath(), 'build', 'icons', process.platform === 'win32' ? 'icon.ico' : 'icon.png')
  });

  // Determine correct path to load based on environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode - loading from dev server');
    win.loadURL('http://localhost:8080');
    // Open DevTools automatically in development mode
    win.webContents.openDevTools();
  } else {
    console.log('Running in production mode - loading from dist directory');
    try {
      // Try multiple potential paths to find index.html
      const possiblePaths = [
        path.join(app.getAppPath(), 'dist', 'index.html'),
        path.join(__dirname, '..', 'dist', 'index.html'),
        path.join(__dirname, '..', '..', 'dist', 'index.html'),
        path.join(process.resourcesPath as string, 'dist', 'index.html'),
        path.join(process.resourcesPath as string, 'app', 'dist', 'index.html')
      ];
      
      console.log('Searching for index.html in these locations:');
      possiblePaths.forEach(p => console.log(` - ${p} (${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'})`));
      
      // Try to find index.html in any of the possible locations
      let loaded = false;
      for (const indexPath of possiblePaths) {
        if (fs.existsSync(indexPath)) {
          console.log(`Found index.html at: ${indexPath}`);
          win.loadFile(indexPath);
          loaded = true;
          break;
        }
      }
      
      // If index.html wasn't found anywhere, load error page
      if (!loaded) {
        console.error('Could not find index.html in any location, loading error page');
        win.loadFile(path.join(__dirname, 'error.html'));
      }
    } catch (err) {
      console.error('Error loading index.html:', err);
      win.loadFile(path.join(__dirname, 'error.html'));
    }
  }

  // Set up auto-updater in production mode
  if (process.env.NODE_ENV !== 'development') {
    setupAutoUpdater(win);
  }
  
  return win;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();
  
  // Set macOS dock icon if platform is macOS
  if (process.platform === 'darwin') {
    try {
      const iconPath = path.join(getResourcePath(), 'build', 'icons', 'icon.icns');
      if (app.dock) {
        app.dock.setIcon(iconPath);
        console.log('macOS dock icon set successfully');
      }
    } catch (error) {
      console.error('Failed to set macOS dock icon:', error);
    }
  }

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

  // Handle app version request from renderer
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Handle error telemetry if enabled
  ipcMain.handle('log-telemetry', async (event, data) => {
    // This would connect to your telemetry service
    // For now, just log to console in production
    if (process.env.NODE_ENV !== 'development') {
      console.log('Telemetry:', data);
    }
    return true;
  });
  
  // Handle quit and install command from renderer
  ipcMain.handle('quit-and-install', () => {
    console.log('Quitting and installing update');
    autoUpdater.quitAndInstall(true, true);
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

// Create a basic error.html file in case the app can't find the index.html
try {
  const errorHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error Loading Fever</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #e53935; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error Loading Application</h1>
    <p>The application could not load the main interface. This might be due to a packaging issue.</p>
    <p>Please try restarting the application or reinstalling it.</p>
    <h2>Technical Details</h2>
    <pre id="technical"></pre>
    <script>
      document.getElementById('technical').textContent = 
        'App Path: ' + (window.electron?.getAppPath?.() || 'Unknown') + 
        '\\nFile Path: ' + window.location.href;
    </script>
  </div>
</body>
</html>`;

  const errorHtmlPath = path.join(__dirname, 'error.html');
  fs.writeFileSync(errorHtmlPath, errorHtmlContent);
  console.log(`Created error.html at ${errorHtmlPath}`);
} catch (err) {
  console.error('Failed to create error.html:', err);
}
