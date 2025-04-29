
import { ipcMain, autoUpdater, BrowserWindow } from 'electron';
import { UpdateConfig, UpdaterDependencies } from './types';
import { logUpdate } from './logger';

// Default update configuration
let currentConfig: UpdateConfig = {
  channel: 'latest',
  feedUrl: 'https://feverstudio.live/update/latest',
};

/**
 * Set up IPC handlers for update-related events
 */
export function setupUpdateIpcHandlers({ mainWindow }: UpdaterDependencies): void {
  // Setup IPC handlers for update events
  ipcMain.handle('check-for-updates', async (event, options?: { betaId?: string }) => {
    logUpdate('Manual update check triggered from renderer', options);
    try {
      // If a beta ID is provided, include it in the update check
      if (options?.betaId) {
        currentConfig.betaId = options.betaId;
        
        // Add beta ID as query parameter to feed URL
        const betaFeedUrl = `${currentConfig.feedUrl}?betaId=${options.betaId}`;
        logUpdate(`Setting beta feed URL: ${betaFeedUrl}`);
        autoUpdater.setFeedURL({ url: betaFeedUrl });
      }
      
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
      // Set proper feed URL based on channel
      let feedUrl: string;
      
      switch (channel) {
        case 'beta':
          feedUrl = `https://feverstudio.live/update/beta`;
          break;
        case 'dev':
          feedUrl = `https://feverstudio.live/update/dev`;
          break;
        case 'latest':
        default:
          feedUrl = `https://feverstudio.live/update/latest`;
          break;
      }
      
      // Store current configuration
      currentConfig = {
        channel,
        feedUrl,
        betaId: currentConfig.betaId
      };
      
      // Include beta ID if available
      if (currentConfig.betaId) {
        feedUrl += `?betaId=${currentConfig.betaId}`;
      }
      
      logUpdate(`New feed URL: ${feedUrl}`);
      autoUpdater.setFeedURL({ url: feedUrl });
      return { success: true };
    } catch (error) {
      logUpdate('Error setting update channel', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  
  // Handle quit and install command from renderer
  ipcMain.handle('quit-and-install', () => {
    logUpdate('Quitting and installing update');
    autoUpdater.quitAndInstall(true, true);
  });
}

/**
 * Get the current update configuration
 */
export function getCurrentConfig(): UpdateConfig {
  return { ...currentConfig };
}
