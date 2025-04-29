
import { AudioDevice } from '@/hooks/useAudioDeviceConfig';

/**
 * Detects audio devices using the browser's MediaDevices API
 * This is a renderer-side replacement for Electron's desktopCapturer
 * @returns Promise<AudioDevice[]> Array of detected audio devices
 */
export async function getAudioDevices(): Promise<AudioDevice[]> {
  try {
    // Check if we're in Electron with access to IPC
    if (window.electron?.detectAudioInterfaces) {
      // Use Electron's IPC for audio interface detection if available
      return await window.electron.detectAudioInterfaces();
    }
    
    // Fallback to browser MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('MediaDevices API not supported in this browser');
      return [];
    }
    
    // Get all media devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter and map to our AudioDevice interface
    const audioDevices: AudioDevice[] = devices
      .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
      .map(device => {
        const isInput = device.kind === 'audioinput';
        const deviceName = device.label || (isInput ? `Microphone ${device.deviceId.slice(0, 5)}...` : `Speaker ${device.deviceId.slice(0, 5)}...`);
        
        return {
          id: device.deviceId,
          name: deviceName,
          type: isInput ? 'input' : 'output',
          // Check if it's a Scarlett interface by name
          isScarlettInterface: deviceName.toLowerCase().includes('scarlett') || deviceName.toLowerCase().includes('focusrite')
        };
      });
      
    return audioDevices;
  } catch (error) {
    console.error('Error detecting audio devices:', error);
    return [];
  }
}
