
/**
 * Check if the application is running in an Electron environment
 * @returns boolean True if running in Electron
 */
export function isElectron(): boolean {
  // Check if window.electron exists
  if (typeof window !== 'undefined' && window.electron) {
    return true;
  }
  
  // Alternative detection methods
  if (typeof navigator === 'object' && 
      typeof navigator.userAgent === 'string' && 
      navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  
  return false;
}

/**
 * Get the platform the app is running on
 * @returns 'mac' | 'windows' | 'linux' | 'web'
 */
export function getPlatform(): 'mac' | 'windows' | 'linux' | 'web' {
  if (!isElectron()) {
    return 'web';
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('mac')) {
    return 'mac';
  } else if (userAgent.includes('windows')) {
    return 'windows';
  } else if (userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'web';
}
