
import { AudioDevice } from '@/types/electron';
import type { AudioDevice as ConfigAudioDevice } from '@/hooks/useAudioDeviceConfig';
import { classifyAudioDevice } from './deviceClassification';

/**
 * Detects audio devices using the browser's MediaDevices API
 * This is a renderer-side replacement for Electron's desktopCapturer
 * @returns Promise<AudioDevice[]> Array of detected audio devices
 */
export async function getAudioDevices(): Promise<ConfigAudioDevice[]> {
  try {
    // Check if we're in Electron with access to IPC
    if (window.electron?.detectAudioInterfaces) {
      // Use Electron's IPC for audio interface detection if available
      const devices = await window.electron.detectAudioInterfaces();
      
      // Convert Electron AudioDevice to ConfigAudioDevice format with classification
      return devices.map(device => {
        const classification = classifyAudioDevice(device.name);
        return {
          id: device.id,
          name: device.name,
          type: device.isInput ? 'input' : 'output',
          isScarlettInterface: device.name.toLowerCase().includes('scarlett') || device.name.toLowerCase().includes('focusrite'),
          isProfessionalInterface: classification.category === 'professional',
          deviceScore: classification.score,
          deviceBrand: classification.brand,
          deviceCategory: classification.category,
          deviceFeatures: classification.features
        };
      });
    }
    
    // Fallback to browser MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('MediaDevices API not supported in this browser');
      return [];
    }
    
    // Get all media devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter and map to our AudioDevice interface
    const audioDevices: ConfigAudioDevice[] = devices
      .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
      .map(device => {
        const isInput = device.kind === 'audioinput';
        const deviceName = device.label || (isInput ? `Microphone ${device.deviceId.slice(0, 5)}...` : `Speaker ${device.deviceId.slice(0, 5)}...`);
        const classification = classifyAudioDevice(deviceName);
        
        return {
          id: device.deviceId,
          name: deviceName,
          type: isInput ? 'input' : 'output',
          // Legacy support for Scarlett-specific detection
          isScarlettInterface: deviceName.toLowerCase().includes('scarlett') || deviceName.toLowerCase().includes('focusrite'),
          // New universal classification
          isProfessionalInterface: classification.category === 'professional',
          deviceScore: classification.score,
          deviceBrand: classification.brand,
          deviceCategory: classification.category,
          deviceFeatures: classification.features
        };
      })
      // Sort by score (highest first) to prioritize better devices
      .sort((a, b) => (b.deviceScore || 0) - (a.deviceScore || 0));
      
    return audioDevices;
  } catch (error) {
    console.error('Error detecting audio devices:', error);
    return [];
  }
}
