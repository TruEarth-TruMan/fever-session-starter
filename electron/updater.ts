
import { app, autoUpdater, dialog, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

// Update check statuses that will be sent to the renderer
export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

// Enhanced logging for update process
function logUpdate(message: string, details?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[UPDATE ${timestamp}] ${message}`;
  
  console.log(logMessage);
  if (details) {
    console.log('Details:', details);
  }
  
  // In production, we could also save logs to a file
  if (process.env.NODE_ENV === 'production') {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, 'update.log');
      fs.appendFileSync(logFile, `${logMessage}\n`);
      if (details) {
        fs.appendFileSync(logFile, `Details: ${JSON.stringify(details)}\n`);
      }
    } catch (err) {
      console.error('Failed to write update log:', err);
    }
  }
}

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    logUpdate('Skipping auto-updater in development mode');
    return;
  }

  try {
    // Configure update server with the custom domain
    const platform = process.platform === 'darwin' ? 
      `darwin-${process.arch}` : 
      `win32-${process.arch}`;
      
    const feedURL = `https://feverstudio.live/fever-update.json`;
    logUpdate(`Setting up auto-updater for ${platform} with feed URL: ${feedURL}`);
    
    // Check if feed URL is accessible
    logUpdate(`Auto-updater feed URL: ${feedURL}`);
    
    // Configure autoUpdater with explicit feed URL
    autoUpdater.setFeedURL({ url: feedURL });
    
    // Setup IPC handlers for update events
    ipcMain.handle('check-for-updates', async () => {
      logUpdate('Manual update check triggered from renderer');
      try {
        autoUpdater.checkForUpdates();
        return { success: true };
      } catch (error) {
        logUpdate('Error checking for updates', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Set update channel from renderer
    ipcMain.handle('set-update-channel', async (event, channel) => {
      logUpdate(`Setting update channel to: ${channel}`);
      try {
        const newFeedUrl = `https://feverstudio.live/fever-update-${channel}.json`;
        autoUpdater.setFeedURL({ url: newFeedUrl });
        return { success: true };
      } catch (error) {
        logUpdate('Error setting update channel', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Check for updates every hour
    const updateCheckInterval = 60 * 60 * 1000; // 1 hour
    setInterval(() => {
      logUpdate('Performing automatic update check');
      autoUpdater.checkForUpdates();
    }, updateCheckInterval);

    // Initial check on startup (after 10 seconds to let app initialize)
    setTimeout(() => {
      logUpdate('Performing initial update check');
      autoUpdater.checkForUpdates();
    }, 10000);

    // Update downloaded handler
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
      logUpdate('Update downloaded', { releaseName, releaseDate, updateURL });
      
      // Notify the renderer process
      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.DOWNLOADED,
        info: {
          version: releaseName,
          notes: releaseNotes,
          date: releaseDate
        }
      });
      
      dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
      }).then((returnValue) => {
        if (returnValue.response === 0) {
          logUpdate('User chose to install update now');
          autoUpdater.quitAndInstall();
        } else {
          logUpdate('User chose to install update later');
        }
      });
    });

    // Update available handler
    autoUpdater.on('update-available', (info) => {
      logUpdate('Update available, downloading...', info);
      
      // Notify the renderer process
      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.AVAILABLE,
        info
      });
    });
    
    // Update downloading handler
    autoUpdater.on('download-progress', (progressInfo) => {
      logUpdate('Download progress', progressInfo);
      
      // Notify the renderer process about download progress
      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.DOWNLOADING,
        info: progressInfo
      });
    });

    // Update not available handler
    autoUpdater.on('update-not-available', (info) => {
      logUpdate('No updates available', info);
      
      // Notify the renderer process
      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.NOT_AVAILABLE,
        info
      });
    });

    // Error handler with more detailed logging
    autoUpdater.on('error', (error) => {
      logUpdate('Auto-updater error:', error);
      
      // Log additional details about the error
      if (error instanceof Error) {
        logUpdate('Error message:', error.message);
        logUpdate('Error stack:', error.stack);
      }
      
      // Notify the renderer process
      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.ERROR,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Only show error dialog in production
      if (process.env.NODE_ENV === 'production') {
        dialog.showErrorBox(
          'Update Error',
          'Failed to check for updates. Please try again later.'
        );
      }
    });

  } catch (error) {
    logUpdate('Failed to setup auto-updater:', error);
    
    // Log additional details about the error
    if (error instanceof Error) {
      logUpdate('Error message:', error.message);
      logUpdate('Error stack:', error.stack);
    }
  }
};
