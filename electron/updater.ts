
import { app, autoUpdater, dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping auto-updater in development mode');
    return;
  }

  try {
    // Configure update server with the custom domain
    const platform = process.platform === 'darwin' ? 
      `darwin-${process.arch}` : 
      `win32-${process.arch}`;
      
    const feedURL = `https://feverstudio.live/fever-update.json`;
    console.log(`Setting up auto-updater for ${platform} with feed URL: ${feedURL}`);
    
    // Check if feed URL is accessible
    console.log(`Auto-updater feed URL: ${feedURL}`);
    
    // Configure autoUpdater with explicit feed URL
    autoUpdater.setFeedURL({ url: feedURL });
    
    // Check for updates every hour
    const updateCheckInterval = 60 * 60 * 1000; // 1 hour
    setInterval(() => {
      console.log('Checking for application updates...');
      autoUpdater.checkForUpdates();
    }, updateCheckInterval);

    // Initial check on startup (after 10 seconds to let app initialize)
    setTimeout(() => {
      console.log('Performing initial update check...');
      autoUpdater.checkForUpdates();
    }, 10000);

    // Update downloaded handler
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
      console.log('Update downloaded:', { releaseName, releaseDate, updateURL });
      
      dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
      }).then((returnValue) => {
        if (returnValue.response === 0) {
          console.log('User chose to install update now');
          autoUpdater.quitAndInstall();
        } else {
          console.log('User chose to install update later');
        }
      });
    });

    // Update available handler
    autoUpdater.on('update-available', () => {
      console.log('Update available, downloading...');
      
      // Notify the user that an update is available
      mainWindow.webContents.send('update-available');
    });

    // Update not available handler
    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    // Error handler with more detailed logging
    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      
      // Log additional details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Only show error dialog in production
      if (process.env.NODE_ENV === 'production') {
        dialog.showErrorBox(
          'Update Error',
          'Failed to check for updates. Please try again later.'
        );
      }
    });

  } catch (error) {
    console.error('Failed to setup auto-updater:', error);
    
    // Log additional details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};
