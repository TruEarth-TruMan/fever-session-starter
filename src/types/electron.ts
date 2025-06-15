
export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isInput?: boolean;
  isScarlettInterface?: boolean;
  // New universal interface detection properties
  isProfessionalInterface?: boolean;
  deviceScore?: number;
  deviceBrand?: string;
  deviceCategory?: 'professional' | 'prosumer' | 'consumer' | 'builtin';
  deviceFeatures?: string[];
}

declare global {
  interface Window {
    electron?: {
      getAppVersion: () => Promise<string>;
      detectAudioInterfaces?: () => Promise<AudioDevice[]>;
      initializeAudio?: (deviceId: string) => Promise<boolean>;
      getInputLevel?: () => Promise<number>;
      getAppPath?: () => string;
    };
  }
}
