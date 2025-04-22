
import { app, autoUpdater, dialog, BrowserWindow } from 'electron';

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping auto-updater in development mode');
    return;
  }

  // Configure update server with the new custom domain
  const server = 'https://feverstudio.live';
  const url = `${server}/fever-update.json`;

  // Configure the auto-updater
  autoUpdater.setFeedURL({ url });

  // Check for updates periodically (every hour)
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60 * 60 * 1000);

  // Initial check on startup (after 10 seconds)
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 10000);

  // Handle update events
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOptions = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    
    dialog.showMessageBox(dialogOptions).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Handle errors
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
  });
};
