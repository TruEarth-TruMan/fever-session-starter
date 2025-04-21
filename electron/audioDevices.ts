
import { desktopCapturer } from 'electron';

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isScarlettInterface: boolean;
}

export async function getAudioDevices(): Promise<AudioDevice[]> {
  try {
    const sources = await desktopCapturer.getSources({ types: ['audio'] });
    
    const devices = sources.map(source => {
      const device: AudioDevice = {
        id: source.id,
        name: source.name,
        type: source.name.toLowerCase().includes('microphone') ? 'input' : 'output',
        isScarlettInterface: source.name.toLowerCase().includes('scarlett')
      };
      return device;
    });

    return devices;
  } catch (error) {
    console.error('Error getting audio devices:', error);
    return [];
  }
}

