
import { BrowserWindow, autoUpdater } from 'electron';
import { logUpdate } from './logger';
import { setupUpdateEventHandlers } from './handlers';
import { setupUpdateIpcHandlers } from './ipcHandlers';
import { UpdaterDependencies } from './types';

/**
 * Configure and initialize the auto-updater for the application
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    logUpdate('Skipping auto-updater in development mode');
    return;
  }

  try {
    const dependencies: UpdaterDependencies = { mainWindow };

    // Configure update server with the custom domain
    const platform = process.platform === 'darwin' ? 
      `darwin-${process.arch}` : 
      `win32-${process.arch}`;
      
    const feedURL = `https://feverstudio.live/update/latest`;
    logUpdate(`Setting up auto-updater for ${platform} with feed URL: ${feedURL}`);
    
    // Configure autoUpdater with explicit feed URL
    autoUpdater.setFeedURL({ url: feedURL });

    // Set up event handlers
    setupUpdateEventHandlers(dependencies);
    
    // Set up IPC handlers
    setupUpdateIpcHandlers(dependencies);

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

  } catch (error) {
    logUpdate('Failed to setup auto-updater:', error);
    
    // Log additional details about the error
    if (error instanceof Error) {
      logUpdate('Error message:', error.message);
      logUpdate('Error stack:', error.stack);
    }
  }
}

// Re-export types for external use
export * from './types';
