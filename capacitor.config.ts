
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.feverstudio.app',
  appName: 'Fever',
  webDir: 'dist',
  server: {
    url: 'https://2791a190-3f01-49a9-aab3-e0f06ac27b1e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    scheme: 'Fever',
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: "#121212"
  }
};

export default config;
