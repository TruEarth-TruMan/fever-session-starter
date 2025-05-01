import { app, autoUpdater, dialog, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import semver from 'semver';

export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

function logUpdate(message: string, details?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[UPDATE ${timestamp}] ${message}`;

  console.log(logMessage);
  if (details) {
    console.log('Details:', details);
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
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

interface UpdateConfig {
  channel: string;
  feedUrl: string;
  betaId?: string;
}

let currentConfig: UpdateConfig = {
  channel: 'latest',
  feedUrl: 'https://feverstudio.live/update/latest'
};

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  if (process.env.NODE_ENV === 'development') {
    logUpdate('Skipping auto-updater in development mode');
    return;
  }

  try {
    const platform = process.platform === 'darwin'
      ? `darwin-${process.arch}`
      : `win32-${process.arch}`;

    const feedURL = currentConfig.feedUrl;
    logUpdate(`Setting up auto-updater for ${platform} with feed URL: ${feedURL}`);
    autoUpdater.setFeedURL({ url: feedURL });

    ipcMain.handle('check-for-updates', async (event, options?: { betaId?: string }) => {
      logUpdate('Manual update check triggered from renderer', options);
      try {
        if (options?.betaId) {
          currentConfig.betaId = options.betaId;
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

    ipcMain.handle('set-update-channel', async (_event, channel) => {
      logUpdate(`Setting update channel to: ${channel}`);
      try {
        let feedUrl = `https://feverstudio.live/update/${channel}`;
        currentConfig.channel = channel;
        currentConfig.feedUrl = feedUrl;

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

    setInterval(() => {
      logUpdate('Performing automatic update check');
      autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000);

    setTimeout(() => {
      logUpdate('Performing initial update check');
      autoUpdater.checkForUpdates();
    }, 10000);

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
      logUpdate('Update downloaded', { releaseName, releaseDate, updateURL });

      const versionMatch = releaseName?.match(/\d+\.\d+\.\d+/);
      const version = versionMatch ? versionMatch[0] : releaseName;
      let versionMessage = `New version ${version} is ready to install`;

      try {
        const currentVersion = app.getVersion();
        if (semver.valid(currentVersion) && semver.valid(version)) {
          const diff = semver.diff(currentVersion, version);
          if (diff === 'major') versionMessage = `Major update ${version} with new features is ready`;
          else if (diff === 'minor') versionMessage = `Feature update ${version} is ready to install`;
          else versionMessage = `Bug fix update ${version} is ready to install`;
        }
      } catch (err) {
        logUpdate('Error parsing version info:', err);
      }

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
      }).then((res) => {
        if (res.response === 0) {
          logUpdate('User chose to install update now');
          autoUpdater.quitAndInstall();
        } else {
          logUpdate('User chose to install update later');
        }
      });
    });

    autoUpdater.on('update-available', (info) => {
      logUpdate('Update available, downloading...', info);
      mainWindow.webContents.send('update-status', { status: UpdateStatus.AVAILABLE, info });
    });

    autoUpdater.on('download-progress', (progressInfo) => {
      logUpdate('Download progress', progressInfo);
      mainWindow.webContents.send('update-status', { status: UpdateStatus.DOWNLOADING, info: progressInfo });
    });

    autoUpdater.on('update-not-available', (info) => {
      logUpdate('No updates available', info);
      mainWindow.webContents.send('update-status', { status: UpdateStatus.NOT_AVAILABLE, info });
    });

    autoUpdater.on('error', (error) => {
      logUpdate('Auto-updater error:', error);
      if (error instanceof Error) {
        logUpdate('Error message:', error.message);
        logUpdate('Error stack:', error.stack);
      }

      mainWindow.webContents.send('update-status', {
        status: UpdateStatus.ERROR,
        error: error instanceof Error ? error.message : String(error)
      });

      if (process.env.NODE_ENV === 'production') {
        dialog.showErrorBox('Update Error', 'Failed to check for updates. Please try again later.');
      }
    });

  } catch (error) {
    logUpdate('Failed to setup auto-updater:', error);
    if (error instanceof Error) {
      logUpdate('Error message:', error.message);
      logUpdate('Error stack:', error.stack);
    }
  }
};
