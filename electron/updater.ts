
import { app, autoUpdater, dialog, BrowserWindow } from 'electron';

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping auto-updater in development mode');
    return;
  }

  // Configure update server with the custom domain
  const platform = process.platform === 'darwin' ? 
    `darwin-${process.arch}` : 
    `win32-${process.arch}`;
    
  const feedURL = `https://feverstudio.live/fever-update.json`;
  
  try {
    autoUpdater.setFeedURL({ url: feedURL });
    console.log(`Auto-updater configured with feed URL: ${feedURL}`);
    
    // Check for updates every hour
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000);

    // Initial check on startup (after 10 seconds to let app initialize)
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 10000);

    // Update downloaded handler
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
      }).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    });

    // Error handler
    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      dialog.showErrorBox(
        'Error: ',
        'Failed to check for updates. Please try again later.'
      );
    });

  } catch (error) {
    console.error('Failed to setup auto-updater:', error);
  }
};
