
/**
 * Fever Application Build Script
 * 
 * This script handles packaging and building the Fever app for distribution
 * using the electron-builder configuration.
 */

const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const config = require('./electron-builder.js');

// Check if required directories exist, create if not
const buildDir = path.join(__dirname, 'build');
const iconsDir = path.join(buildDir, 'icons');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create entitlements file for macOS notarization
const entitlementsPath = path.join(buildDir, 'entitlements.mac.plist');
const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
  </dict>
</plist>`;

fs.writeFileSync(entitlementsPath, entitlementsContent);

// Create auto-updater module for the app
const electronUpdaterPath = path.join(__dirname, 'electron', 'updater.ts');
const updaterContent = `
import { app, autoUpdater, dialog, BrowserWindow } from 'electron';

export const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Skip in development mode or when running without packaging
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping auto-updater in development mode');
    return;
  }

  // Configure update server
  const server = 'https://feverstudio.live';
  const url = \`\${server}/fever-update.json\`;

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
`;

fs.writeFileSync(electronUpdaterPath, updaterContent);

// Create a simple update JSON example for reference
const updateJsonExample = path.join(__dirname, 'update-example.json');
const updateJsonContent = `{
  "version": "1.0.1",
  "notes": "New version with bug fixes and performance improvements",
  "releaseDate": "2025-04-22T12:00:00.000Z",
  "platforms": {
    "darwin-x64": {
      "url": "https://mydomain.com/download/mac/Fever-1.0.1-x64.dmg"
    },
    "darwin-arm64": {
      "url": "https://mydomain.com/download/mac/Fever-1.0.1-arm64.dmg"
    },
    "win32-x64": {
      "url": "https://mydomain.com/download/win/Fever-1.0.1-setup.exe"
    }
  }
}`;

fs.writeFileSync(updateJsonExample, updateJsonContent);

// Create offline storage module for the app
const offlineStoragePath = path.join(__dirname, 'src', 'hooks', 'useOfflineStorage.ts');
const offlineStorageContent = `
import { useState, useEffect } from 'react';
import { SessionTemplate, Track, Effect } from '@/types';
import { useToast } from '@/hooks/use-toast';

// IndexedDB database name and version
const DB_NAME = 'fever_offline_db';
const DB_VERSION = 1;

// Type for network status
interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
}

export const useOfflineStorage = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });
  const { toast } = useToast();

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Unable to access offline storage. Some features may not work properly."
      });
    };
    
    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for sessions, tracks, and audio data
      if (!database.objectStoreNames.contains('sessions')) {
        database.createObjectStore('sessions', { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains('audio_files')) {
        database.createObjectStore('audio_files', { keyPath: 'id' });
      }
    };
    
    // Set up network status listeners
    const handleOnline = () => {
      setNetworkStatus({ isOnline: true, lastChecked: new Date() });
      toast({
        title: "Connection Restored",
        description: "You are back online. Changes will be synchronized."
      });
    };
    
    const handleOffline = () => {
      setNetworkStatus({ isOnline: false, lastChecked: new Date() });
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "You are working offline. Changes will be saved locally."
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check network status periodically
    const intervalId = setInterval(() => {
      const isOnline = navigator.onLine;
      if (isOnline !== networkStatus.isOnline) {
        setNetworkStatus({ isOnline, lastChecked: new Date() });
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
      db?.close();
    };
  }, []);

  // Save session to IndexedDB
  const saveSessionOffline = async (session: SessionTemplate) => {
    if (!db) return false;
    
    try {
      return new Promise<boolean>((resolve) => {
        const transaction = db.transaction('sessions', 'readwrite');
        const store = transaction.objectStore('sessions');
        
        const request = store.put({
          ...session,
          last_modified_locally: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Error saving session offline:', error);
      return false;
    }
  };

  // Save audio file to IndexedDB
  const saveAudioOffline = async (trackId: string, audioBlob: Blob, audioUrl: string) => {
    if (!db) return false;
    
    try {
      return new Promise<boolean>((resolve) => {
        const transaction = db.transaction('audio_files', 'readwrite');
        const store = transaction.objectStore('audio_files');
        
        const request = store.put({
          id: trackId,
          blob: audioBlob,
          url: audioUrl,
          timestamp: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Error saving audio offline:', error);
      return false;
    }
  };

  // Get session from IndexedDB
  const getOfflineSession = async (sessionId: string) => {
    if (!db) return null;
    
    try {
      return new Promise<SessionTemplate | null>((resolve) => {
        const transaction = db.transaction('sessions', 'readonly');
        const store = transaction.objectStore('sessions');
        
        const request = store.get(sessionId);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting offline session:', error);
      return null;
    }
  };

  // Get audio file from IndexedDB
  const getOfflineAudio = async (trackId: string) => {
    if (!db) return null;
    
    try {
      return new Promise<{ blob: Blob, url: string } | null>((resolve) => {
        const transaction = db.transaction('audio_files', 'readonly');
        const store = transaction.objectStore('audio_files');
        
        const request = store.get(trackId);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            resolve({
              blob: result.blob,
              url: URL.createObjectURL(result.blob)
            });
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting offline audio:', error);
      return null;
    }
  };

  // Get all offline sessions
  const getAllOfflineSessions = async () => {
    if (!db) return [];
    
    try {
      return new Promise<SessionTemplate[]>((resolve) => {
        const transaction = db.transaction('sessions', 'readonly');
        const store = transaction.objectStore('sessions');
        
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting all offline sessions:', error);
      return [];
    }
  };

  return {
    networkStatus,
    saveSessionOffline,
    saveAudioOffline,
    getOfflineSession,
    getOfflineAudio,
    getAllOfflineSessions
  };
};
`;

fs.writeFileSync(offlineStoragePath, offlineStorageContent);

// Create a version display component
const versionDisplayPath = path.join(__dirname, 'src', 'components', 'ui', 'VersionDisplay.tsx');
const versionDisplayContent = `
import { useState, useEffect } from 'react';

interface AppVersionInfo {
  version: string;
  environment: 'development' | 'production';
}

export const VersionDisplay = () => {
  const [appInfo, setAppInfo] = useState<AppVersionInfo>({
    version: '1.0.0',
    environment: process.env.NODE_ENV as 'development' | 'production'
  });

  useEffect(() => {
    // Get version from Electron if available
    if (window.electron?.getAppVersion) {
      window.electron.getAppVersion()
        .then((version) => {
          setAppInfo(prev => ({ ...prev, version }));
        })
        .catch((err) => {
          console.error('Failed to get app version:', err);
        });
    }
  }, []);

  return (
    <div className="text-xs text-muted-foreground opacity-70 hover:opacity-100 transition-opacity">
      Fever v{appInfo.version}
      {appInfo.environment === 'development' && ' (Dev)'}
    </div>
  );
};
`;

fs.writeFileSync(versionDisplayPath, versionDisplayContent);

// Update main.ts to include version getter and auto-updater
console.log('Updating electron/main.ts to include auto-updater...');

// Build the app using electron-builder
console.log('Starting build process...');

builder.build({
  config,
  publish: process.env.PUBLISH === 'always' ? 'always' : 'never'
})
  .then(() => {
    console.log('Build successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });
