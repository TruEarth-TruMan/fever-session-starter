
/**
 * Utility functions for app information and telemetry
 */

/**
 * Get the application version
 * @returns The application version string
 */
export async function getAppVersion(): Promise<string> {
  try {
    if (window.electron?.getAppVersion) {
      return await window.electron.getAppVersion();
    }
    
    // Fallback for web environment
    return 'web-version';
  } catch (error) {
    console.error('Error getting app version:', error);
    return 'unknown';
  }
}

/**
 * Log telemetry data
 * @param data Telemetry data to log
 * @returns Whether the telemetry was logged successfully
 */
export async function logTelemetry(data: Record<string, any>): Promise<boolean> {
  try {
    if (window.electron?.logTelemetry) {
      return await window.electron.logTelemetry(data);
    }
    
    // Fallback for web environment
    console.log('[Web Telemetry]', data);
    return true;
  } catch (error) {
    console.error('Error logging telemetry:', error);
    return false;
  }
}
