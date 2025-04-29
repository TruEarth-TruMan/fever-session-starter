
/**
 * Update configuration utility
 * Manages update server URLs and configuration across different environments
 */
import { isElectron } from './environment';

export interface UpdateConfig {
  serverUrl: string;
  channel: string;
  checkAutomatically: boolean;
  checkIntervalMinutes: number;
}

// Environment-specific update configurations
const updateConfigs = {
  development: {
    serverUrl: 'http://localhost:3000/update',
    channel: 'dev',
    checkAutomatically: true,
    checkIntervalMinutes: 5
  },
  staging: {
    serverUrl: 'https://staging.feverstudio.live/update',
    channel: 'beta',
    checkAutomatically: true,
    checkIntervalMinutes: 60
  },
  production: {
    serverUrl: 'https://feverstudio.live/update',
    channel: 'latest',
    checkAutomatically: true,
    checkIntervalMinutes: 60 * 24
  }
};

type Environment = 'development' | 'staging' | 'production';

// Get current environment
export function getCurrentEnvironment(): Environment {
  // In Electron, we can check for environment variables
  if (isElectron()) {
    const envVar = window.electron?.getEnvironment?.() || import.meta.env.MODE;
    if (envVar === 'development' || envVar === 'staging') {
      return envVar;
    }
  }
  
  // For web or production default
  if (import.meta.env.MODE === 'development') {
    return 'development';
  }
  
  return 'production';
}

/**
 * Get update configuration for the current environment
 */
export function getUpdateConfig(): UpdateConfig {
  const env = getCurrentEnvironment();
  return updateConfigs[env];
}

// Local storage key for user preferences
const UPDATE_PREFS_KEY = 'fever_update_preferences';

/**
 * User preferences for updates
 */
export interface UpdatePreferences {
  autoCheck: boolean;
  channel: string;
}

/**
 * Save user update preferences
 */
export function saveUpdatePreferences(prefs: UpdatePreferences): void {
  localStorage.setItem(UPDATE_PREFS_KEY, JSON.stringify(prefs));
}

/**
 * Get user update preferences
 */
export function getUserUpdatePreferences(): UpdatePreferences {
  const env = getCurrentEnvironment();
  const defaultPrefs: UpdatePreferences = {
    autoCheck: updateConfigs[env].checkAutomatically,
    channel: updateConfigs[env].channel
  };
  
  try {
    const savedPrefs = localStorage.getItem(UPDATE_PREFS_KEY);
    if (savedPrefs) {
      return { ...defaultPrefs, ...JSON.parse(savedPrefs) };
    }
  } catch (err) {
    console.error('Failed to parse update preferences:', err);
  }
  
  return defaultPrefs;
}
