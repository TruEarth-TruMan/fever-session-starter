
/**
 * Application configuration utility
 * Provides access to environment variables and app configuration
 */

import { isElectron, getPlatform } from '@/utils/environment';
import { getAppVersion } from '@/utils/appInfo';

// Environment types
export type AppEnvironment = 'development' | 'production' | 'test';

// Config interface
export interface AppConfig {
  environment: AppEnvironment;
  isElectron: boolean;
  platform: 'mac' | 'windows' | 'linux' | 'web';
  version: string;
  apiEndpoint: string;
  updateServerUrl: string;
  telemetryEnabled: boolean;
  buildDate: string;
  buildNumber: string;
}

// Default config values
const defaultConfig: AppConfig = {
  environment: import.meta.env.MODE === 'development' ? 'development' : 'production',
  isElectron: isElectron(),
  platform: getPlatform(),
  version: '0.0.0',
  apiEndpoint: 'https://api.feverstudio.live',
  updateServerUrl: 'https://feverstudio.live/update',
  telemetryEnabled: import.meta.env.MODE !== 'development',
  buildDate: new Date().toISOString(),
  buildNumber: import.meta.env.VITE_BUILD_NUMBER || '0',
};

/**
 * Gets the application configuration
 * @returns Promise<AppConfig>
 */
export async function getAppConfig(): Promise<AppConfig> {
  // Start with the default config
  const config = { ...defaultConfig };
  
  // Override with Electron-specific values if available
  if (isElectron()) {
    try {
      config.version = await getAppVersion();
    } catch (error) {
      console.error('Failed to get app version:', error);
    }
  }
  
  // Allow for runtime environment variables to override config
  // This could be extended to load from a server or local storage
  
  return config;
}

// Singleton instance for app config
let appConfigInstance: AppConfig | null = null;

/**
 * Initialize the app configuration
 * This should be called early in the app lifecycle
 */
export async function initAppConfig(): Promise<AppConfig> {
  if (!appConfigInstance) {
    appConfigInstance = await getAppConfig();
    console.log('App config initialized:', appConfigInstance);
  }
  return appConfigInstance;
}

/**
 * Get the current app configuration
 * @returns AppConfig
 */
export function useAppConfig(): AppConfig {
  if (!appConfigInstance) {
    console.warn('App config not initialized! Using default values.');
    return defaultConfig;
  }
  return appConfigInstance;
}
