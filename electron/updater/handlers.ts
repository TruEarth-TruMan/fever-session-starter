
import { autoUpdater, dialog } from 'electron';
import { UpdateStatus, UpdaterDependencies } from './types';
import { logUpdate } from './logger';
import semver from 'semver';
import { app } from 'electron';

/**
 * Set up event handlers for the auto updater
 */
export function setupUpdateEventHandlers({ mainWindow }: UpdaterDependencies): void {
  // Update downloaded handler
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    logUpdate('Update downloaded', { releaseName, releaseDate, updateURL });
    
    // Extract version from release name if possible
    const versionMatch = releaseName?.match(/\d+\.\d+\.\d+/);
    const version = versionMatch ? versionMatch[0] : releaseName;
    
    // Compare with current version to provide helpful message
    let versionMessage = `New version ${version} is ready to install`;
    
    try {
      const currentVersion = app.getVersion();
      if (currentVersion && semver.valid(currentVersion) && version && semver.valid(version)) {
        const diff = semver.diff(currentVersion, version);
        if (diff === 'major') {
          versionMessage = `Major update ${version} with new features is ready`;
        } else if (diff === 'minor') {
          versionMessage = `Feature update ${version} is ready to install`;
        } else {
          versionMessage = `Bug fix update ${version} is ready to install`;
        }
      }
    } catch (error) {
      logUpdate('Error parsing version info:', error);
    }
    
    // Notify the renderer process
    mainWindow.webContents.send('update-status', {
      status: UpdateStatus.DOWNLOADED,
      info: {
        version: version || releaseName,
        notes: releaseNotes,
        date: releaseDate
      }
    });
    
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: versionMessage,
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
}
