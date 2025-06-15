
export interface DeviceScore {
  score: number;
  category: 'professional' | 'prosumer' | 'consumer' | 'builtin';
  brand: string;
  features: string[];
}

// Known professional audio interface brands and models
const PROFESSIONAL_BRANDS = [
  'focusrite', 'scarlett', 'clarett', 'saffire',
  'presonus', 'audiobox', 'studio',
  'motu', 'ultralite', 'traveler',
  'rme', 'fireface', 'babyface',
  'universal audio', 'apollo',
  'steinberg', 'ur22', 'ur44', 'ur824',
  'behringer', 'uphoria', 'u-phoria',
  'zoom', 'podtrak', 'livetrak',
  'tascam', 'mixcast',
  'roland', 'rubix', 'quad-capture',
  'mackie', 'onyx',
  'arturia', 'audiofuse'
];

const PROSUMER_BRANDS = [
  'blue', 'yeti', 'snowball',
  'audio-technica', 'at2020usb',
  'samson', 'go mic',
  'rode', 'podcaster', 'podmic'
];

export function classifyAudioDevice(deviceName: string): DeviceScore {
  const nameLower = deviceName.toLowerCase();
  let score = 0;
  let category: DeviceScore['category'] = 'builtin';
  let brand = 'Unknown';
  const features: string[] = [];

  // Check for professional interfaces
  for (const brandTerm of PROFESSIONAL_BRANDS) {
    if (nameLower.includes(brandTerm)) {
      score += 90;
      category = 'professional';
      brand = brandTerm.charAt(0).toUpperCase() + brandTerm.slice(1);
      features.push('Professional Grade');
      
      // Bonus points for specific high-end models
      if (nameLower.includes('scarlett') || nameLower.includes('clarett')) {
        score += 10;
        brand = 'Focusrite';
      }
      if (nameLower.includes('apollo') || nameLower.includes('twin')) {
        score += 15;
        brand = 'Universal Audio';
      }
      if (nameLower.includes('rme') || nameLower.includes('fireface')) {
        score += 12;
        brand = 'RME';
      }
      break;
    }
  }

  // Check for prosumer devices
  if (score === 0) {
    for (const brandTerm of PROSUMER_BRANDS) {
      if (nameLower.includes(brandTerm)) {
        score += 60;
        category = 'prosumer';
        brand = brandTerm.charAt(0).toUpperCase() + brandTerm.slice(1);
        features.push('USB Microphone');
        break;
      }
    }
  }

  // Check for USB indicators (if not already classified)
  if (score === 0 && nameLower.includes('usb')) {
    score += 30;
    category = 'consumer';
    features.push('USB Audio');
  }

  // Check for multiple channels/inputs
  if (nameLower.includes('2i2') || nameLower.includes('4i4') || nameLower.includes('8i6')) {
    score += 20;
    features.push('Multi-Channel');
  }

  // Check for ASIO support indicators
  if (nameLower.includes('asio') || nameLower.includes('low latency')) {
    score += 15;
    features.push('Low Latency');
  }

  // Penalize built-in/generic devices
  if (nameLower.includes('realtek') || nameLower.includes('built-in') || 
      nameLower.includes('default') || nameLower.includes('primary')) {
    score = Math.max(0, score - 30);
    category = 'builtin';
    brand = 'System';
    features.push('Built-in Audio');
  }

  return {
    score: Math.min(100, score),
    category,
    brand,
    features
  };
}

export function getDeviceRecommendation(device: DeviceScore): string {
  switch (device.category) {
    case 'professional':
      return `Excellent choice! ${device.brand} interfaces are perfect for professional recording.`;
    case 'prosumer':
      return `Good quality device. ${device.brand} will work well for most recording needs.`;
    case 'consumer':
      return 'Decent USB audio device detected. Should work for basic recording.';
    case 'builtin':
      return 'Using system audio. Consider a dedicated audio interface for better quality.';
    default:
      return 'Audio device detected.';
  }
}
