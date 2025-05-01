"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAutoUpdater = void 0;
const electron_1 = require("electron");
const setupAutoUpdater = (mainWindow) => {
    // Skip in development mode or when running without packaging
    if (process.env.NODE_ENV === 'development') {
        console.log('Skipping auto-updater in development mode');
        return;
    }
    // Configure update server
    const server = 'https://mydomain.com';
    const url = `${server}/fever-update.json`;
    // Configure the auto-updater
    electron_1.autoUpdater.setFeedURL({ url });
    // Check for updates periodically (every hour)
    setInterval(() => {
        electron_1.autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000);
    // Initial check on startup (after 10 seconds)
    setTimeout(() => {
        electron_1.autoUpdater.checkForUpdates();
    }, 10000);
    // Handle update events
    electron_1.autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
        const dialogOptions = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes ?? 'A new update is ready.' : releaseName ?? 'A new update is ready.',
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        };
        electron_1.dialog.showMessageBox(dialogOptions).then((returnValue) => {
            if (returnValue.response === 0) {
                electron_1.autoUpdater.quitAndInstall();
            }
        });
    });
    // Handle errors
    electron_1.autoUpdater.on('error', (error) => {
        console.error('Auto-updater error:', error);
    });
};
exports.setupAutoUpdater = setupAutoUpdater;
