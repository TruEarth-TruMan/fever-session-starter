
import { AudioDevice } from './types'; // if needed

export async function getAudioDevices(): Promise<AudioDevice[]> {
  console.warn('Audio device detection should be done in the renderer process using navigator.mediaDevices.enumerateDevices()');

  // Optionally return a placeholder or empty array
  return [
    {
      id: '1',
      name: 'Scarlett 2i2',
      type: 'input',
      isScarlettInterface: true
    },
    {
      id: '2',
      name: 'Scarlett 2i2',
      type: 'output',
      isScarlettInterface: true
    }
  ];
}
