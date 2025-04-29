
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
  telemetryEnabled: boolean;
  betaUserIdentifier?: string;
}

// Environment-specific update configurations
const updateConfigs = {
  development: {
    serverUrl: 'http://localhost:3000/update',
    channel: 'dev',
    checkAutomatically: true,
    checkIntervalMinutes: 5,
    telemetryEnabled: false
  },
  staging: {
    serverUrl: 'https://staging.feverstudio.live/update',
    channel: 'beta',
    checkAutomatically: true,
    checkIntervalMinutes: 60,
    telemetryEnabled: true
  },
  production: {
    serverUrl: 'https://feverstudio.live/update',
    channel: 'latest',
    checkAutomatically: true,
    checkIntervalMinutes: 60 * 24,
    telemetryEnabled: true
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
  const config = { ...updateConfigs[env] };
  
  // Add beta user identifier if available in local storage
  const betaId = localStorage.getItem('fever_beta_user_id');
  if (betaId) {
    config.betaUserIdentifier = betaId;
  }
  
  return config;
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

/**
 * Set beta user identifier for update tracking
 * @param id Unique identifier for beta tester
 */
export function setBetaUserId(id: string): void {
  localStorage.setItem('fever_beta_user_id', id);
}

/**
 * Get beta user identifier if available
 */
export function getBetaUserId(): string | null {
  return localStorage.getItem('fever_beta_user_id');
}

